var chai = require('chai'), expect = chai.expect;
var chaiAsPromised = require('chai-as-promised');
var chaiFiles = require('chai-files'), file = chaiFiles.file;
chai.use(chaiAsPromised);
chai.use(chaiFiles);


describe('heimdall', function() {
  describe('start with callbacks', function() {
    it('has tests', function() {
      expect('test implemented').to.equal(true);
    });
  });

  describe('start without callbacks', function() {
    it('has tests', function() {
      expect('test implemented').to.equal(true);
    });
  });

  describe('monitors', function() {
    it('has tests', function() {
      expect('test implemented').to.equal(true);
    });
  });
});
