module.exports = {
  name: 'Increment Monitor',
  setup: function() {
    var heimdall = new Heimdall();
    var schema = heimdall.registerMonitor('mon', 'x');
    var x = schema[0];
  },
  fn: function() {
    heimdall.increment(x);
  }
};
