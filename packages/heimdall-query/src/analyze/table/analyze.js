const contextFor = require('../helpers/context-for');
const getStat = require('../helpers/get-stat');

module.exports = function analyzeTree({
  stats,
  tree,
  collapseByName,
  ignoreBranches,
  sortBy = 'stats.self.selfTime',
  maxDepth = 5,
  compressAfter = 5,
  finder = (t) => true,
}) {
  let sortByCol = stats.indexOf(sortBy) + 1;
  let node = tree.findDescendant(finder);
  let treeName = node.name;
  let firstRow = [treeName, ...stats.map(getStat(node, ignoreBranches))];

  let table = contextFor({
    node,
    stats,
    ignoreBranches,
    compressAfter,
    collapseByName,
    sortByCol,
    maxDepth,
  });

  table.unshift(firstRow);

  return table;
};
