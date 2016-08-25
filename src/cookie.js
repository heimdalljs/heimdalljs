import FastArray from 'perf-primitives/addon/fast-array';
export const RECYCLE_POOL = new FastArray(500, 'Cookie Pool');

export default class Cookie {
  constructor(node, heimdall) {
    this._init(node, heimdall);
  }

  _init(node, heimdall) {
    this._isDestroyed = false;
    this._node = node;
    this._restoreNode = node ? node.parent : undefined;
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
    this._heimdall._recordTime();
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

  static create(node, heimdall) {
    let obj = RECYCLE_POOL.pop();

    if (obj) {
      obj._init(node, heimdall);
      return obj;
    }

    return new Cookie(node, heimdall);
  }

  destroy() {
    if (!this._stopped) {
      throw new TypeError('cannot destroy: the current node is still active');
    }

    this._isDestroyed = true;
    this._stopped = false;
    this._node = undefined;
    this._restoreNode = undefined;
    this._heimdall = undefined;

    RECYCLE_POOL.push(this);
  }
}