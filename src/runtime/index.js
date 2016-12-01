import Session from './session';
import now from '../shared/time';
import { format } from '../shared/time';
import EmptyObject from '../shared/empty-object';
import { NULL_NUMBER } from '../shared/counter-store';
import {
  OP_START,
  OP_STOP,
  OP_RESUME,
  OP_ANNOTATE
} from '../shared/op-codes';

export default class Heimdall {
  constructor(session) {
    if (arguments.length < 1) {
      session = new Session();
    }

    this._session = session;
  }

  get _monitors() {
    return this._session.monitors;
  }

  get _events() {
    return this._session.events;
  }

  _retrieveCounters() {
    return this._monitors.cache();
  }

  start(name) {
    return this._session.events.push(OP_START, name, now(), this._retrieveCounters());
  }

  stop(token) {
    this._session.events.push(OP_STOP, token, now(), this._retrieveCounters());
  }

  resume(token) {
    this._session.events.push(OP_RESUME, token, now(), this._retrieveCounters());
  }

  annotate(info) {
    // This has the side effect of making events heterogenous, as info is an object
    // while counters will always be `null` or an `Array`
    this._session.events.push(OP_ANNOTATE, NULL_NUMBER, NULL_NUMBER, info);
  }

  hasMonitor(name) {
    return !!this._monitors.has(name);
  }

  registerMonitor(name, ...keys) {
    if (name === 'own' || name === 'time') {
      throw new Error('Cannot register monitor at namespace "' + name + '".  "own" and "time" are reserved');
    }
    if (this.hasMonitor(name)) {
      throw new Error('A monitor for "' + name + '" is already registered"');
    }

    return this._monitors.registerNamespace(name, keys);
  }

  increment(token) {
    this._session.monitors.increment(token);
  }

  configFor(name) {
    let config = this._session.configs.get(name);

    if (!config) {
      config = new EmptyObject();
      this._session.configs.set(name, config);
    }

    return config;
  }

  /*
    Ideally, this method should only be used for serializing
    session data for transfer. Heimdall-tree can load time
    data from this format or out of `getSessionData`.
   */
  toJSON() {
    return {
      format,
      monitors: this._monitors.toJSON(),
      events: this._events.toJSON()
    };
  }

  toString() {
    return JSON.stringify(this.toJSON());
  }
}
