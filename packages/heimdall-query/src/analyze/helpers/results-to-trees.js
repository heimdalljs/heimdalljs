const toTree = require('../tree/to-tree');

module.exports = function resultsToTrees(results) {
  let len = results.length;
  let trees = new Array(len);

  for (let i = 0; i < len; i++) {
    trees[i] = toTree(results[i]);
  }

  return trees;
};
