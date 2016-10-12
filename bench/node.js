module.exports = {
  count: 1000,
  name: 'Node',
  setup: function() {
    var Heimdall = process.Heimdall;
    var heimdall = new Heimdall();
    var Node = heimdall.constructor.Node;
  },
  fn: function() {
    new Node(heimdall, { name: 'some-node' });
  }
};
