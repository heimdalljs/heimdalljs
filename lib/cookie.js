export default class Cookie {
  constructor(node, heimdall) {
    this.node = node;
    this.restoreNode = this.node.parent;
    this.heimdall = heimdall;
    this.stopped = false;
  }

  get stats() {
    return this.node.stats.own;
  }

  stop() {
    let monitor;

    if (this.heimdall._current !== this.node) {
      throw new TypeError('cannot stop: not the current node');
    } else if (this.stopped === true) {
      throw new TypeError('cannot stop: already stopped');
    }

    this.stopped = true;
    this.heimdall._recordTime();
    this.heimdall._current = this.restoreNode;
  }

  resume() {
    if (this.stopped === false) {
      throw new TypeError('cannot resume: not stopped');
    }

    this.stopped = false;
    this.restoreNode = this.heimdall._current;
    this.heimdall._current = this.node;
  }
}
