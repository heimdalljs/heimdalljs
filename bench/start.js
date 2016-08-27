var heimdall = require('../');

// tests
module.exports = start;
function start() {
  let a = heimdall.start('a');
}

// loop is for quick "hot code" testing
// while (true) {
// ensure it works and does't crash
start();
// }
