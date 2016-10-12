module.exports = {
  count: 1000,
  name: 'Start',
  setup: function() {
    var Heimdall = process.Heimdall;
    var heimdall = new Heimdall();
  },
  fn: function() {
    var a = heimdall.start('a');
  }
};