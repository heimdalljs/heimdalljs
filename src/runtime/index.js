import Session from './session';
import now from '../shared/time';
import EmptyObject from '../shared/empty-object';
import { NULL_NUMBER } from '../shared/counter-store';
import {
  OP_START,
  OP_STOP,
  OP_RESUME,
  OP_ANNOTATE
} from '../shared/op-codes';

export default class Heimdall{
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
    this._events.push([OP_START, name, now(), this._retrieveCounters()]);

    return this._events.length - 1;
  }

  stop(token) {
    this._events.push([OP_STOP, token, now(), this._retrieveCounters()]);
  }

  resume(token) {
    this._events.push([OP_RESUME, token, now(), this._retrieveCounters()]);
  }

  annotate(info) {
    // This has the side effect of making events heterogenous, as info is an object
    // while counters will always be `null` or an `Array`
    this._events.push([OP_ANNOTATE, NULL_NUMBER, NULL_NUMBER, info]);
  }

  registerMonitor(name, ...keys) {
    if (name === 'own' || name === 'time') {
      throw new Error('Cannot register monitor at namespace "' + name + '".  "own" and "time" are reserved');
    }
    if (this._monitors.has(name)) {
      throw new Error('A monitor for "' + name + '" is already registered"');
    }

    return this._monitors.registerNamespace(name, keys);
  }

  increment(token) {
    this._monitors.increment(token);
  }

  configFor(name) {
    let config = this._session.configs.get(name);

    if (!config) {
      config = this._session.configs.set(name, new EmptyObject());
    }

    return config;
  }

  /*
    Ideally, this method should only be used for serializing
    session data for transfer. Heimdall-tree can load time
    data from this format or out of `getSessionData`.
   */
  toJSON() {
    throw new Error('TODO, implement');
  }
}
