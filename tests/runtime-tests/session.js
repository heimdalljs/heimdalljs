// for serious,
//
// Be very careful about changing ANY tests here.  This is the public API and
// must work between different heimdalljs versions.  Changing things here
// will very likely require a shim.  A node cannot assume that other nodes in
// the graph share the same version.
//
// Sincerely,
//    Serious.

import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import Session from '../../src/runtime/session';
import CounterStore from '../../src/shared/counter-store';
import HashMap from '../../src/shared/hash-map';
import EventArray from '../../src/shared/event-array';
import Heimdall from '../../src/runtime';
import Tree from '../../src/heimdall-tree';

const { expect } = chai;

chai.use(chaiAsPromised);

describe('HeimdallSession', function() {
  describe('monitors', function() {
    it('is a CounterStore on the session', function() {
      let monitors = new Session().monitors;

      expect(monitors instanceof CounterStore).to.equal(true);
    });
  });

  describe('configs', function() {
    it('is a HashMap on the session', function() {
      let configs = new Session().configs;

      expect(configs instanceof HashMap).to.equal(true);
    });
  });

  describe('events', function() {
    it('is a EventArray on the session', function() {
      let events = new Session().events;

      expect(events instanceof EventArray).to.equal(true);
    });
  });

  describe('timings', function() {
    it('is a hash on the session', function() {
      let timings = new Session().timings;

      expect(timings).to.eql(Object.create(null), `Timings is an object`);
    });
  });

  describe('reset()', function() {
    it('is callable', function() {
      let session = new Session();

      expect(typeof session.reset).to.equal('function');
      expect(() => { session.reset(); }).to.not.throw();
    });

    it('is resettable', function() {
      let session = new Session();
      let heimdall = new Heimdall(session);
      let tree = new Tree(heimdall);

      let { a, b, c } = heimdall.registerMonitor('foo', 'a', 'b', 'c');
      let { d, e, f } = heimdall.registerMonitor('bar', 'd', 'e', 'f');

      let token = heimdall.start('a node!');
      heimdall.increment(a);
      heimdall.increment(e);
      heimdall.stop(token);

      tree.construct();

      let node = tree.root.nodes[0];
      let stats = node.stats;

      expect(stats['foo']['a']).to.equal(1, `we incremented 'a'`);
      expect(stats['bar']['e']).to.equal(1, `we incremented 'e'`);
      expect(stats['bar']['d']).to.equal(0, `we didn't increment 'd'`);

      session.reset();

      token = heimdall.start('a new node!');
      heimdall.stop(token);

      tree.construct();
      node = tree.root.nodes[0];

      expect(node.stats['foo']).to.equal(undefined, `we reset`);
    });
  });
});
