class Console {
  constructor() {
    this.timeCalls = 0;
    this.timeEndCalls = 0;
    this.restoreConsole = null;
    this.lastTimeArgs = null;
    this.lastTimeEndArgs = null;
  }

  install() {
    this.restoreConsole = {
      time: console.time,
      timeEnd: console.timeEnd
    };
    console.time = this.time.bind(this);
    console.timeEnd = this.timeEnd.bind(this);
  }

  restore() {
    console.time = this.restoreConsole.time;
    console.timeEnd = this.restoreConsole.timeEnd;
  }

  time(...args) {
    this.timeCalls++;
    this.lastTimeArgs = args;
  }

  timeEnd(...args) {
    this.timeEndCalls++;
    this.lastTimeEndArgs = args;
  }
}

export default function mockConsole() {
  let console = new Console();
  console.install();
  return console;
}
