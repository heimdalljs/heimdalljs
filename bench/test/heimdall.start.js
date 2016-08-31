module.exports = {
  count: 1000,
  name: 'heimdall.start()',
  setup: function() {
    var heimdall = new Heimdall();
  },
  fn: function() {
    var a = heimdall.start('a');
  }
};