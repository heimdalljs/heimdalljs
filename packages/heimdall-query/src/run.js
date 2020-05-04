const Runner = require('./test-runner/runner');

module.exports = function runInstrumentation(config, cachePath) {
  const runner = new Runner(config, cachePath);

  return runner.run();
};
