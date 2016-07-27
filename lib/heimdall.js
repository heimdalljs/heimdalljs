import { Promise } from 'rsvp';
import Cookie from './cookie';
import HeimdallNode from './node';

export const VERSION = '0.0.1';

class Heimdall {
  constructor() {
    this.version = VERSION;

    this._reset();
  }

  get current() {
    return this._current;
  }

  _reset() {
    this._nextId = 0;
    this._current = undefined;
    this._previousTime = undefined;
    this.start('heimdall');
    this._root = this._current;
    this._monitorSchema = {};
  }

  log() {

  }

  start(name, Schema) {
    let id;
    let data;

    if (typeof name === 'string') {
      id = { name: name };
    } else {
      id = name;
    }

    if (typeof Schema === 'function') {
      data = new Schema();
    } else {
      data = {};
    }

    this._recordTime();

    let node = new HeimdallNode(this, id, data, this._current);
    // always true except for root
    if (this._current) {
      this._current.addChild(node);
    }
    this._current = node;

    return new Cookie(node, this);
  }

  _recordTime() {
    let time = process.hrtime();
    // always true except for root
    if (this._current) {
      let delta = (time[0] - this._previousTime[0]) * 1e9 + (time[1] - this._previousTime[1]);
      this._current.stats.time.self += delta;
    }
    this._previousTime = time;
  }

  node(name, Schema, callback, context) {
    if (arguments.length < 3) {
      callback = Schema;
      Schema = undefined;
    }

    let cookie = this.start(name, Schema);

    // NOTE: only works in very specific scenarios, specifically promises must
    // not escape their parents lifetime. In theory, promises could be augmented
    // to support those more advanced scenarios.
    return new Promise(resolve => {
      resolve(callback.call(context, cookie.node.stats.own));
    }).finally(() => cookie.stop())
  }

  registerMonitor(name, Schema) {
    if (name === 'own' || name === 'time') {
      throw new Error('Cannot register monitor at namespace "' + name + '".  "own" and "time" are reserved');
    }
    if (this._monitorSchema[name]) {
      throw new Error('A monitor for "' + name + '" is already registered"');
    }
    this._monitorSchema[name] = Schema;
  }

  statsFor(name) {
    let stats = this._current.stats;
    let Schema;

    if (!stats[name]) {
      Schema = this._monitorSchema[name];
      if (!Schema) {
        throw new Error('No monitor registered for "' + name + '"');
      }
      stats[name] = new Schema();
    }

    return stats[name];
  }

  toJSON() {
    let nodes = [];

    this.visitPreOrder(node => nodes.push(node.toJSON()));

    return { nodes };
  }

  visitPreOrder(cb) {
    this._root.visitPreOrder(cb);
  }

  visitPostOrder(cb) {
    this._root.visitPostOrder(cb);
  }

  _createStats(data) {
    let stats = {
      own: data,
      time: { self: 0 },
    };
    return stats;
  }

  get stack() {
    var stack = [];
    var top = this._current;

    while (top !== undefined && top !== this._root) {
      stack.unshift(top);
      top = top.parent;
    }

    return stack.map(node => node.id.name);
  }
}

  // TODO: implement, and work nicely with DEBUG=*
Heimdall.prototype.log.verbose = function() {};

export default Heimdall;


