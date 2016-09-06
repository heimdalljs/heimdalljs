import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { Promise, defer } from 'rsvp';

import Session from '../../src/runtime/session';
import Heimdall from '../../src/runtime';
import Tree from '../../src/heimdall-tree';

import mockHRTime from '../mock/hrtime';

const { expect } = chai;

chai.use(chaiAsPromised);

let heimdall;
let tree;

function getJSONSansTime() {
  let json = tree.toJSON();
  for (let i=0; i<json.nodes.length; ++i) {
    delete json.nodes[i].stats.time;
  }
  return json;
}

describe('heimdall', function() {

  beforeEach(function () {
    heimdall = new Heimdall();
    tree = new Tree(heimdall);
  });

  it('creates a new session if none is provided', function() {
    let h1 = new Heimdall();
    let h2 = new Heimdall();

    h1.start('a');
    h2.start('b');

    expect(h1._session).to.not.equal(h2._session);
    expect(h1._events).to.not.equal(h2._events);
    expect(h1._monitors).to.not.equal(h2._monitors);
    expect(h1._events.get(0)[1]).to.equal('a');
    expect(h2._events.get(0)[1]).to.equal('b');
  });

  it('uses a provided session', function() {
    let session = new Session();
    let h1 = new Heimdall(session);
    let h2 = new Heimdall(session);

    h1.start('a');
    h2.start('b');

    expect(h1._session).to.equal(h2._session);
    expect(h1._events).to.equal(h2._events);
    expect(h1._monitors).to.equal(h2._monitors);

    expect(h1._events.get(0)[1]).to.eql('a');
    expect(h1._events.get(4)[1]).to.eql('b');
  });

  describe('with nodes from multiple heimdall instances', function() {
    let clock;

    beforeEach( function() {
      clock = mockHRTime();
    });

    afterEach( function() {
      clock.restore();
    });

    it('sets time correctly over shared sessions', function() {
      let session = new Session();
      let h1 = new Heimdall(session);
      let h2 = new Heimdall(session);
      tree._heimdall = h1;

      let tokenA = h1.start('a');

      clock.tick(1, 10);
      let tokenB = h2.start('b');

      clock.tick(1, 10);
      h2.stop(tokenB);

      clock.tick(1, 10);
      h1.stop(tokenA);

      tree.construct();

      let nodeA = tree.root.nodes[0];
      let nodeB = nodeA.nodes[0];

      let statsA = nodeA.stats;
      let statsB = nodeB.stats;

      // total A self time is time before B and time after B
      expect(statsA.self.selfTime).to.equal(2e9 + 20);
      expect(statsB.self.selfTime).to.equal(1e9 + 10);
    });
  });

  describe('.start/stop/resume', function() {
    describe('timing', function() {
      let clock;

      beforeEach( function() {
        heimdall._session.init();
        tree.root = null;
        tree._heimdall = heimdall;
        clock = mockHRTime();
      });

      afterEach( function() {
        clock.restore();
      });

      it('counts selfTime', function() {
        let A = heimdall.start('A');
        let B = heimdall.start('B');

        clock.tick(0, 5 * 1e6);

        let C = heimdall.start('C');

        clock.tick(0, 10 * 1e6);

        heimdall.stop(C);
        heimdall.stop(B);
        heimdall.stop(A);

        tree.construct();

        let aNode = tree.root.nodes[0];
        let aTime = aNode.stats.self.selfTime;

        let bNode = aNode.nodes[0];
        let bTime = bNode.stats.self.selfTime;

        let cNode = bNode.nodes[0];
        let cTime = cNode.stats.self.selfTime;

        expect(Math.floor(aTime / 1e6)).to.equal(0);
        expect(Math.floor(bTime / 1e6)).to.equal(5);
        expect(Math.floor(cTime / 1e6)).to.equal(10);
      });
    });

    it('supports basic start/stop', function() {
      expect(tree.path).to.eql([]);

      let tokenA = heimdall.start('node-a');
      expect(tree.path).to.eql(['node-a']);

      let tokenB = heimdall.start('node-b');
      expect(tree.path).to.eql(['node-a', 'node-b']);

      heimdall.stop(tokenB);
      expect(tree.path).to.eql(['node-a']);

      heimdall.stop(tokenA);
      expect(tree.path).to.eql([]);
    });

    it('supports resume', function () {
      expect(tree.path).to.eql([]);

      let tokenA = heimdall.start('node-a');
      expect(tree.path).to.eql(['node-a']);

      let tokenB = heimdall.start('node-b');
      expect(tree.path).to.eql(['node-a', 'node-b']);

      heimdall.stop(tokenB);
      expect(tree.path).to.eql(['node-a']);

      heimdall.resume(tokenB);
      expect(tree.path).to.eql(['node-a', 'node-b']);

      heimdall.stop(tokenB);
      expect(tree.path).to.eql(['node-a']);

      heimdall.stop(tokenA);
      expect(tree.path).to.eql([]);
    });

    it('restores the node at time of resume', function () {
      expect(tree.path).to.eql([]);

      let tokenA = heimdall.start('node-a');
      expect(tree.path).to.eql(['node-a']);

      let tokenB = heimdall.start('node-b');
      expect(tree.path).to.eql(['node-a', 'node-b']);

      heimdall.stop(tokenB);
      expect(tree.path).to.eql(['node-a']);

      let tokenC = heimdall.start('node-c');
      expect(tree.path).to.eql(['node-a', 'node-c']);

      heimdall.resume(tokenB);
      expect(tree.path).to.eql(['node-a', 'node-b']);

      heimdall.stop(tokenB);
      expect(tree.path).to.eql(['node-a', 'node-c']);

      heimdall.stop(tokenC);
      expect(tree.path).to.eql(['node-a']);

      heimdall.stop(tokenA);
      expect(tree.path).to.eql([]);
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
    let trueCount;
    let counter;
    let tree = new Tree();

    function monitorEvent() {
      trueCount++;
      heimdall.increment(counter);
    }

    beforeEach(function () {
      heimdall._session.init();
      tree.root = null;
      tree._heimdall = heimdall;
      counter = null;
      trueCount = 0;
    });

    it('throws if another schema is registered at the given namespace', function () {
      let [a] = heimdall.registerMonitor('some-monitor', 'a');
      expect(function () {
        heimdall.registerMonitor('some-monitor', 'a');
      }).to.throw('A monitor for "some-monitor" is already registered');
    });

    it('throws if using the reserved namespaces own or time', function() {
      expect(function () {
        heimdall.registerMonitor('own', 'a');
      }).to.throw('Cannot register monitor at namespace "own".  "own" and "time" are reserved');

      expect(function () {
        heimdall.registerMonitor('time', 'a');
      }).to.throw('Cannot register monitor at namespace "time".  "own" and "time" are reserved');
    });

    it('records stats for each node', function() {
      [counter] = heimdall.registerMonitor('my-monitor','a');

      let a = heimdall.start('a');
      monitorEvent();
      let b = heimdall.start('b');
      monitorEvent();
      heimdall.stop(b);
      monitorEvent();
      heimdall.stop(a);

      tree.construct();

      let nodeA = tree.root.nodes[0];
      let nodeB = nodeA.nodes[0];
      let statsA = nodeA.stats;
      let statsB = nodeB.stats;

      expect(statsA['my-monitor']['a']).to.equal(2);
      expect(statsB['my-monitor']['a']).to.equal(1);
    });
  });
});
