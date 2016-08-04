var chai = require('chai'), expect = chai.expect;
var chaiAsPromised = require('chai-as-promised');
var path = require('path');

var Session = require('../src/session');

var indexPath = path.resolve(__dirname + '/../index.js');

chai.use(chaiAsPromised);

describe('the exported global instance', function() {
  beforeEach( function() {
    delete process._heimdall_session_1;
    delete require.cache[indexPath];
  });

  describe('when an existing session exists', function() {
    it('reuses that session', function() {
      expect(process._heimdall_session_1).to.equal(undefined);

      var session = new Session();
      process._heimdall_session_1 = session;

      var global = require(indexPath);

      expect(global._session).to.equal(session);
      expect(process._heimdall_session_1).to.equal(session);
    });
  });

  describe('when an existing session does not exist', function() {
    it('creates a new session and installs it on process', function() {
      expect(process._heimdall_session_1).to.equal(undefined);

      var global = require(indexPath);

      expect(global._session).to.equal(process._heimdall_session_1);
      expect(global._session).to.be.an.instanceOf(Session);
    });
  });
});