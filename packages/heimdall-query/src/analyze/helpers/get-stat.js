const _ = require('lodash');

module.exports = function getStat(tree, ignoreBranches) {
  return function(stat) {
    let account = stat.account || 0;
    if (stat.rollup === true) {
      return _.sumBy([...tree.preOrderIterator(ignoreBranches)], function([node, ignore]) {
        if (ignore === true) {
          // console.log('ignoring ' + node.name);
          return 0;
        }

        let value = _.get(node, stat.key);

        if (value === undefined) { return 0; }

        if (/time/i.test(stat.name)) {
          value = value / 1e6;
          value = Math.max(0, value - account);
        }

        return value;
      });
    }

    let accountTotal = account;
    if (account > 0) {
      accountTotal = (1 + tree.nodes.length) * account;
    }

    let value = _.get(tree, stat.key);

    if (/time/i.test(stat.name)) {
      value = value / 1e6;
      value = Math.max(0, value - accountTotal);
    }

    return value;
  };
};
