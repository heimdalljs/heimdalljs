module.exports = {
  count: 1000,
  name: 'Comprehensive',
  setup: function() {
    var Heimdall = process.Heimdall;
    var heimdall = new Heimdall();
  },
  fn: function() {
    var a = heimdall.start('a');
    var b = heimdall.start('b');
    heimdall.stop(b);
    heimdall.stop(a);
  }
};