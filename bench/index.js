// basic runner;
console.log('running instantiation tests:');
require('do-you-even-bench')([
  {
    name: 'node',
    fn: require('./node')
  },
  {
    name: 'cookie creation',
    fn: require('./cookie'),
  }
]);
