var Heimdall = require('../heimdall');
var _global = typeof window !== 'undefined' ? window : global;
var benchmarkRunner = require('do-you-even-bench');

_global.Heimdall = Heimdall;

var benchmarks = [
  require('./start-stop'),
  require('./start-stop-ownstats'),
  require('./start-stop-monitor'),
  require('./start-stop-allstats'),
  require('./test/now'),
  require('./test/new-node'),
  require('./test/heimdall.start.js'),
  require('./test/comprehensive-start-stop')
];

// console.profile('benchmarks');
benchmarkRunner(benchmarks);
/*
setTimeout(function() {
  console.profileEnd('benchmarks');
}, 25000);
*/
