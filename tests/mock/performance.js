import now from '../../src/shared/time';

class Performance {
  constructor() {
    this.measureCalls = 0;
    this.markCalls = 0;
    this.lastMeasureArgs = null;
    this.lastMarkArgs = null;
    this.restorePerformance = null;
    this._marks = [];
  }

  install() {
    this.restorePerformance = process.performance;
    global.performance = this;
  }

  remove() {
    this.restorePerformance = process.performance;
    global.performance = undefined;
  }

  restore() {
    global.performance = this.restorePerformance;
  }

  measure(...args) {
    this.measureCalls++;
    this.lastMeasureArgs = args;
  }

  mark(...args) {
    this.markCalls++;
    this.lastMarkArgs = args;
    this._marks.push({
      name: args[0],
      startTime: this.now()
    });
  }

  now() {
    return now();
  }

  getEntriesByType() {
    return this._marks;
  }
}

export function removePerformance() {
  let performance = new Performance();
  performance.remove();
  return performance;
}

export default function mockPerformance() {
  let performance = new Performance();
  performance.install();
  return performance;
}
