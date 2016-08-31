var Heimdall = require('../heimdall');
process.Heimdall = Heimdall;

// var heimdall = require('../');
// process.heimdall = heimdall;

require('do-you-even-bench')([
  {
    name: 'node',
    count: 1000,
    fn: require('./node'),
    setup: function() {
      var Heimdall = process.Heimdall;
      var heimdall = new Heimdall();
      // var heimdall = process.heimdall;
      var Node = heimdall.constructor.Node;
    }
  },
  {
    count: 1000,
    name: 'start',
    fn: require('./start'),
    setup: function() {
      var Heimdall = process.Heimdall;
      var heimdall = new Heimdall();
    }
  },
  {
    count: 1000,
    name: 'comprehensive',
    fn: require('./overall'),
    setup: function() {
      var Heimdall = process.Heimdall;
      var heimdall = new Heimdall();
    }
  }
]);
