import Session from './session';
import now from '../shared/time';
import { format } from '../shared/time';
import CounterStore from '../shared/counter-store';
import EventArray from '../shared/event-array';
import FastIntArray from '../shared/fast-int-array';
import { NULL_NUMBER } from '../shared/counter-store';
import OpCodes from '../shared/op-codes';
import JsonSerializable from '../interfaces/json-serializable';

const VERSION = 'VERSION_STRING_PLACEHOLDER';

export default class Heimdall implements JsonSerializable<object> {
  private _session: Session;

  private _retrieveCounters(): Uint32Array | number[] | FastIntArray {
    return this._monitors.cache();
  }

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

  public start(name: string): number {
    return this._session.events.push(OpCodes.OP_START, name, now(), this._retrieveCounters());
  }

  public stop(token: number): void {
    this._session.events.push(OpCodes.OP_STOP, token, now(), this._retrieveCounters());
  }

  public resume(token: number): void {
    this._session.events.push(OpCodes.OP_RESUME, token, now(), this._retrieveCounters());
  }

  public annotate(info: Uint32Array | number[] | FastIntArray): void {
    // This has the side effect of making events heterogenous, as info is an object
    // while counters will always be `null` or an `Array`
    this._session.events.push(OpCodes.OP_ANNOTATE, NULL_NUMBER, NULL_NUMBER, info);
  }

  public hasMonitor(name): boolean {
    return !!this._monitors.has(name);
  }

  public registerMonitor(name: string, ...keys: string[]): never | object {
    if (name === 'own' || name === 'time') {
      throw new Error('Cannot register monitor at namespace "' + name + '".  "own" and "time" are reserved');
    }
    if (this.hasMonitor(name)) {
      throw new Error('A monitor for "' + name + '" is already registered"');
    }

    return this._monitors.registerNamespace(name, keys);
  }

  public increment(token: number): void {
    this._session.monitors.increment(token);
  }

  public configFor(name: string): any {
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
  public toJSON(): object {
    return {
      heimdallVersion: VERSION,
      format,
      monitors: this._monitors.toJSON(),
      events: this._events.toJSON(),
      serializationTime: now()
    };
  }

  public toString(): string {
    return JSON.stringify(this.toJSON());
  }
}
