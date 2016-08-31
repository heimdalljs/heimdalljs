var Heimdall = require('../heimdall');
var _global = typeof window !== 'undefined' ? window : global;

_global.Heimdall = Heimdall;

require('do-you-even-bench')([
  require('./start-stop'),
  require('./start-stop-ownstats'),
  require('./start-stop-monitor'),
  require('./start-stop-allstats'),
  require('./node'),
  require('./start'),
  require('./overall'),
  require('./now'),
  require('./new-node'),
  require('./new-token'),
  require('./heimdall.start'),
  require('./comprehensive-start-stop')
]);
