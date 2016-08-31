import { Promise } from 'rsvp';
import FastArray from './fast-array';
import HeimdallNode from './node';
import Session from './session';
import timeNS from './time';

export default class Heimdall{
  constructor(session, options = {}) {
    if (arguments.length < 1) {
      session = new Session();
    }

    this.options = options;
    this._nodes = new FastArray(options.preallocateCount || 1001);

    this._session = session;
    this._reset(false);
  }

  get current() {
    return this._session.current;
  }

  get root() {
    return this._session.root;
  }

  _reset(resetSession) {
    if (resetSession !== false) {
      this._session.reset();
    }

    if (!this.root) {
      // The first heimdall to start will create the session and root.  Subsequent
      // heimdall instances continue to use the existing graph
      this.start('heimdall');
      this._session.root = this._session.current;
    }
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

    let node = new HeimdallNode(this, id, data);
    let token = this._nodes.length;
    this._nodes.push(node);

    if (this.current) {
      this.current.addChild(node);
    }

    this._session.current = node;

    return token;
  }

  stop(token) {
    let node = this._nodes.get(token);

    if (node._stopped === true) {
      throw new TypeError('cannot stop: already stopped');
    } else if (this.current !== node) {
      throw new TypeError('cannot stop: not the current node');
    }

    node._stopped = true;
    this._recordTime();
    this._session.current = node._restoreNode;
  }

  resume(token) {
    let node = this._nodes.get(token);

    if (node._stopped === false) {
      throw new TypeError('cannot resume: not stopped');
    }

    node._stopped = false;
    node._restoreNode = this.current;
    this._session.current = node;
  }

  statsForNode(token) {
    let node = this._nodes.get(token);

    return node.stats;
  }

  _recordTime() {
    let time = timeNS();

    // always true except for root
    if (this.current) {
      let delta = time - this._session.previousTimeNS;
      this.current.stats.time.self += delta;
    }
    this._session.previousTimeNS = time;
  }

  node(name, Schema, callback, context) {
    if (arguments.length < 3) {
      callback = Schema;
      Schema = undefined;
    }

    let token = this.start(name, Schema);
    let node = this._nodes.get(token);

    // NOTE: only works in very specific scenarios, specifically promises must
    // not escape their parents lifetime. In theory, promises could be augmented
    // to support those more advanced scenarios.
    return new Promise(resolve => resolve(callback.call(context, node.stats.own))).
      finally(() => this.stop(token));
  }

  registerMonitor(name, Schema) {
    if (name === 'own' || name === 'time') {
      throw new Error('Cannot register monitor at namespace "' + name + '".  "own" and "time" are reserved');
    }
    if (this._session.monitorSchemas.has(name)) {
      throw new Error('A monitor for "' + name + '" is already registered"');
    }

    this._session.monitorSchemas.set(name, Schema);
  }

  statsFor(name) {
    let stats = this.current.stats;
    let Schema;

    if (!stats[name]) {
      Schema = this._session.monitorSchemas.get(name);
      if (!Schema) {
        throw new Error('No monitor registered for "' + name + '"');
      }
      stats[name] = new Schema();
    }

    return stats[name];
  }

  configFor(name) {
    let config = this._session.configs.get(name);

    if (!config) {
      config = this._session.configs.set(name, {});
    }

    return config;
  }

  toJSON() {
    return { nodes: this.root.toJSONSubgraph() };
  }

  visitPreOrder(cb) {
    return this.root.visitPreOrder(cb);
  }

  visitPostOrder(cb) {
    return this.root.visitPostOrder(cb);
  }

  generateNextId() {
    return this._session.generateNextId();
  }

  get stack() {
    let stack = [];
    let top = this.current;

    while (top !== undefined && top !== this.root) {
      stack.unshift(top);
      top = top.parent;
    }

    return stack.map(node => node.id.name);
  }
}
