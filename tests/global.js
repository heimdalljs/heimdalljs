import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import Session from '../src/session';
import setupSession from '../src/setup-session';

const { expect } = chai;

chai.use(chaiAsPromised);

describe('setupSession', function() {
  describe('when an existing session exists', function() {

    it('reuses that session', function() {
      const global = {};
      const session = new Session();

      global._heimdall_session_1 = session;

      setupSession(global);

      expect(global._heimdall_session_1).to.equal(session);
    });
  });

  describe('when an existing session does not exist', function() {
    it('creates a new session saves it on the global', function() {
      const global = {};

      expect(global._heimdall_session_1).to.equal(undefined);

      setupSession(global);

      expect(global._heimdall_session_1).to.be.an.instanceOf(Session);
    });
  });
});
