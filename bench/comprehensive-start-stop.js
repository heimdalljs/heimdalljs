module.exports = {
  count: 1000,
  name: 'Comprehensive Start Stop',
  setup: function() {
    var heimdall = new Heimdall();
  },
  fn: function() {
    var a = heimdall.start('a');
    var b = heimdall.start('b');
    heimdall.stop(b);
    heimdall.stop(a);
  }
};