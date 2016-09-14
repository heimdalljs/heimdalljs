module.exports = {
  name: 'Start Stop (with monitor)',
  setup: function() {
    var heimdall = new Heimdall();
    var schema = heimdall.registerMonitor('mon', 'x');
    var x = schema[0];
  },
  fn: function() {
    var a = heimdall.start('a');
    heimdall.increment(x);
    heimdall.stop(a);
  }
};
