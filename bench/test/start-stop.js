module.exports = {
  name: 'Start Stop',
  setup: function() {
    var heimdall = new Heimdall();
  },
  fn: function() {
    var a = heimdall.start('a');
    var b = heimdall.start('b');
    heimdall.stop(a);
    heimdall.stop(b);
  }
};
