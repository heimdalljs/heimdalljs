module.exports = {
  count: 1000,
  name: 'heimdall.start()',
  setup: function() {
    var heimdall = new Heimdall();
  },
  fn: function() {
    return heimdall.start('a');
  }
};