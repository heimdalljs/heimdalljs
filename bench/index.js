console.log('running instantiation tests:');

var Heimdall = require('../heimdall');
process.Heimdall = Heimdall;

require('do-you-even-bench')([
  require('./node'),
  require('./start'),
  require('./start-stop'),
  require('./start-stop-ownstats'),
  require('./start-stop-monitor'),
  require('./start-stop-allstats'),
]);
