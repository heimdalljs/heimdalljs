import EmptyObject from '../empty-object';

const MAP_INDEX = '__COUNTER-STORE-INDEX';
const STORE_SIZE = 1e6;
const HUGE_NUMBER = STORE_SIZE + 1;

function grow(arr, amount, fill) {
  let a = new Uint32Array(arr.length + amount);
  a.set(arr);

  if (fill) {
    a.fill(fill, arr.length);
  }

  return a;
}

export default class CounterStore {
  constructor() {
    this._store = new Uint32Array(STORE_SIZE);
    this._currentCachePosition = 0;
    this._currentCacheLength = 0;
    this._config = new Uint32Array();
    this._cache = null;
    this._cacheSeries = [];
    this._pointerCache = new EmptyObject();
    this._labelCache = new EmptyObject();
  }

  registerGroup(name, counters) {
    let tokens = [];
    let map = new EmptyObject();
    let labelMap = new EmptyObject();
    let mapIndex = this._config.length;
    let pointers = this._pointerCache;

    map[MAP_INDEX] = mapIndex;
    labelMap[MAP_INDEX] = mapIndex;

    this._config.push(counters.length);
    this._labelCache[name] = labelMap;

    for (let i = 0; i < counters.length; i++) {
      let label = counters[i];
      let token = `${name}:${label}`;
      labelMap[label] = i;

      /*
        `map` and `pointers` are a less efficient way of doing what
        we think we're capable of doing with a single integer.  All
        keys for a map point to the map, which has it's own
        index, and from which the same key will point to the
        child index.

        e.g. given a token `A`

        `let a = pointers[A][MAP_INDEX];` is the index within view/cache/config
        of this counter group, while

        `let b = pointers[A][A];` is the index within the counter group

        It may be possible to refactor this to a single TypedArray with keys
        as numbers where the first half the bytes reference the group and the
        second half reference the offset.
       */
      map[token] = i;
      pointers[token] = map;
      tokens.push(token);
    }

    // we need to adjust the lengths of
    // view/cache/config greedily
    this._adjustCurrentCache();

    return tokens;
  }

  _adjustCurrentCache() {
    if (this._currentCacheLength > 0) {
      this._config = grow(this._config, 1, 0);
      this._cache = grow(this._cache, 1, HUGE_NUMBER);
    }
  }

  cache() {
    if (this._currentCacheLength > 0) {
      this._cacheSeries.push(this._cache);
      this._cache = null;
      this._currentCachePosition += this._currentCacheLength;
      this._currentCacheLength = 0;
    }
  }

  increment(counter) {
    let map = this._pointerCache[counter];
    let mapIndex = map[MAP_INDEX];
    let counterIndex = map[counter];

    if (this._currentCacheLength === 0) {
      let len = this._config.length;
      this._cache = new Uint32Array(len).fill(HUGE_NUMBER);
    }

    if (this._cache[mapIndex] === HUGE_NUMBER) {
      let counterCount = this._config[mapIndex];
      this._cache[mapIndex] = this._currentCachePosition + this._currentCacheLength;

      this._currentCacheLength += counterCount;
    }

    let storeIndex = this._cache[mapIndex] + counterIndex;
    this._store[storeIndex]++;
  }

}