module.exports = {
  count: 1000,
  name: 'Start Stop (with monitor)',
  setup: function() {
    var Heimdall = process.Heimdall;
    var heimdall = new Heimdall();
    function MonitorSchema() {
      this.x = 0;
    }
    heimdall.registerMonitor('mon', MonitorSchema);
  },
  fn: function() {
    var a = heimdall.start('a');
    var b = heimdall.start('b');
    heimdall.statsFor('mon').x++;
    heimdall.stop(b);
    heimdall.stop(a);
  }
};
