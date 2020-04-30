import heimdall from 'heimdalljs';
import { Module } from 'module';

// It is possible for this module to be evaluated more than once in the same
// heimdall session. In that case, we need to guard against double-counting by
// making other instances inert.
let isMonitorRegistrant = false;
let hasActiveInstance = false;
let _load = null;

class RequireSchema {
  constructor() {
    this.count = 0;
    this.time = 0;
    this.modules = [];
  }

  toJSON() {
    return {
      count: this.count,
      time: this.time,
      modules: this.modules
    };
  }
}

if (!heimdall.hasMonitor('require')) {
  heimdall.registerMonitor('require', RequireSchema);
  isMonitorRegistrant = true;
}

function nanosecondsSince(time) {
  let delta = process.hrtime(time);
  return delta[0] * 1e9 + delta[1];
}

export default class RequireMonitor {
  constructor() {
    this.state = 'idle';
  }

  start() {
    if (isMonitorRegistrant && !hasActiveInstance) {
      this.state = 'active';
      this._attach();
      hasActiveInstance = true;
    } else {

    }
  }

  stop() {
    if (this.state === 'active') {
      this._detach();
      this.state = 'idle';
      hasActiveInstance = false;
    }
  }

  shouldMeasure() {
    return this.state === 'active';
  }

  _detach() {
    if (_load) {
      Module._load = _load;
    }
  }

  _attach() {
    let monitor = this;
    _load = Module._load;

    Module._load = function (requestedModuleId, parent) {
      if (monitor.shouldMeasure()) {
        let metrics = heimdall.statsFor('require');
        metrics.count++;
        let start = process.hrtime();

        let info = {
          requestedModuleId,
          parentModuleId: parent.id,
          duration: null
        };

        metrics.modules.push(info);

        let ret = _load.apply(Module, arguments);
        let duration = info.duration = nanosecondsSince(start);
        metrics.time += duration;
        return ret;
      }

      return _load.apply(Module, arguments);
    };
  }
}
