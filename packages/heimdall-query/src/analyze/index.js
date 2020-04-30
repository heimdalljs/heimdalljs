const printTable = require('./table/index');
const loadTree = require('./query/load-tree');
const analyzeRuns = require('./analyze-runs');

const exp = {
  printTable,
  loadTree,
  analyzeRuns
};

module.exports = exp;
