// basic runner;
console.log('running instantiation tests:');
require('do-you-even-bench')([
  {
    name: 'node',
    fn: require('./node')
  },
  {
    name: 'start',
    fn: require('./start')
  },
  {
    name: 'comprehensive',
    fn: require('./overall')
  }
]);
