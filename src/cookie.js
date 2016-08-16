import timeNS from './time';

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
      throw new TypeError('cannot stop: not the current node');
    } else if (this.stopped === true) {
      throw new TypeError('cannot stop: already stopped');
    }

    this._stopped = true;
    this._node._endTime = timeNS();
    this._heimdall._session.current = this._restoreNode;
  }

  resume() {
    if (this._stopped === false) {
      throw new TypeError('cannot resume: not stopped');
    }

    this._stopped = false;
    this._restoreNode = this._heimdall.current;
    this._heimdall._session.current = this._node;
  }
}
