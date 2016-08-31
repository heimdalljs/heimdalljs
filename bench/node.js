var heimdall = require('../');
var Node = heimdall.constructor.Node;

// tests
module.exports = newNode;
function newNode() {
  return new Node(heimdall, { name: 'some-node' });
}

// loop is for quick "hot code" testing
// while (true) {
// ensure it works and does't crash
  newNode();
// }
