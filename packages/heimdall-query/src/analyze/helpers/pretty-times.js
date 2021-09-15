module.exports = function prettyTimes({ row, stats }) {
  for (let i = 0; i < stats.length; ++i) {
    let stat = stats[i];

    row[0] = row[0].valueOf();

    if (stat.transform) {
      row[i + 1] = stat.transform(row[i + 1], row.count || 1);
    } else if (stat.isTime || /time/i.test(stat.name)) {
      if (row[i + 1]) {
        let v = row[i + 1];

        row[i + 1] = `${v.valueOf().toFixed(2)} ms`;

        if (true || stat.shouldPlot) {
          row[i + 1] += '\n' + v.plot + '\n' + JSON.stringify(v.stats, null, 2);
        }
      } else {
        row[i + 1] = 'N/A';
      }
    } else {
      row[i + 1] = row[i + 1].valueOf();
    }
  }
  return row;
};
