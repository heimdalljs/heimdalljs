module.exports = {
  count: 1000,
  name: 'now()',
  setup: function() {
    var now = Heimdall.now;
  },
  fn: function() {
    return now();
  }
};