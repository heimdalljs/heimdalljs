var chai = require('chai'), expect = chai.expect;
var chaiAsPromised = require('chai-as-promised');
var chaiFiles = require('chai-files'), file = chaiFiles.file;
var RSVP = require('RSVP');
var heimdall = require('../');

chai.use(chaiAsPromised);
chai.use(chaiFiles);

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

    it('supports nodes with children', function () {
      expect(heimdall.stack).to.eql([]);
      expect('test implemented').to.equal(true);
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

  describe('monitors', function() {
    it('has tests', function() {
      expect('test implemented').to.equal(true);
    });
  });
});
