class Console {
  constructor() {
    this.timeCalls = 0;
    this.timeEndCalls = 0;
    this.restoreConsole = null;
    this.lastTimeArgs = null;
    this.lastTimeEndArgs = null;
  }

  install() {
    this.restoreConsole = process.console;
    global.console = this;
  }

  restore() {
    global.console = this.restoreConsole;
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
