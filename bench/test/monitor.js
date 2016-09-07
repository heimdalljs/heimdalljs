module.exports = {
  name: 'Increment Monitor',
  setup: function() {
    var heimdall = new Heimdall();
    var x = heimdall.registerMonitor('mon', 'x');
  },
  fn: function() {
    heimdall.increment(x);
  }
};
