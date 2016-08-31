function overall() {
  let a = heimdall.start('a');
  let b = heimdall.start('b');
  heimdall.stop(b);
  heimdall.stop(a);
}

module.exports = overall;
