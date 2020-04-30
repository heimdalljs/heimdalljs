const prefix = require('./prefix');
const arrayOf = require('./array-of');

module.exports = function compressContext({
  compressAfter,
  collapseByName,
  contextRows,
  depth,
}) {
  if (collapseByName) {
    let keys = {};

    for (let i = 0; i < contextRows.length; i++) {
      let row = contextRows[i];
      let key = row[0];
      let collapsedRow = keys[key] = keys[key] || { name: key, count: 0, data: row, nodes: [] };

      collapsedRow.count++;
      collapsedRow.nodes.push(row.node);

      if (collapsedRow.count > 1) {
        collapsedRow.data[0] = key + ' (' + collapsedRow.count + ')';
      }

      if (collapsedRow.count > 1) {
        for (let j = 1; j < row.length; j++) {
          collapsedRow.data[j] += row[j];
        }
      }
    }

    contextRows = Object.keys(keys).map((key) => {
      let i = keys[key];

      i.data.nodes = i.nodes;
      if (i.count <= 1) {
        i.data.node = i.nodes[0];
      } else {
        i.data.node = { nodes: i.nodes.reduce((c, i) => { return c.concat(i.nodes); }, []) };
      }

      i.data.count = i.count;

      return i.data;
    });
  }

  if (contextRows.length <= compressAfter + 1) {
    return contextRows;
  }
  const other = contextRows.slice(compressAfter);
  const summaryRow = other.reduce((summary, row) => {
    for (let i=1; i<row.length; ++i) {
      summary[i] += row[i];
    }
    return summary;
  }, [`${prefix(depth)}other (${other.length})`, ...arrayOf(0, other[0].length-1)]);

  return [...contextRows.slice(0, compressAfter), summaryRow];
};
