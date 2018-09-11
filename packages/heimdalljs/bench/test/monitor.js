'use strict';

module.exports = {
  name: 'Increment Monitor',
  setup() {
    let heimdall = new Heimdall();
    let schema = heimdall.registerMonitor('mon', 'x');
    let x = schema[0];
  },
  fn() {
    heimdall.increment(x);
  }
};
