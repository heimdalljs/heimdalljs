var Heimdall = require('../heimdall');
process.Heimdall = Heimdall;

// var heimdall = require('../');
// process.heimdall = heimdall;

require('do-you-even-bench')([
  require('./node'),
  require('./start'),
  require('./overall')
]);
