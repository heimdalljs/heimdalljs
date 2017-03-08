import Session from './session';
import now from '../shared/time';
import { format } from '../shared/time';
import CounterStore from '../shared/counter-store';
import EventArray from '../shared/event-array';
import FastIntArray from '../shared/fast-int-array';
import { NULL_NUMBER } from '../shared/counter-store';
import OpCodes from '../shared/op-codes';
import JsonSerializable from '../interfaces/json-serializable';
import DeprecatedCookie from './deprecated-cookie';
import deprecate from '../shared/deprecate';

const VERSION = 'VERSION_STRING_PLACEHOLDER';

class DeprecatedNode {
  constructor() {

  }

  get stats() {

  }
}

export default class Heimdall implements JsonSerializable<Object> {
  private _session: Session;

  static get VERSION(): string {
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

  get VERSION(): string {
    return VERSION;
  }

  get _monitors(): CounterStore {
    return this._session.monitors;
  }

  get _events(): EventArray {
    return this._session.events;
  }

  _retrieveCounters(): Uint32Array | number[] | FastIntArray {
    return this._monitors.cache();
  }

  start(name: string): number {
    let token = this._session.events.push(OpCodes.OP_START, name, now(), this._retrieveCounters());
    return new DeprecatedCookie(token, this);
  }

  stop(token: number): void {
    this._session.events.push(OpCodes.OP_STOP, token.valueOf(), now(), this._retrieveCounters());
  }

  resume(token: number): void {
    this._session.events.push(OpCodes.OP_RESUME, token.valueOf(), now(), this._retrieveCounters());
  }

  removeNode() {
    // TODO make this notice better and make it actually segment data
    deprecate(`removeNode dont remove bro`, { id: 'remove-node', since: '0.3', until: '0.4'});
    throw new Error('Not Implemented!');
  }

  statsFor(name) {
    return this._monitors.getNamespace(name);
  }

  annotate(info: Uint32Array | number[] | FastIntArray): void {
    // This has the side effect of making events heterogenous, as info is an object
    // while counters will always be `null` or an `Array`
    this._session.events.push(OpCodes.OP_ANNOTATE, NULL_NUMBER, NULL_NUMBER, info);
  }

  hasMonitor(name): boolean {
    return !!this._monitors.has(name);
  }

  registerMonitor(name: string, ...keys: string[]): never | Object {
    if (name === 'own' || name === 'time') {
      throw new Error('Cannot register monitor at namespace "' + name + '".  "own" and "time" are reserved');
    }
    if (this.hasMonitor(name)) {
      throw new Error('A monitor for "' + name + '" is already registered"');
    }

    return this._monitors.registerNamespace(name, keys)
  }

  increment(token: number): void {
    this._session.monitors.increment(token);
  }

  configFor(name: string): any {
    let config = this._session.configs.get(name);

    if (!config) {
      config = Object.create(null);
      this._session.configs.set(name, config);
    }

    return config;
  }

  /*
    Ideally, this method should only be used for serializing
    session data for transfer. Heimdall-tree can load time
    data from this format or out of `getSessionData`.
   */
  toJSON(): Object {
    return {
      heimdallVersion: VERSION,
      format,
      monitors: this._monitors.toJSON(),
      events: this._events.toJSON(),
      serializationTime: now()
    };
  }

  toString(): string {
    return JSON.stringify(this.toJSON());
  }
}
