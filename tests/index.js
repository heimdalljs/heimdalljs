var chai = require('chai'), expect = chai.expect;
var chaiAsPromised = require('chai-as-promised');
var chaiFiles = require('chai-files'), file = chaiFiles.file;
var RSVP = require('RSVP');
var heimdall = require('../');

chai.use(chaiAsPromised);
chai.use(chaiFiles);

describe('heimdall', function() {
  describe('logging', function() {
    describe('log', function() { });
    describe('log.verbose', function() { });
  });

  describe('.node', function() {
    it('sync callback name POJO', function() {
      var cbInvoked = false;

      expect(heimdall.stack).to.eql([]);

      heimdall.node({ name: 'node-a' }, function() {
        expect(heimdall.stack).to.eql(['node-a']);
        cbInvoked = true;
      });

      expect(heimdall.stack).to.eql([]);
      expect(cbInvoked).to.equal(true);
    });

    it('sync callback name string shorthand', function () {
      expect(heimdall.stack).to.eql([]);

      heimdall.node('node-a', function() {
        expect(heimdall.stack).to.eql(['node-a']);
      });

      expect(heimdall.stack).to.eql([]);
    });

    it('promise callback', function() {
      var defer = RSVP.defer();
      var session = heimdall.node('node-a', function() {
        return defer.promise;
      });

      expect(heimdall.stack).to.eql(['node-a']);

      defer.resolve();

      expect(heimdall.stack).to.eql(['node-a']);

      return session.then(function() {
        expect(heimdall.stack).to.eql([]);
      });
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

  describe('monitors', function() {
    it('has tests', function() {
      expect('test implemented').to.equal(true);
    });
  });
});
