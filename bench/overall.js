var heimdall = require('../');

// tests
module.exports = overall;
function overall() {
  let a = heimdall.start('a');
  let b = heimdall.start('b');
  heimdall.stop(b);
  heimdall.stop(a);
}

// loop is for quick "hot code" testing
// while (true) {
// ensure it works and does't crash
overall();
// }
