import Session from './session';
import now from '../shared/time';
import { format } from '../shared/time';
import { NULL_NUMBER } from '../shared/counter-store';
import {
  OP_START,
  OP_STOP,
  OP_RESUME,
  OP_ANNOTATE
} from '../shared/op-codes';

const VERSION = 'VERSION_STRING_PLACEHOLDER';

function splitFirstColon(str) {
  let i = str.indexOf(':');
  let first = str;
  let rest = '*';

  if (i !== -1) {
    first = str.substr(0, i);
    rest = str.substr(i + 1);
  }

  return [first, rest];
}

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

    this._enableTimelineFeatures = false;
    this.__timelineInfo = null;
  }

  get _timelineInfo() {
    if (!this.__timelineInfo) {
      this.__timelineInfo = {
        timers: Object.create(null),
        namespaces: Object.create(null)
      };
    }

    return this.__timelineInfo;
  }

  enableTimelineFeatures(matchQuery) {
    this._enableTimelineFeatures = true;
    let info = this._timelineInfo;

    if (matchQuery) {
      let namespaces = matchQuery.split(',');
      namespaces.forEach((str) => {
        let [namespaceKey, section] = splitFirstColon(str);
        let namespace = info.namespaces[namespaceKey] = info.namespaces[namespaceKey] || Object.create(null);

        namespace[section] = true;
      });
    } else {
      info.namespaces['*'] = true;
    }
  }

  _checkTimelineEnabledForNode(name) {
    let [namespace, section] = splitFirstColon(name);
    let enabledNamespaces = this._timelineInfo.namespaces;
    let globalEnabled = !!enabledNamespaces['*'];
    let namespaceGlobalEnabled = enabledNamespaces[namespace] && !!enabledNamespaces[namespace]['*'];
    let namespaceSectionEnabled = enabledNamespaces[namespace] && !!enabledNamespaces[namespace][section];

    return globalEnabled || namespaceGlobalEnabled || namespaceSectionEnabled;
  }

  _timelineTimerStart(name, token) {
    if (this._enableTimelineFeatures) {
      if (this._checkTimelineEnabledForNode(name)) {
        let label = `${name}--:${token}`;
        this._timelineInfo.timers[token] = label;
        console.time(label);
      }
    }
  }

  _timelineTimerEnd(token) {
    if (this._enableTimelineFeatures) {
      let label = this._timelineInfo.timers[token];

      if (label) {
        console.timeEnd(label);
      }
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

  _retrieveCounters() {
    return this._monitors.cache();
  }

  start(name) {
    let token = this._session.events.push(OP_START, name, now(), this._retrieveCounters());
    this._timelineTimerStart(name, token);
    return token;
  }

  stop(token) {
    this._timelineTimerEnd(token);
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
  toJSON() {
    return {
      heimdallVersion: VERSION,
      format,
      monitors: this._monitors.toJSON(),
      events: this._events.toJSON(),
      serializationTime: now()
    };
  }

  toString() {
    return JSON.stringify(this.toJSON());
  }
}
