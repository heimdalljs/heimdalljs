export default class Cookie {
  constructor(node, heimdall) {
    this._node = node;
    this._restoreNode = node.parent;
    this._heimdall = heimdall;
    this._stopped = false;
  }

  get stats() {
    return this._node.stats.own;
  }

  stop() {
    let monitor;

    if (this._heimdall.current !== this._node) {
      return;
    } else if (this.stopped === true) {
      return;
    }

    this._stopped = true;
    this._heimdall._recordTime();
    this._heimdall._session.current = this._restoreNode;
  }

  resume() {
    if (this._stopped === false) {
      return;
    }

    this._stopped = false;
    this._restoreNode = this._heimdall.current;
    this._heimdall._session.current = this._node;
  }
}
