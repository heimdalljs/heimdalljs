const Runner = require('./test-runner/runner');
const analyzeRuns = require('./analyze/analyze-runs');

module.exports = function runAndAnalyze(config, cachePath) {
  const runner = new Runner(config, cachePath);

  runner.run().then(
    function (results) {
      console.log(
        '\n\t=======================' +
          '\n\t' +
          config.name +
          '\n\t======================='
      );

      for (let i = 0; i < results.length; i++) {
        analyzeRuns(config.slugs[i], JSON.parse(results[i]), config);
      }
    },
    function (e) {
      console.log('\n\n', e, '\n\n');
    }
  );
};
