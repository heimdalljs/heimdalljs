var Heimdall = require('../heimdall');
var _global = typeof window !== 'undefined' ? window : global;
var benchmarkRunner = require('do-you-even-bench');

_global.Heimdall = Heimdall;

var benchmarks = [
  require('./test/now'),
  require('./test/start-stop'),
  require('./test/start-stop-monitor'),
  require('./test/start-stop-ownstats'),
  require('./test/start-stop-allstats'),
  require('./test/monitor'),
];

benchmarkRunner(benchmarks);
