var Heimdall = require('../heimdall');
process.Heimdall = Heimdall;

require('do-you-even-bench')([
  require('./node'),
  require('./start'),
  require('./overall')
]);
