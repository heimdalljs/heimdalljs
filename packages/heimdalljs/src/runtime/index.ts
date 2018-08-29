import Session from './session';
import now, { format } from '../shared/time';
import EventArray from '../shared/event-array';
import FastIntArray from '../shared/fast-int-array';
import CounterStore, { NULL_NUMBER } from '../shared/counter-store';
import OpCodes from '../shared/op-codes';
import JsonSerializable from '../interfaces/json-serializable';

const VERSION = 'VERSION_STRING_PLACEHOLDER';

/**
 * @class Heimdall
 *
 * Takes an optional HeimdallSession instance to use,
 * will use the global session otherwise.
 *
 * @param {HeimdallSession} [session]
 *
 * @constructor
 */
export default class Heimdall implements JsonSerializable<object> {
  private _session: Session;

  /**
   * Proxy method to cache the current counts on the session's monitors.
   * @method _retrieveCounters
   * @returns {Array} an array with cache information that can be used later
   *   to reconstruct counts at the time this was called.
   * @private
   */
  private _retrieveCounters(): Uint32Array | number[] | FastIntArray {
    return this._monitors.cache();
  }

  /**
   * @property {string} the heimdall version number
   * @static
   */
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

  /**
   * @property {string} the heimdall version number
   */
  get VERSION(): string {
    return VERSION;
  }

  /**
   * Proxy property to the heimdallSession.monitors
   * @property {CounterStore} _monitors
   * @private
   */
  get _monitors(): CounterStore {
    return this._session.monitors;
  }

  /**
   * Proxy property to the heimdallSession.events
   * @property {EventArray} _events
   * @private
   */
  get _events(): EventArray {
    return this._session.events;
  }

  /**
   * Starts a timer
   *
   * @method start
   * @param {String} name
   * @returns {Number} a token that can be given to `stop()` and `resume()` to identify the timer
   */
  public start(name: string): number {
    return this._session.events.push(OpCodes.OP_START, name, now(), this._retrieveCounters());
  }

  /**
   * Stops a timer previously activated by a call to `start` or `resume`
   *
   * @method stop
   * @param {Number} token, the return value of a call to heimdall.start()
   */
  public stop(token: number): void {
    this._session.events.push(OpCodes.OP_STOP, token, now(), this._retrieveCounters());
  }

  /**
   * Restarts a previously stopped timer.
   *
   * @method resume
   * @param {Number} token, the return value of a call to heimdall.start()
   */
  public resume(token: number): void {
    this._session.events.push(OpCodes.OP_RESUME, token, now(), this._retrieveCounters());
  }

  /**
   * Adds arbitrary information as an annotation to the active timer.
   *
   * @param {*} info
   */
  public annotate(info: Uint32Array | number[] | FastIntArray): void {
    this._session.events.push(OpCodes.OP_ANNOTATE, NULL_NUMBER, NULL_NUMBER, info);
  }

  /**
   * @method hasMonitor
   * @param name
   * @returns {boolean}
   */
  public hasMonitor(name): boolean {
    return !!this._monitors.has(name);
  }

  /**
   * @method registerMonitor
   * @param name, the unique name for this monitor
   * @param {String} ...keys one or more strings to use as keys for counters
   * @returns {Object} as object with the keys provided as keys whose values are tokens that can be given
   * to
   */
  public registerMonitor(name: string, ...keys: string[]): never | object {
    if (name === 'own' || name === 'time') {
      throw new Error('Cannot register monitor at namespace "' + name + '".  "own" and "time" are reserved');
    }
    if (this.hasMonitor(name)) {
      throw new Error('A monitor for "' + name + '" is already registered"');
    }

    return this._monitors.registerNamespace(name, keys);
  }

  /**
   * Increments the counter represented by the token.
   * To generate a token, use `heimdall.registerMonitor`. Tokens are the values
   * assigned to the user supplied keys in the hash returned by `heimdall.registerMonitor`
   *
   * @method increment
   * @param token
   */
  public increment(token: number): void {
    this._session.monitors.increment(token);
  }

  /**
   * Returns a singleton object unique to the supplied name useful
   * for storing arbitrary meta-data that's not associated with a specific
   * point in time.
   *
   * @method configFor
   * @param {String} name
   * @returns {*}
   */
  public configFor(name: string): any {
    let config = this._session.configs.get(name);

    if (!config) {
      config = Object.create(null);
      this._session.configs.set(name, config);
    }

    return config;
  }

  /**
   * Produces a serialized version of current state of the session
   * along with any meta data necessary for constructing a full picture
   * of that state later.
   *
   * Ideally, this method should only be used for serializing
   * session data for transfer. HeimdallTree can load data
   * data from this format or from a heimdall instance directly.
   *
   * @method toJSON
   * @returns {Object}
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

  /**
   * @method toString
   * @returns {String} the stringified version of calling `toJSON`
   */
  public toString(): string {
    return JSON.stringify(this.toJSON());
  }
}
