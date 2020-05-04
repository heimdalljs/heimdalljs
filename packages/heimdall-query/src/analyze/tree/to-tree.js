require('./node');
var Tree = require('heimdalljs')._Tree;

module.exports = function toTree(data) {
  let tree = Tree.fromJSON(data);
  tree.construct();

  return tree.root;
};
