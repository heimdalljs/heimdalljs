import deprecate from '../shared/deprecate';
import Heimdall from './index';

const COOKIE_DEPRECATION_MSG = `Using the return of heimdall.start() is deprecated. All operations (start/resume/annotate etc.) should be done via the heimdall instance.`;
const COOKIE_DEPRECATION_OPTS = { id: 'Heimdall.cookie', since: '0.3', until: '0.4' };

export default class DeprecatedCookie extends Number {
  private __node: any;
  private __resumeNode: any;
  private _value: Number;
  private __heimdall: Heimdall;
  private __stopped: Boolean;

  constructor(value, node, heimdall) {
    super(value);
    this._value = value;
    this.__node = node;
    this.__resumeNode = null;
    this.__heimdall = heimdall;
    this.__stopped = false;
  }

  stop() {
    deprecate(COOKIE_DEPRECATION_MSG, COOKIE_DEPRECATION_OPTS);
    deprecate('cookie.stop', "HeimdallCookie has been deprecated. Refactor:" +
      "\n```\nlet cookie = heimdall.start(<string>); cookie.stop();```\n" +
      "\nto:\n```let token = heimdall.start(<string>); heimdall.stop(token);```");

    this.__heimdall.stop(this._value);
  }

  resume() {
    deprecate(COOKIE_DEPRECATION_MSG, COOKIE_DEPRECATION_OPTS);
    deprecate('cookie.resume', "HeimdallCookie has been deprecated. Refactor:" +
      "\n```\nlet cookie = heimdall.start(<string>); cookie.resume();```\n" +
      "\nto:\n```let token = heimdall.start(<string>); heimdall.resume(token);```");

    this.__heimdall.resume(this._value);
  }

  get _node() {
    deprecate(COOKIE_DEPRECATION_MSG, COOKIE_DEPRECATION_OPTS);

    return this.__node;
  }

  get _resumeNode() {
    deprecate(COOKIE_DEPRECATION_MSG, COOKIE_DEPRECATION_OPTS);

    return this.__resumeNode;
  }

  get _heimdall() {
    deprecate(COOKIE_DEPRECATION_MSG, COOKIE_DEPRECATION_OPTS);

    return this.__heimdall;
  }

  get _stopped() {
    deprecate(COOKIE_DEPRECATION_MSG, COOKIE_DEPRECATION_OPTS);

    return this.__stopped;
  }

  get stats() {
    deprecate(COOKIE_DEPRECATION_MSG, COOKIE_DEPRECATION_OPTS);

    return this._node.stats.own;
  }

  valueOf() {
    return this._value;
  }

  toString() {
    return `${this._value}`;
  }

  toJSON() {
    return this.toString();
  }
}
