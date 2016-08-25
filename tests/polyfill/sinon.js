function makeMockDate(clock) {
  return class MockDate {
    constructor() {
      this.clock = clock;
    }

    getTime() {
      return this.clock.ms;
    }
  };
}

class Clock {
  constructor() {
    this.ms = 0;
    this.restoreDate = null;
  }

  install() {
    this.restoreDate = global.Date;
    global.Date = makeMockDate(this);
  }

  restore() {
    global.Date = this.restoreDate;
  }

  tick(ms) {
    return this.ms += ms;
  }
}


export function useFakeTimers() {
  clock = new Clock();
  clock.install();
  return clock;
}

export default { useFakeTimers };
