import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import Session from '../../src/runtime/session';
import setupSession from '../../src/runtime/setup-session';

const { expect } = chai;

chai.use(chaiAsPromised);

describe('setupSession', function() {
  describe('when an existing session exists', function() {

    it('reuses that session', function() {
      const global: any = {};
      const session = new Session();

      global._heimdall_session_3 = session;

      setupSession(global);

      expect(global._heimdall_session_3).to.equal(session);
    });
  });

  describe('when an existing session does not exist', function() {
    it('creates a new session saves it on the global', function() {
      const global: any = {};

      expect(global._heimdall_session_3).to.equal(undefined);

      setupSession(global);

      expect(global._heimdall_session_3).to.be.an.instanceOf(Session);
    });
  });
});