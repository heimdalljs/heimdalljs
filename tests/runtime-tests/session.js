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
});
