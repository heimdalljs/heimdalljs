
module.exports = {
  count: 1000,
  name: 'new Node()',
  setup: function() {
    var heimdall = new Heimdall();
    var Node = Heimdall.Node;
    var label = { name: 'some-node' };
  },
  fn: function() {
    new Node(heimdall, label);
  }
};