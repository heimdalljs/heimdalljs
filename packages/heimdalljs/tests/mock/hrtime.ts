class Clock {
  constructor() {
    this.seconds = 0;
    this.nanoseconds = 0;

    this.restoreHRTime = null;
  }

  install() {
    this.restoreHRTime = process.hrtime;
    process.hrtime = this.hrtime.bind(this);
  }

  restore() {
    process.hrtime = this.restoreHRTime;
  }

  tick(seconds=0, nanoseconds=0) {
    this.seconds += seconds;
    this.nanoseconds += nanoseconds;
    return [this.seconds, this.nanoseconds];
  }

  hrtime([prevSeconds, prevNano]=[0,0]) {
    return [this.seconds - prevSeconds, this.nanoseconds - prevNano];
  }
}


export default function mockHRTime() {
  clock = new Clock();
  clock.install();
  return clock;
}
