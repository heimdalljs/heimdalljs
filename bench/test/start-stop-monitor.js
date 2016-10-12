module.exports = {
  name: 'Start Stop (with monitor)',
  setup: function() {
    var heimdall = new Heimdall();
    function MonitorSchema() {
      this.x = 0;
    }
    var x = heimdall.registerMonitor('mon', 'x').x;
  },
  fn: function() {
    var a = heimdall.start('a');
    var b = heimdall.start('b');
    heimdall.increment(x);
    heimdall.stop(b);
    heimdall.stop(a);
  }
};
