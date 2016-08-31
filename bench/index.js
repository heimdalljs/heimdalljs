var Heimdall = require('../heimdall');
var _global = typeof window !== 'undefined' ? window : global;

_global.Heimdall = Heimdall;

require('do-you-even-bench')([
  require('./start-stop'),
  require('./start-stop-ownstats'),
  require('./start-stop-monitor'),
  require('./start-stop-allstats'),
  require('./test/now'),
  require('./test/new-node'),
  require('./test/heimdall.start.js'),
  require('./test/comprehensive-start-stop')
]);
