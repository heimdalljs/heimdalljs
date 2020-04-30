import { Module } from 'module';
import chai from 'chai';
import heimdall from 'heimdalljs';
import clearRequire from 'clear-require';

import RequireMonitor from '../src';

const { expect } = chai;
const originalLoad = Module._load;

describe('heimdalljs-require-monitor', function() {
  beforeEach(function() {
    clearRequire('./fixtures/silly-module');
    clearRequire('./fixtures/slow-module');
  });

  afterEach(function() {
    expect(Module._load, 'Module._load has been reset').to.equal(originalLoad);
  });

  it('will only allow one active instance at a time', function() {
    let monitor0 = new RequireMonitor();
    let monitor1 = new RequireMonitor();

    try {
      monitor0.start();
      monitor1.start();

      expect(monitor0.state, 'monitor0 (m0 active)').to.eql('active');
      expect(monitor1.state, 'monitor1 (m0 active)').to.eql('idle');

      monitor0.stop();

      monitor1.start();
      monitor0.start();

      expect(monitor0.state, 'monitor0 (m1 active)').to.eql('idle');
      expect(monitor1.state, 'monitor1 (m1 active)').to.eql('active');

    } finally {
      monitor0.stop();
      monitor1.stop();
    }
  });

  describe('adds stats', function() {
    let token, monitor;

    beforeEach(function() {
      token = heimdall.start('test harness');
    });

    afterEach(function() {
      if (token) {
        // stop in a way compat with 0.2 and 0.3
        heimdall.stop ? heimdall.stop(token) : token.stop();
      }

      if (monitor) {
        monitor.stop();
      }
    });

    it('does not log stats unless started', function() {
      let stats = heimdall.statsFor('require');
      require('./fixtures/silly-module');
      expect(stats).to.deep.equal({
        time: 0,
        count: 0,
        modules: []
      });
    });

    it('logs stats when started', function() {
      let stats = heimdall.statsFor('require');
      monitor = new RequireMonitor();
      monitor.start();

      require('./fixtures/slow-module');

      expect(stats.count).to.equal(1);
      expect(stats.modules.length).to.equal(1);

      let moduleInfo = stats.modules[0];
      expect(moduleInfo.parentModuleId).to.equal(__filename);
      expect(moduleInfo.requestedModuleId).to.equal('./fixtures/slow-module');
      expect(moduleInfo.duration).to.be.above(5000000);
    });
  });
});
