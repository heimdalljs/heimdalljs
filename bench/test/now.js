module.exports = {
  name: 'now()',
  setup: function() {
    var now = Heimdall.now;
  },
  fn: function() {
    return now();
  }
};