var chai = require('chai'), expect = chai.expect;
var chaiAsPromised = require('chai-as-promised');
var chaiFiles = require('chai-files'), file = chaiFiles.file;
var RSVP = require('rsvp');
var heimdall = require('../');

chai.use(chaiAsPromised);
chai.use(chaiFiles);

function getJSONSansTime() {
  var json = heimdall.toJSON();
  for (var i=0; i<json.nodes.length; ++i) {
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
      var callbackInvoked = false;

      expect(heimdall.stack).to.eql([]);

      return heimdall.node('node-a', function () {
        callbackInvoked = true;
        expect(heimdall.stack).to.eql(['node-a']);
      }).finally(function () {
        expect(callbackInvoked).to.equal(true);
        expect(heimdall.stack).to.eql([]);
      });
    });

    it('implicitly stops the cookie when the promise resolves', function () {
      expect(heimdall.stack).to.eql([]);

      return heimdall.node('node-a', function () {
        expect(heimdall.stack).to.eql(['node-a']);

        var nodeB = heimdall.node('node-b', function() {
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

      var deferA = RSVP.defer();
      var nodeA = heimdall.node('node-a', function () {
        return deferA.promise;
      });

      expect(heimdall.stack).to.eql(['node-a']);

      var deferB = RSVP.defer();
      var nodeB = heimdall.node('node-b', function () {
        return deferB.promise;
      });

      deferA.resolve();

      return expect(nodeA).to.eventually.be.rejectedWith('cannot stop: not the current node');
    });
  });

  describe('.start/stop/resume', function() {
    it('supports basic start/stop', function() {
      expect(heimdall.stack).to.eql([]);

      var cookieA = heimdall.start({ name: 'node-a' });
      expect(heimdall.stack).to.eql(['node-a']);

      var cookieB = heimdall.start({ name: 'node-b'});
      expect(heimdall.stack).to.eql(['node-a', 'node-b']);

      cookieB.stop();
      expect(heimdall.stack).to.eql(['node-a']);

      cookieA.stop();
      expect(heimdall.stack).to.eql([]);
    });

    it('supports simple name shorthand', function () {
      expect(heimdall.stack).to.eql([]);

      var cookieA = heimdall.start('node-a');
      expect(heimdall.stack).to.eql(['node-a']);

      cookieA.stop();
      expect(heimdall.stack).to.eql([]);
    });

    it('supports resume', function () {
      expect(heimdall.stack).to.eql([]);

      var cookieA = heimdall.start({ name: 'node-a' });
      expect(heimdall.stack).to.eql(['node-a']);

      var cookieB = heimdall.start({ name: 'node-b'});
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

      var cookieA = heimdall.start('node-a');
      expect(heimdall.stack).to.eql(['node-a']);

      var cookieB = heimdall.start('node-b');
      expect(heimdall.stack).to.eql(['node-a', 'node-b']);

      cookieB.stop();
      expect(heimdall.stack).to.eql(['node-a']);

      var cookieC = heimdall.start('node-c');
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
      var cookieA = heimdall.start({ name: 'node-a' });

      cookieA.stop();

      expect(function () {
        cookieA.stop();
      }).to.throw('cannot stop: not the current node');
    });

    it('throws if resume is called when not stopped', function () {
      var cookieA = heimdall.start({ name: 'node-a' });

      expect(function () {
        cookieA.resume();
      }).to.throw('cannot resume: not stopped');
    });
  });

  describe('toJSON', function () {
    function SchemaA() {
      this.count = 0;
    }

    function SchemaB() {
      this.statA = 0;
      this.statB = 0;
    }

    it('always includes time', function() {
      return heimdall.node('node-a', function () {}).then(function () {
        var json = heimdall.toJSON();
        var nodeA;
        for (var i=0; i<json.nodes.length; ++i) {
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

      var stats = heimdall.statsFor('valid');

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
      var logConfig = heimdall.configFor('logging');

      logConfig.depth = 30;

      expect(heimdall.configFor('logging')).to.equal(heimdall.configFor('logging'));
      expect(heimdall.configFor('logging').depth).to.equal(30);
    });
  });

  describe('nodes', function() {
    function nodeNames() {
      var count = 0;
      var names = [];

      heimdall.visitPreOrder(function (node) {
        names.push(node.id.name);
      });

      // ignore root
      return names.slice(1).join(' ');
    }

    describe('.remove', function() {
      describe('for the root node', function() {
        it('throws an error', function() {
          expect(function () {
            expect(heimdall.current.isRoot).to.equal(true);
            heimdall.current.remove();
          }).to.throw('Cannot remove the root heimdalljs node.');
        });
      });

      describe('for non-root nodes', function() {
        it('frees the node from its parent', function() {
          expect(nodeNames()).to.equal('');

          var cookieA = heimdall.start('a');
          var cookieAA = heimdall.start('aa');

          expect(nodeNames()).to.equal('a aa');

          cookieAA.stop();

          expect(nodeNames()).to.equal('a aa');

          expect(cookieAA.node.remove()).to.equal(cookieAA.node);

          expect(nodeNames()).to.equal('a');
        });
      });

      // Really this is an error for any active node (ie path from current ->
      // root
      //
      // A case could be made it's an error for any node with an outstanding
      // cookie
      describe('for the current node', function() {
        it('throws an error', function() {
          var cookie = heimdall.start('node');
          expect(function () {
            cookie.node.remove();
          }).to.throw('Cannot remove an active heimdalljs node.');
        });
      });
    });
  });

  describe('monitors', function() {
    function MonitorSchema() {
      this.mstatA = 0;
      this.mstatB = 0;
    }

    var counter;

    function monitorEvent() {
      counter++;
      var stats = heimdall.statsFor('my-monitor');

      stats.mstatA = counter;
      stats.mstatB = counter * 10;
    }

    beforeEach(function () {
      counter = 0;
    });

    it('throws if another schema is registered at the given namespace', function () {
      function MySchema() {}

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
