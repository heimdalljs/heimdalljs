import Session from './session';
import { format } from '../shared/time';
import { NULL_NUMBER } from '../shared/counter-store';
import makeDict from '../shared/dict';

import {
  OP_START,
  OP_STOP,
  OP_RESUME,
  OP_ANNOTATE
} from '../shared/op-codes';

const VERSION = 'VERSION_STRING_PLACEHOLDER';

export default class Heimdall {
  static get VERSION() {
    return VERSION;
  }

  constructor(session) {
    if (arguments.length < 1) {
      this._session = new Session();
      this.start('session-root');
    } else {
      this._session = session;
    }
  }

  get VERSION() {
    return VERSION;
  }

  get _monitors() {
    return this._session.monitors;
  }

  get _events() {
    return this._session.events;
  }

  get _performance() {
    return this._session._performance;
  }

  _retrieveCounters() {
    return this._monitors.cache();
  }

  enableTimelineScopes(scopes) {
    this._performance.enableScopes(scopes);
  }

  _trace(token, op, name) {
    this._performance.trace(token, op, name);
  }

  start(name) {
    let token = this._session.events.length;
    let tracer = this._trace(token, OP_START, name);
    this._session.events.push(OP_START, name, tracer, this._retrieveCounters());

    return token;
  }

  stop(token) {
    let tracer = this._trace(token, OP_STOP);
    this._session.events.push(OP_STOP, token, tracer, this._retrieveCounters());
  }

  resume(token) {
    let tracer = this._trace(token, OP_RESUME);
    this._session.events.push(OP_RESUME, token, tracer, this._retrieveCounters());
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
      config = makeDict();
      this._session.configs.set(name, config);
    }

    return config;
  }

  /*
    Ideally, this method should only be used for serializing
    session data for transfer. Heimdall-tree can load time
    data from this format or out of `getSessionData`.
   */
  // TODO this needs to grab timing information from the PerformanceMeasureInterface
  toJSON() {
    return {
      heimdallVersion: VERSION,
      format,
      monitors: this._monitors.toJSON(),
      events: this._events.toJSON(),
      timings: this._session.timings,
      serializationTime: this._performance.now()
    };
  }

  toString() {
    return JSON.stringify(this.toJSON());
  }
}
