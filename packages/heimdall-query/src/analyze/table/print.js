const Table = require('cli-table');
const prettyTimes = require('../helpers/pretty-times');

module.exports = function printTable({
  runCount,
  name:tableName,
  stats,
  table:rows
}) {
  let colAligns = [null, ...stats.map(stat => stat.colAlign || (/time/i.test(stat.name) ? 'right' : null))];
  let table = new Table({
    head: ['Node Name'].concat(stats.map(stat => stat.name)),
    colAligns: colAligns,
  });
  let spacer = ['', ...stats.map(x => '')];

  table.push(spacer);
  table.push(prettyTimes({ row: rows.shift(), stats }));

  rows.forEach(r => table.push(prettyTimes({ row: r, stats })));

  console.log(tableName + '\t (average of ' + runCount + ' runs with outliers filtered)');
  console.log(table.toString());
};
