import EmptyObject from '../empty-object';
const MAP_INDEX = '__COUNTER-STORE-INDEX';
const STORE_SIZE = 1e3;
const HUGE_NUMBER = STORE_SIZE + 1;
const LOB = (1 << 16) - 1;

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
    this._config = [];
    this._cache = null;
    this._cacheSeries = [];
    this._labelCache = new EmptyObject();
  }

  registerGroup(name, counters) {
    let tokens = [];
    let labelMap = new EmptyObject();
    let mapIndex = this._config.length;

    labelMap[MAP_INDEX] = mapIndex;

    this._config.push(counters.length);
    this._labelCache[name] = labelMap;

    for (let i = 0; i < counters.length; i++) {
      let token = (mapIndex << 16) + i;
      let label = counters[i];
      labelMap[label] = i;

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
    let namespaceIndex = counter >> 16;
    let counterIndex = counter & LOB;

    if (this._currentCacheLength === 0) {
      let len = this._config.length;
      this._cache = new Uint32Array(len).fill(HUGE_NUMBER);
    }

    if (this._cache[namespaceIndex] === HUGE_NUMBER) {
      let counterCount = this._config[namespaceIndex];
      this._cache[namespaceIndex] = this._currentCachePosition + this._currentCacheLength;

      this._currentCacheLength += counterCount;
    }

    let storeIndex = this._cache[namespaceIndex] + counterIndex;
    this._store[storeIndex]++;
  }

}