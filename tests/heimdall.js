import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { Promise, defer } from 'rsvp';

import Session from '../src/session';
import Heimdall from '../src/heimdall';

const { expect } = chai;

chai.use(chaiAsPromised);

let heimdall;

function getJSONSansTime() {
  let json = heimdall.toJSON();
  for (let i=0; i<json.nodes.length; ++i) {
    delete json.nodes[i].stats.time;
  }
  return json;
}

describe('heimdall', function() {
  beforeEach(function () {
    heimdall = new Heimdall();
  });

  it('creates a new session if none is provided', function() {
    let h1 = new Heimdall();
    let h2 = new Heimdall();

    h1.start('a');
    h2.start('b');

    expect(h1._session).to.not.equal(h2._session);
    expect(h1.current).to.not.equal(h2.current);
    expect(h1.root).to.not.equal(h2.root);

    expect(h1.stack).to.eql(['a']);
    expect(h2.stack).to.eql(['b']);
  });

  it('uses a provided session', function() {
    let session = new Session();

    let h1 = new Heimdall(session);

    let root = session.root;

    h1.start('a');

    let h2 = new Heimdall(session);

    h2.start('b');

    expect(session.root).to.equal(root);

    expect(h1._session).to.equal(h2._session);
    expect(h1.current).to.equal(h2.current);
    expect(h1.root).to.equal(h2.root);

    expect(h1.stack).to.eql(['a', 'b']);
    expect(h2.stack).to.eql(['a', 'b']);
  });

  describe('with nodes from multiple heimdall instances', function() {
    let origHRTime;
    let nextTime;

    beforeEach( function() {
      origHRTime = process.hrtime;
      nextTime = [0, 0];
      process.hrtime = function () { return nextTime; };
    });

    afterEach( function() {
      process.hrtime = origHRTime;
    });

    it('sets time correctly over shared sessions', function() {
      let session = new Session();
      let h1 = new Heimdall(session);
      let h2 = new Heimdall(session);

      let cookieA = h1.start('a');

      nextTime = [1, 10];
      let cookieB = h2.start('b');

      nextTime = [2, 20];
      cookieB.stop();

      nextTime = [4, 40];
      cookieA.stop();

      expect(cookieB._node.stats.time.self).to.equal(1e9 + 10);
      // total A self time is time before B and time after B
      expect(cookieA._node.stats.time.self).to.equal(1e9 + 10 + 2e9 + 20);
    });
  });

  describe('.node', function() {
    it('implicitly stops the cookie when the promise resolves', function () {
      let callbackInvoked = false;

      expect(heimdall.stack).to.eql([]);

      return heimdall.node('node-a', function () {
        callbackInvoked = true;
        expect(heimdall.stack).to.eql(['node-a']);
      }).finally(function () {
        expect(callbackInvoked).to.equal(true);
        expect(heimdall.stack).to.eql([]);
      });
    });

    it('implicitly stops the cookie when the promise resolves for a nested graph', function () {
      expect(heimdall.stack).to.eql([]);

      return heimdall.node('node-a', function () {
        expect(heimdall.stack).to.eql(['node-a']);

        let nodeB = heimdall.node('node-b', function() {
          expect(heimdall.stack).to.eql(['node-a', 'node-b']);
        });

        expect(heimdall.stack).to.eql(['node-a', 'node-b']);

        return nodeB;
      }).finally(function () {
        expect(heimdall.stack).to.eql([]);
      });
    });

    it('throws when child nodes escape their parent', function () {
      expect(heimdall.stack).to.eql([]);

      let deferA = defer();
      let nodeA = heimdall.node('node-a', function () {
        return deferA.promise;
      });

      expect(heimdall.stack).to.eql(['node-a']);

      let deferB = defer();
      let nodeB = heimdall.node('node-b', function () {
        return deferB.promise;
      });

      deferA.resolve();

      return expect(nodeA).to.eventually.be.rejectedWith('cannot stop: not the current node');
    });
  });

  describe('.start/stop/resume', function() {
    it('supports basic start/stop', function() {
      expect(heimdall.stack).to.eql([]);

      let cookieA = heimdall.start({ name: 'node-a' });
      expect(heimdall.stack).to.eql(['node-a']);

      let cookieB = heimdall.start({ name: 'node-b'});
      expect(heimdall.stack).to.eql(['node-a', 'node-b']);

      cookieB.stop();
      expect(heimdall.stack).to.eql(['node-a']);

      cookieA.stop();
      expect(heimdall.stack).to.eql([]);
    });

    it('supports simple name shorthand', function () {
      expect(heimdall.stack).to.eql([]);

      let cookieA = heimdall.start('node-a');
      expect(heimdall.stack).to.eql(['node-a']);

      cookieA.stop();
      expect(heimdall.stack).to.eql([]);
    });

    it('supports resume', function () {
      expect(heimdall.stack).to.eql([]);

      let cookieA = heimdall.start({ name: 'node-a' });
      expect(heimdall.stack).to.eql(['node-a']);

      let cookieB = heimdall.start({ name: 'node-b'});
      expect(heimdall.stack).to.eql(['node-a', 'node-b']);

      cookieB.stop();
      expect(heimdall.stack).to.eql(['node-a']);

      cookieB.resume();
      expect(heimdall.stack).to.eql(['node-a', 'node-b']);

      cookieB.stop();
      expect(heimdall.stack).to.eql(['node-a']);

      cookieA.stop();
      expect(heimdall.stack).to.eql([]);
    });

    it('counts selftime', function() {
      let A = heimdall.start('A');
      let B = heimdall.start('B');
      let C;

      function wait(ms) {
        return new Promise((resolve, reject) => setTimeout(resolve, ms));
      }

      return wait(5).
        then(() => C = heimdall.start('C')).
        then(() => wait(10)).
        then(() => C.stop()).
        then(() => B.stop()).
        then(() => A.stop()).
        then(function () {
          let aNode = heimdall._session.root._children[0];
          let aTime = aNode.stats.time.self;

          let bNode = aNode._children[0];
          let bTime = bNode.stats.time.self;

          let cNode = bNode._children[0];
          let cTime = cNode.stats.time.self;

          // Expected times should be
          // A - 0 ms
          // B - 5 ms
          // C - 10 ms
          //
          // Gaps are added b/c of setTimeout, hrtime issues on vm (ie in ci)

          expect(cTime).to.be.within(9.5 * 1e6, 15 * 1e6);
          expect(bTime).to.be.within(4.5 * 1e6, 10 * 1e6);
          expect(aTime).to.be.lt(500 * 1e3);
        });
    });

    it('restores the node at time of resume', function () {
      expect(heimdall.stack).to.eql([]);

      let cookieA = heimdall.start('node-a');
      expect(heimdall.stack).to.eql(['node-a']);

      let cookieB = heimdall.start('node-b');
      expect(heimdall.stack).to.eql(['node-a', 'node-b']);

      cookieB.stop();
      expect(heimdall.stack).to.eql(['node-a']);

      let cookieC = heimdall.start('node-c');
      expect(heimdall.stack).to.eql(['node-a', 'node-c']);

      cookieB.resume();
      expect(heimdall.stack).to.eql(['node-a', 'node-b']);

      cookieB.stop();
      expect(heimdall.stack).to.eql(['node-a', 'node-c']);

      cookieC.stop();
      expect(heimdall.stack).to.eql(['node-a']);

      cookieA.stop();
      expect(heimdall.stack).to.eql([]);
    });

    it('throws if stop is called when stopped', function () {
      let cookieA = heimdall.start({ name: 'node-a' });

      cookieA.stop();

      expect(function () {
        cookieA.stop();
      }).to.throw('cannot stop: not the current node');
    });

    it('throws if resume is called when not stopped', function () {
      let cookieA = heimdall.start({ name: 'node-a' });

      expect(function () {
        cookieA.resume();
      }).to.throw('cannot resume: not stopped');
    });
  });

  describe('toJSON', function () {
    class SchemaA {
      constructor() {
        this.count = 0;
      }
    }

    class SchemaB {
      constructor() {
        this.statA = 0;
        this.statB = 0;
      }
    }

    it('always includes time', function() {
      return heimdall.node('node-a', function () {}).then(function () {
        let json = heimdall.toJSON();
        let nodeA;
        for (let i=0; i<json.nodes.length; ++i) {
          if (json.nodes[i].id.name === 'node-a') {
            nodeA = json.nodes[i];
            break;
          }
        }

        expect(nodeA).to.not.eql(undefined);
        expect(typeof nodeA.stats.time).to.eql('object');
      });
    });

    it('reports node-specific stats for an individual node', function () {
      return expect(heimdall.node('node-a', SchemaA, function (h) {
        h.count = 6;
      }).then(getJSONSansTime)).to.eventually.deep.equal({
        nodes: [
          {
            _id: 0,
            id: {
              name: 'heimdall',
            },
            stats: {
              own: { },
            },
            children: [1],
          },
          {
            _id: 1,
            id: {
              name: 'node-a',
            },
            stats: {
              own: {
                count: 6,
              },
            },
            children: [],
          }
        ]
      });
    });

    it('reports node-specific stats for a graph', function (){
      return expect(heimdall.node('node-a', SchemaA, function (h) {
        h.count = 1;
        return heimdall.node('node-b', SchemaB, function (h) {
          h.statA = 2;
          h.statB = 4;
          return heimdall.node('node-b2', SchemaB, function (h) {
            h.statA = 8;
            h.statB = 16;
          });
        }).then(function () {
          return heimdall.node('node-b', SchemaB, function (h) {
            h.statA = 32;
            h.statB = 64;
          });
        });
      }).then(getJSONSansTime)).to.eventually.deep.equal({
        nodes: [
          {
            _id: 0,
            id: {
              name: "heimdall"
            },
            stats: {
              own: {}
            },
            children: [1],
          },
          {
            _id: 1,
            id: {
              name: "node-a"
            },
            stats: {
              own: {
                count: 1
              }
            },
            children: [2,4],
          },

          {
            _id: 2,
            id: {
              name: "node-b"
            },
            stats: {
              own: {
                statA: 2,
                statB: 4
              }
            },
            children: [3],
          },
          {
            _id: 3,
            id: {
              name: "node-b2"
            },
            stats: {
              own: {
                statA: 8,
                statB: 16
              }
            },
            children: []
          },
          {
            _id: 4,
            id: {
              name: "node-b"
            },
            stats: {
              own: {
                statA: 32,
                statB: 64
              }
            },
            children: []
          }
        ]
      });
    });
  });

  describe('.statsFor', function () {
    it('throws if no schema is registered for the given name', function () {
      heimdall.registerMonitor('valid', function Schema() {});

      let stats = heimdall.statsFor('valid');

      expect(typeof stats).to.equal('object');

      expect(function () {
        heimdall.statsFor('something completely different');
      }).to.throw('No monitor registered for "something completely different"');
    });
  });

  describe('.configFor', function() {
    it('returns a config bucket for the given name', function() {
      expect(heimdall.configFor('logging')).to.deep.equal({});
    });

    it('returns the same config each time for a given name', function() {
      let logConfig = heimdall.configFor('logging');

      logConfig.depth = 30;

      expect(heimdall.configFor('logging')).to.equal(heimdall.configFor('logging'));
      expect(heimdall.configFor('logging').depth).to.equal(30);
    });
  });

  describe('monitors', function() {
    class MonitorSchema {
      constructor() {
        this.mstatA = 0;
        this.mstatB = 0;
      }
    }

    let counter;

    function monitorEvent() {
      counter++;
      let stats = heimdall.statsFor('my-monitor');

      stats.mstatA = counter;
      stats.mstatB = counter * 10;
    }

    beforeEach(function () {
      counter = 0;
    });

    it('throws if another schema is registered at the given namespace', function () {
      class MySchema {}

      heimdall.registerMonitor('some-monitor', MySchema);
      expect(function () {
        heimdall.registerMonitor('some-monitor', MySchema);
      }).to.throw('A monitor for "some-monitor" is already registered');
    });

    it('throws if using the reserved namespaces own or time', function() {
      expect(function () {
        heimdall.registerMonitor('own', function MySchema() {});
      }).to.throw('Cannot register monitor at namespace "own".  "own" and "time" are reserved');

      expect(function () {
        heimdall.registerMonitor('time', function MySchema() {});
      }).to.throw('Cannot register monitor at namespace "time".  "own" and "time" are reserved');
    });

    it('records stats for each node', function() {
      heimdall.registerMonitor('my-monitor', MonitorSchema);

      return expect(heimdall.node('node-a', function () {
        return heimdall.node('node-b', function () {
          monitorEvent();
        }).then(monitorEvent);
      }).then(function () {
        return heimdall.node('node-c', function () {
          monitorEvent();
        });
      }).then(getJSONSansTime)).to.eventually.deep.equal({
        nodes: [{
          _id: 0,
          id: { name: 'heimdall' },
          stats: { own: {}, },
          children: [1, 3],
        }, {
          _id: 1,
          id: { name: 'node-a' },
          stats: {
            own: {},
            'my-monitor': {
              mstatA: 2,
              mstatB: 20,
            },
          },
          children: [2],
        }, {
          _id: 2,
          id: { name: 'node-b' },
          stats: {
            own: {},
            'my-monitor': {
              mstatA: 1,
              mstatB: 10,
            },
          },
          children: [],
        }, {
          _id: 3,
          id: { name: 'node-c' },
          stats: {
            own: {},
            'my-monitor': {
              mstatA: 3,
              mstatB: 30,
            },
          },
          children: [],
        }],
      });
    });
  });
});
