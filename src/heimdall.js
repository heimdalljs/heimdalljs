import Session from './session';
import now from './time';
import EmptyObject from './empty-object';

// op codes
const OP_START = 0;
const OP_STOP = 1;
const OP_RESUME = 2;
const OP_ARGS = 3;

export default class Heimdall{
  constructor(session) {
    if (arguments.length < 1) {
      session = new Session();
    }

    this._session = session;
  }

  get _events() {
    return this._session._events;
  }

  get _stats() {
    return this._session.stats;
  }

  set _stats(v) {
    this._session.stats = v;
  }

  start(name) {
    this._events.push([OP_START, name, now(), this._stats]);
    this._stats = null;

    return this._events.length - 1;
  }

  stop(token) {
    this._events.push([OP_STOP, token, now(), this._stats]);
    this._stats = null;
  }

  resume(token) {
    this._events.push([OP_RESUME, token, now(), this._stats]);
    this._stats = null;
  }

  startWithStats(name, ...keys) {
    if (this._stats === null) {
      this._stats = new EmptyObject();
    }

    let stats = this._stats;


    throw new Error('NOT IMPLEMENTED');
  }

  setArgs(args) {
    // This has the side effect of making events heterogenous
    this._events.push([OP_ARGS, null, null, args]);
  }

  registerMonitor(name, ...keys) {
    if (name === 'own' || name === 'time') {
      throw new Error('Cannot register monitor at namespace "' + name + '".  "own" and "time" are reserved');
    }
    if (this._session.monitorSchemas.has(name)) {
      throw new Error('A monitor for "' + name + '" is already registered"');
    }

    let len = keys.length;
    let schema = new EmptyObject();
    let tokens = new Array(len);

    for (let i = 0; i < len; i++) {
      let statKey = `${name}.${keys[i]}`;
      tokens[i] = statKey;
      schema[keys[i]] = statKey;
      this._StatSchema.prototype[statKey] = 0;
    }

    new this._StatSchema();

    this._session.monitorSchemas.set(name, schema);

    return tokens;
  }

  setStat(token, value) {
    if (this._stats === null) {
      this._stats = new EmptyObject();
    }
  }

  configFor(name) {
    let config = this._session.configs.get(name);

    if (!config) {
      config = this._session.configs.set(name, new EmptyObject());
    }

    return config;
  }

  toJSON() {
    throw new Error('TODO, implement');
  }

  visitPreOrder(cb) {
    throw new Error('TODO, implement');
  }

  visitPostOrder(cb) {
    throw new Error('TODO, implement');
  }

  generateNextId() {
    return this._session.generateNextId();
  }
}
