
module.exports = {
  count: 1000,
  name: 'new Token()',
  setup: function() {
    var heimdall = new Heimdall();
    var Token = Heimdall.Token;
  },
  fn: function() {
    new Token(1, heimdall);
  }
};