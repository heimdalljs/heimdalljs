const analyzeRuns = require('./analyze/analyze-runs');
const fs = require('fs');
const path = require('path');

function loadResults(config, dir) {
  let results = [];

  for (let i = 0; i < config.slugs.length; i++) {
    let slug = config.slugs[i];
    let filePath = path.join(dir, slug + '.json');
    let stats;

    try {
      stats = fs.statSync(filePath);
    } catch (e) {
      console.warn("No cached results file found for '" + slug + "'");
      continue;
    }

    if (stats && stats.isFile()) {
      results.push(fs.readFileSync(filePath));
    }
  }

  return Promise.resolve(results);
}

module.exports = function analyzeData(config, cachePath) {
  loadResults(config, cachePath)
    .then(function(results) {

      console.log(
        '\n\t=======================' +
        '\n\t' + config.name +
        '\n\t======================='
      );

      for (let i = 0; i < results.length; i++) {
        analyzeRuns(config.slugs[i], JSON.parse(results[i]), config);
      }

    })
    .catch(function(e) {
      console.log('\n\n', e, '\n\n');
    });
};
