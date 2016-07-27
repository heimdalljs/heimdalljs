import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { Promise, defer } from 'rsvp';
import heimdall from '../';

const { expect } = chai;

chai.use(chaiAsPromised);

function getJSONSansTime() {
  let json = heimdall.toJSON();
  for (let i=0; i<json.nodes.length; ++i) {
    delete json.nodes[i].stats.time;
  }
  return json;
}

describe('heimdall', function() {
  beforeEach(function () {
    heimdall._reset();
  });

  describe('logging', function() {
    describe('log', function() { });
    describe('log.verbose', function() { });
  });

  describe('.node', function() {
    it('implicitly stops the cookie when the promise resolves', function () {
      let callbackInvoked = false;

      expect(heimdall.stack).to.eql([]);

      return heimdall.node('node-a', () => {
        callbackInvoked = true;
        expect(heimdall.stack).to.eql(['node-a']);
      }).finally(() => {
        expect(callbackInvoked).to.equal(true);
        expect(heimdall.stack).to.eql([]);
      });
    });

    it('implicitly stops the cookie when the promise resolves', function () {
      expect(heimdall.stack).to.eql([]);

      return heimdall.node('node-a', () => {
        expect(heimdall.stack).to.eql(['node-a']);

        let nodeB = heimdall.node('node-b', () => {
          expect(heimdall.stack).to.eql(['node-a', 'node-b']);
        });

        expect(heimdall.stack).to.eql(['node-a', 'node-b']);

        return nodeB;
      }).finally(() => expect(heimdall.stack).to.eql([]));
    });

    it('throws when child nodes escape their parent', function () {
      expect(heimdall.stack).to.eql([]);

      let deferA = defer();
      let nodeA = heimdall.node('node-a',  () => deferA.promise);

      expect(heimdall.stack).to.eql(['node-a']);

      let deferB = defer();
      let nodeB = heimdall.node('node-b', () => deferB.promise);

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

      expect(() => cookieA.stop()).to.throw('cannot stop: not the current node');
    });

    it('throws if resume is called when not stopped', function () {
      let cookieA = heimdall.start({ name: 'node-a' });

      expect(() => cookieA.resume()).to.throw('cannot resume: not stopped');
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
      return heimdall.node('node-a', () => {}).then(() => {
        let json = heimdall.toJSON();
        let nodeA = json.nodes.find(n => n.id.name === 'node-a');

        expect(nodeA).to.not.eql(undefined);
        expect(typeof nodeA.stats.time).to.eql('object');
      });
    });

    it('reports node-specific stats for an individual node', function () {
      return expect(heimdall.node('node-a', SchemaA, h => {
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
      return expect(heimdall.node('node-a', SchemaA, h => {
        h.count = 1;
        return heimdall.node('node-b', SchemaB, h => {
          h.statA = 2;
          h.statB = 4;
          return heimdall.node('node-b2', SchemaB, h => {
            h.statA = 8;
            h.statB = 16;
          });
        }).then(() => {
          return heimdall.node('node-b', SchemaB, h => {
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
      heimdall.registerMonitor('valid',  class Schema {});

      let stats = heimdall.statsFor('valid');

      expect(typeof stats).to.equal('object');

      expect(() => {
        heimdall.statsFor('something completely different');
      }).to.throw('No monitor registered for "something completely different"');
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

    beforeEach(() => counter = 0);

    it('throws if another schema is registered at the given namespace', function () {
      class MySchema {}

      heimdall.registerMonitor('some-monitor', MySchema);
      expect(() => {
        heimdall.registerMonitor('some-monitor', MySchema);
      }).to.throw('A monitor for "some-monitor" is already registered');
    });

    it('throws if using the reserved namespaces own or time', function() {
      expect(() => {
        heimdall.registerMonitor('own', class MySchema {});
      }).to.throw(/Cannot register monitor at namespace "own"/);

      expect(() => {
        heimdall.registerMonitor('time', class MySchema {});
      }).to.throw(/Cannot register monitor at namespace "time"/);
    });

    it('records stats for each node', function() {
      heimdall.registerMonitor('my-monitor', MonitorSchema);

      return expect(heimdall.node('node-a', () => {
        return heimdall.node('node-b',  monitorEvent).then(monitorEvent);
      }).then(() => {
        return heimdall.node('node-c', monitorEvent);
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
