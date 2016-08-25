// basic runner;
console.log('running instantiation tests:');
var Heimdall = require('../heimdall');
process.Heimdall = Heimdall;

require('do-you-even-bench')([
  {
    name: 'node',
    fn: require('./node')
  },
  require('./start-stop'),
  require('./start-stop-ownstats'),
  require('./start-stop-monitor'),
  require('./start-stop-allstats')
]);
