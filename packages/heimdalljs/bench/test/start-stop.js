'use strict';

module.exports = {
  name: 'Start Stop',
  setup() {
    let heimdall = new Heimdall();
  },
  fn() {
    let a = heimdall.start('a');
    let b = heimdall.start('b');
    heimdall.stop(b);
    heimdall.stop(a);
  }
};
