const ChromeTest = require('./chrome-batch-test');

function TestRunner(options, CACHE_DIR) {
  this.options = options;
  this.outputDir = CACHE_DIR;
}

TestRunner.prototype.run = function runTests() {
  let { slugs, runs, domain } = this.options;
  let results = [];
  let CACHE_DIR = this.outputDir;

  return slugs
    .reduce(function (chain, slug) {
      return chain.then(function () {
        var test = new ChromeTest({ slug, runs, domain }, CACHE_DIR);

        return test.run().then(function (result) {
          results.push(result);
        });
      });
    }, Promise.resolve())
    .then(function () {
      return results;
    });
};

module.exports = TestRunner;
