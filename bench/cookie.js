var heimdall = require('../');
var Cookie = heimdall.constructor.Cookie;
var Node = heimdall.constructor.Node;

var node = new Node(heimdall, { name: 'some-node' });
// tests
module.exports = newCookie;
function newCookie() {
  new Cookie(node, heimdall);
}

// loop is for quick "hot code" testing
// while (true) {
// ensure it works and does't crash
  newCookie();
// }
