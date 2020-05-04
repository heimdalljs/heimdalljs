const prefix = require('./prefix');
const getStat = require('./get-stat');
const compressContext = require('./compress-context');

module.exports = function contextFor({
  node,
  stats,
  compressAfter,
  ignoreBranches,
  collapseByName,
  sortByCol,
  depth=1,
  maxDepth,
}) {
  if (depth > maxDepth) { return []; }

  let contextRows = node.nodes.map(child => {
    if (ignoreBranches.indexOf(child.name) !== -1) {
      return undefined;
    }
    let rv = [`${prefix(depth)}${child.name}`, ...stats.map(getStat(child, ignoreBranches))];
    rv.node = child;
    return rv;
  });

  contextRows = contextRows.filter(function(v) { return v !== undefined; });

  contextRows.sort((a, b) => b[sortByCol] - a[sortByCol]);

  contextRows = compressContext({contextRows, depth, ignoreBranches, compressAfter, collapseByName});

  for (let i=0; i < contextRows.length; i++) {
    let node = contextRows[i].node;

    if (node) {
      let subcontext = contextFor({ node, stats, compressAfter, ignoreBranches, collapseByName, sortByCol, maxDepth, depth: depth + 1});

      contextRows.splice(i + 1, 0, ...subcontext);
      i += subcontext.length;
    }
  }

  return contextRows;
};
