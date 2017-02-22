import { default as now, HAS_PERFORMANCE_NOW } from './time';
import makeDict from './dict';
import {
  OP_START,
  OP_STOP,
  OP_RESUME
} from './op-codes';

export const HAS_MEASURE_API = HAS_PERFORMANCE_NOW && !!performance.mark && !!performance.measure;
let TRACE_ID = 1;

export function splitFirstColon(str) {
  let i = str.indexOf(':');
  let first = str;
  let rest = '*';

  if (i !== -1) {
    first = str.substr(0, i);
    rest = str.substr(i + 1);
  }

  return [first, rest];
}

export class Mark {
  constructor(traceId, label) {
    this.label = label;
    this.startMark = traceId;
    this.originalMark = traceId;
    this.originalLabel = label;
  }

  resume(traceId, label) {
    this.startMark = traceId;
    this.label = label;
  }
}

export class ScopeCache {
  constructor() {
    this._lookupCache = makeDict();
    this._activeScopes = makeDict();
  }

  enable(matchQuery) {
    let cache = this._activeScopes;

    if (matchQuery) {
      let scopes = matchQuery.split(',');

      for (let i = 0, l = scopes.length; i < l; i++) {
        let parts = splitFirstColon(scopes[i]);
        let scopeKey = parts[0];
        let subScopeKey = parts[1] || '*';
        let scope = cache[scopeKey];

        if (!scope) {
          scope = cache[scopeKey] = makeDict();
        }

        scope[subScopeKey] = true;
      }
    } else {
      cache['*'] = true;
    }
  }

  /**
   * Checks whether the scope is enabled for a particular path (name of a timer passed in to heimdall.start`).
   *
   * For example:
   *
   * '*' => globally enabled scope
   * 'finder:*' => scope with all of the sub-scopes enabled
   * 'finder:query' => only sub-scope enabled
   *
   * @param {String} path
   * @returns {Boolean}
   * @private
   */
  isActive(path) {
    let pathCache = this._lookupCache;

    if (pathCache[path] !== undefined) {
      return pathCache[path];
    }

    let parts = splitFirstColon(path);
    let scope = parts[0];
    let subScope = parts[1] || '*';

    let enabledScopes = this._activeScopes;
    let globalEnabled = !!enabledScopes['*'];
    let scopeGlobalEnabled = enabledScopes[scope] && !!enabledScopes[scope]['*'];
    let subScopeEnabled = enabledScopes[scope] && !!enabledScopes[scope][subScope];

    return pathCache[path] = globalEnabled || scopeGlobalEnabled || subScopeEnabled;
  }
}

/**
 * @class PerformanceMeasure
 *
 * This API is _similar_ to the Performance interface https://developer.mozilla.org/en-US/docs/Web/API/Performance
 * however, it diverges in a couple of key scenarios detailed below:
 *
 * 1) To support enabling/disabling timeline measuring by "scope", it introduces a `trace()` method
 * which enhances the `mark` functionality by expecting more information about the nature of the
 * mark being requested.
 *
 * 2) To support measurements appearing in the timeline for Safari and Node, it additionally falls back
 * to `console.time(<label>)` and `console.timeEnd(<label>)`. Whereas `performance.measure` uses async
 * marks and can be called after-the-fact to add the annotation to the timeline, the console variant
 * is synchronous and must be called at the same point at which the mark is created. This is another
 * motivation for the `trace` API having extend information about the nature of the mark requested.
 *
 * 3) Additionally, `performance.measure` expects to be given the names of two previously created `marks`; however,
 * `performance.mark` intentionally supports calling `mark` with the same name repeatedly. This makes these two APIs
 * at odds. Instead of using the name passed into `heimdall.start()`, we use the `traceId` we generate for that mark
 * to ensure a unique mark name.
 */
export default class PerformanceMeasure {
  constructor() {
    /**
     When an environment does not support the performance.mark and performance.measure APIs, we
     fallback to pushing timestamps into this array when we call mark.

     @property {Array} _timings
     @private
     */
    this._timings = PerformanceMeasure.hasMeasureApi ? null : makeDict();

    /**
      When `true`, activate timer "scopes" will have their duration marked
       in the console timeline when profiling.

      @property {Boolean} _enableMeasurements
      @private
     */
    this._enableMeasurements = false;

    // cache for _scopeCache
    this.__scopeCache = null;

    // cache for _startMarksCache
    this.__startMarksCache = null;
  }

  static get hasMeasureApi() {
    return HAS_MEASURE_API;
  }

  /**
   Cache used for storing parsed scopes, cached scope lookups, and active timers.

   @property {Object} _scopeCache
   @private
   */
  get _scopeCache() {
    if (!this.__scopeCache) {
      this.__scopeCache = new ScopeCache();
    }

    return this.__scopeCache;
  }

  get _startMarksCache() {
    if (!this.__startMarksCache) {
      this.__startMarksCache = makeDict();
    }

    return this.__startMarksCache;
  }

  /**
    This is the primary method by which heimdall will interact with the PerformanceMeasureInterface

    // TODO explain a bit more what this does and why

    @method trace
    @param {Number} id the heimdall token generated with a call to `heimdall.start`
    @param {Number} opCode
    @param {String} name
    @return {Number} a unique ID that can be used to trace and find this mark later.
   */
  trace(id, opCode, name) {
    let traceId = TRACE_ID++;
    this.mark(traceId);
    this._measureMarks(traceId, id, opCode, name);
    return traceId;
  }

  /**
   * Measure operates in three different modes: start/stop/resume.
   * They are all implemented slightly differently depending on the
   * support for Performance API.
   *
   * Performance API has a concept of `mark` and `measure` and the
   * typical usage would be as follows:
   *
   * performance.mark('start-label');
   * performance.mark('end-label');
   * performance.measure('chrome-devtools-timeline-name', 'start-label', 'end-label');
   *
   * Console Time API has a concept of `time` and `timeEnd` and the
   * typical usage would be as follows:
   *
   * console.time('chrome-devtools-timeline-name');
   * console.timeEnd('chrome-devtools-timeline-name');
   *
   * The core difference is:
   *
   * `performance.measure` is async operation whereas `console.time` and
   * `console.timeEnd` are sync.
   *
   * Both of the APIs do not support the concept of resuming tracing
   * (in the case of pending Promise of `yield`ing a task). In order to
   * support that operation, we match up measures by the trace id.
   *
   * @param {Number} traceId
   * @param {Number} id
   * @param {Number} opCode
   * @param {String} name
   * @private
   */
  _measureMarks(traceId, id, opCode, name) {
    if (!this._enableMeasurements) {
      return;
    }

    let startMarksCache = this._startMarksCache;
    let mark = startMarksCache[id];
    let hasExistingMark = !!mark;

    if (!hasExistingMark && (opCode !== OP_START || !this._scopeCache.isActive(name))) {
      return;
    }

    if (opCode === OP_STOP) {
      this.measure(mark.label, mark.startMark, traceId);

    } else if (opCode === OP_START) {
      mark = startMarksCache[id] = new Mark(traceId, `${name}-:${id}`);
      this.measureStart(mark.label);

    } else if (opCode === OP_RESUME) {
      mark.resume(traceId, `${mark.originalLabel}:${mark.originalMark}`);
      this.measureStart(mark.label);
    }
  }



  /**
   * Enables specific scopes tracing.
   *
   * Takes comma delineated scopes, i.e. 'finder:query,ajax'.
   *
   * '*' => globally enabled scope
   * 'finder:*' => scope with all of the sub-scopes enabled
   *
   * @param scopeMatchQuery
   * @public
   */
  enableScopes(scopeMatchQuery) {
    this._enableMeasurements = true;
    this._scopeCache.enable(scopeMatchQuery);
  }

  /**
   * Returns a high resolution time stamp depending on the environment. For Node.js, `process.hrtime`;
   * for browsers that support `performance.now()`, `DOMHighResTimeStamp` and `Date.now()` for the rest.
   * @method now
   * @returns {DOMHighResTimeStamp|Number|Array} the highest resolution time we can use for the environment
   */
  now() {
    return now();
  }

  /**
   * Creates a timestamp depending on the environment.
   *
   * Depending on the `mark` and `measure` support in the browsers,
   * `performance.mark` would be called; otherwise a new timestamp will be
   * created and stored.
   *
   * @param {Number} traceId
   */
  mark(traceId) {
    if (PerformanceMeasure.hasMeasureApi) {
      performance.mark(traceId);
    } else {
      this._timings[traceId] = this.now();
    }
  }

  /**
   * Starts a timer depending on the environment.
   *
   * If browser supports only `console.time` and `console.timeEnd`,
   * this method will start the timer via `console.time` and the label
   * that was passed in.
   *
   * If browser supports `performance.measure`, it will result in no-op
   * because a measure requires both the start and end "marks" to have
   * been created at the time it is invoked.
   *
   * @param {string} label
   */
  measureStart(label) {
    if (!PerformanceMeasure.hasMeasureApi) {
      console.time(label);
    }
  }

  /**
   * Closes the measurement.
   *
   * If browser supports only `console.time` and `console.timeEnd`,
   * this method will stop the timer via `console.timeEnd` and the label
   * that was passed in. This method has to be called synchronously right
   * after `markB` is created.
   *
   * If browser supports `performance.measure`, it will call `performance.measure`
   * with a chrome devtools label and both previously created marks.
   *
   * @param {String} label
   * @param {String} markA
   * @param {String} markB
   */
  measure(label, markA, markB) {
    if (PerformanceMeasure.hasMeasureApi) {
      performance.measure(label, markA, markB);
    } else {
      console.timeEnd(label);
    }
  }

  /**
   * Returns an array of timestamps.
   *
   * Depending on the `mark` and `measure` support in the browsers,
   * it will either return a dictionary of `PerformanceEntry.startTime`s or timestamps
   * that were created in `mark()`.  `PerformanceEntry.startTime` returns a `DOMHighResTimestamp`.
   *
   * @returns {Object} A dictionary of whose keys are the names marks with timestamps
   * as their values.
   */
  getEntries() {
    // when reconstructing a tree from the JSON of an exported session
    // we need to be able to access _timings instead.
    if (!this._timings && PerformanceMeasure.hasMeasureApi) {
      // TODO investigate if we have any guarantee of the order here being the same as the "Created" order.
      //   (it seems we do)
      // TODO possibly enable a way of "filtering" out marks we did not create (probably a simple "in range of traceId max" check)
      let marks = performance.getEntriesByType('mark');
      let timings = makeDict();

      for (let i = 0, l = marks.length; i < l; i++) {
        let name = marks[i].name;
        timings[name] = marks[i].startTime;
      }

      return timings;
    }
    return this._timings;
  }

  clearEntries() {
    this._timings = PerformanceMeasure.hasMeasureApi ? null : makeDict();
    this.__startMarksCache = null;
  }

  reset() {
    this.clearEntries();
    this._enableMeasurements = false;
    this.__scopeCache = null;
  }
}