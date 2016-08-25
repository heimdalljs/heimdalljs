// basic runner;
console.log('running instantiation tests:');

var ITER_COUNT = 1000;
process.heimdall = require('../');

require('do-you-even-bench')([
  {
    count: ITER_COUNT,
    name: 'new Cookie()',
    fn: require('./cookie-new'),
  },
  {
    count: ITER_COUNT,
    name: 'Cookie.create()',
    fn: require('./cookie-create'),
  },
  {
    count: ITER_COUNT,
    name: 'Cookie.create() w/prealloc',
    setup: function() {
      var heimdall = process.heimdall;
      var count = this.count;
      var Cookie = heimdall.constructor.Cookie;
      var Node = heimdall.constructor.Node;
      var node = new Node(heimdall, { name: 'some-node' });

      // preallocate
      while (count--) {
        var cookie = new Cookie(node, heimdall);
        cookie._stopped = true;
        cookie.destroy();
      }
    },
    fn: require('./cookie-create'),
  },
  {
    count: ITER_COUNT,
    name: 'new Node()',
    fn: require('./node-new')
  },
  {
    count: ITER_COUNT,
    name: 'Node.create()',
    fn: require('./node-create')
  },
  {
    count: ITER_COUNT,
    name: 'Node.create() w/prealloc',
    setup: function() {
      var heimdall = process.heimdall;
      var Node = heimdall.constructor.Node;
      var count = this.count;

      // preallocate
      while (count--) {
        var node = new Node(heimdall, { name: 'some-node' });
        node.destroy();
      }
    },
    fn: require('./node-create')
  },
]);
