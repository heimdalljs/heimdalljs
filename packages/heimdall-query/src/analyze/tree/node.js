var Node = require('heimdalljs')._Node;

Node.prototype.preOrderIterator = function* (ignoreBranches = []) {
  let isIgnored = ignoreBranches.indexOf(this.name) !== -1;
  yield [this, isIgnored];

  for (let child of this.nodes) {
    for (let [descendant, ignore] of child.preOrderIterator(ignoreBranches)) {
      let ignoreNode =
        ignore || isIgnored || ignoreBranches.indexOf(descendant.name) !== -1;

      yield [descendant, ignoreNode];
    }
  }
};

Node.prototype.findDescendant = function (matcher, ignoreBranches = []) {
  for (const [node] of this.preOrderIterator(ignoreBranches)) {
    if (matcher(node.name)) {
      return node;
    }
  }
};

module.exports = Node;
