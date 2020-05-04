const slugToPhrase = require('../helpers/slug-to-phrase');
const analyzeTree = require('./table/analyze');
const combineTables = require('./table/combine');
const printTable = require('./table/print');
const resultsToTrees = require('./helpers/results-to-trees');

module.exports = function analyzeRuns(slug, resultSet, config) {
  let len = resultSet.length;
  let { ignoreBranches, stats, finderPath, compressAfter, collapseByName, maxDepth } = config;
  let trees = resultsToTrees(resultSet);
  let tables = new Array(len);

  for (let i = 0; i < len; i++) {
    tables[i] = analyzeTree({
      tree: trees[i],
      stats,
      compressAfter,
      ignoreBranches,
      collapseByName,
      maxDepth,
      finder: name => name === finderPath,
    });
  }

  let combinedTables = combineTables(tables);

  printTable({
    name: '\n\n' + slugToPhrase(slug) + '\n====================\n',
    stats,
    runCount: len,
    table: combinedTables
  });
};
