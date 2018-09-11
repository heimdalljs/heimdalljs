'use strict';

const Heimdall = require('../heimdall');
const _global = typeof window !== 'undefined' ? window : global;
const benchmarkRunner = require('do-you-even-bench');

_global.Heimdall = Heimdall;

const benchmarks = [
  require('./test/start-stop'),
  require('./test/start-stop-monitor'),
  require('./test/monitor'),
];

benchmarkRunner(benchmarks);
