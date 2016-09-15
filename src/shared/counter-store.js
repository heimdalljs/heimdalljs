import EmptyObject from './empty-object';
import { MAX_ARRAY_LENGTH, FastIntArray } from './fast-int-array';
const DEFAULT_STORE_SIZE = 1e3;
const DEFAULT_NAMESPACE_SIZE = 10;

// NULL_NUMBER is a number larger than the largest
// index we are capable of utilizing in the store.
// if an index is this number, we know that it is null.
export const NULL_NUMBER = MAX_ARRAY_LENGTH + 1;
const LOB = (1 << 16) - 1;

export default class CounterStore {
  constructor(options = {}) {
    this.options = options;
    this.initialized = false;
    this._storeInitialized = false;
    this._store = null;
    this._namespaceCount = 0;
    this._config = null;
    this._cache = null;
    this._labelCache = null;
    this._nameCache = null;
  }

  toJSON() {
    return {
      _namespaceCount: this._namespaceCount,
      _config: this._config,
      _labelCache: this._labelCache,
      _nameCache: this._nameCache,
      _store: this._store
    }
  }

  static fromJSON(json) {
    let store = new CounterStore();
    store._namespaceCount = json._namespaceCount;
    store._labelCache = json._labelCache;
    store._nameCache = json._nameCache;

    if (json._store) {
      store._store = new FastIntArray(json._store.length, json._store);
    }

    if (json._config) {
      store._config = new FastIntArray(json._config.length, json._config);
    }
  }

  registerNamespace(name, labels) {
    this._initializeIfNeeded();

    let numCounters = labels.length;
    let counters = new Array(numCounters);
    let namespaceIndex = this._namespaceCount++;
    let bitNamespaceIndex = namespaceIndex << 16;

    // we also generate a map between the counters
    // and these labels so that we can reconstruct
    // a meaningful structure later.
    this._nameCache[namespaceIndex] = name;
    this._labelCache[name] = labels;

    // grow the existing config and cache to account
    // for the new namespace
    this._config.push(numCounters);

    if (this._cache !== null) {
      let cache = this._cache;

      this._cache = new Uint32Array(this._namespaceCount);
      this._cache.set(cache);
      this._cache[namespaceIndex] = NULL_NUMBER;
    }

    for (let i = 0; i < numCounters; i++) {
      counters[i] = bitNamespaceIndex + i;
    }

    return counters;
  }

  _initializeIfNeeded() {
    if (this.initialized === false) {
      this._config = new FastIntArray(this.options.namespaceAllocation || DEFAULT_NAMESPACE_SIZE);
      this._labelCache = new EmptyObject();
      this._nameCache = new EmptyObject();
      this.initialized = true;
    }
  }

  restoreFromCache(cache) {
    let stats = new EmptyObject();

    for (let i = 0; i < cache.length; i++) {
      if (cache[i] !== NULL_NUMBER) {
        let startIndex = cache[i];
        let namespace = this._nameCache[i];
        let counterCount = this._config.get(i);

        stats[namespace] = new EmptyObject();

        for (let j = 0; j < counterCount; j++) {
          let storeIndex = startIndex + j;
          let label = this._labelCache[namespace][j];

          stats[namespace][label] = this._store.get(storeIndex);
        }
      }
    }

    return stats;
  }

  increment(counter) {
    let namespaceIndex = counter >> 16;
    let counterIndex = counter & LOB;

    if (this._cache === null) {
      this._initializeStoreIfNeeded();
      this._cache = new Uint32Array(this._namespaceCount).fill(NULL_NUMBER);
    }

    if (this._cache[namespaceIndex] === NULL_NUMBER) {
      let counterCount = this._config.get(namespaceIndex);

      this._cache[namespaceIndex] = this._store.length;
      this._store.claim(counterCount);
    }

    let storeIndex = this._cache[namespaceIndex] + counterIndex;
    this._store.increment(storeIndex);
  }

  _initializeStoreIfNeeded() {
    if (this._storeInitialized === false) {
      this._store = new FastIntArray(this.options.storeSize || DEFAULT_STORE_SIZE);
      this._storeInitialized = true;
    }
  }

  has(name) {
    return this._labelCache && name in this._labelCache;
  }

  cache() {
    let cache = this._cache;
    this._cache = null;

    return cache;
  }
}