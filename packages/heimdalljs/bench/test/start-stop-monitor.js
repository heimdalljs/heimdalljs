'use strict';

module.exports = {
  name: 'Start Stop (with monitor)',
  setup() {
    let heimdall = new Heimdall();
    function MonitorSchema() {
      this.x = 0;
    }
    let x = heimdall.registerMonitor('mon', 'x').x;
  },
  fn() {
    let a = heimdall.start('a');
    let b = heimdall.start('b');
    heimdall.increment(x);
    heimdall.stop(b);
    heimdall.stop(a);
  }
};
