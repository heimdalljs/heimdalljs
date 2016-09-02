import EmptyObject from '../empty-object';
import { MAX_ARRAY_LENGTH, FastIntArray } from './fast-int-array';
const NAMESPACE_INDEX_KEY = '__COUNTER-STORE-INDEX';
const DEFAULT_STORE_SIZE = 1e3;
const DEFAULT_NAMESPACE_SIZE = 10;

// NULL_NUMBER is a number larger than the largest
// index we are capable of utilizing in the store.
// if an index is this number, we know that it is null.
const NULL_NUMBER = MAX_ARRAY_LENGTH + 1;
const LOB = (1 << 16) - 1;

export default class CounterStore {
  constructor(options = {}) {
    this.options = options;
    this.initialized = false;
    this._store = null;
    this._namespaceCount = 0;
    this._config = null;
    this._cache = null;
    this._labelCache = null;
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
    let labelMap = new EmptyObject();

    labelMap[NAMESPACE_INDEX_KEY] = namespaceIndex;
    this._labelCache[name] = labelMap;

    // grow the existing config and cache to account
    // for the new namespace
    this._config.push(numCounters);

    if (this._cache !== null) {
      this._cache.push(NULL_NUMBER);
    }

    for (let i = 0; i < numCounters; i++) {
      let counter = bitNamespaceIndex + i;
      let label = counters[i];
      labelMap[label] = i;

      counters[i] = counter;
    }

    return counters;
  }

  _initializeIfNeeded() {
    if (this.initialized === false) {
      let opts = this.options;
      this._store = new FastIntArray(opts.storeSize || DEFAULT_STORE_SIZE);
      this._config = new FastIntArray(opts.namespaceAllocation || DEFAULT_NAMESPACE_SIZE);
      this._labelCache = new EmptyObject();
      this.initialized = true;
    }
  }

  increment(counter) {
    let namespaceIndex = counter >> 16;
    let counterIndex = counter & LOB;

    if (this._cache === null) {
      this._initializeStoreIfNeeded();
      this._cache = new Uint32Array(this._namespaceCount).fill(NULL_NUMBER);
    }

    if (this._cache[namespaceIndex] === NULL_NUMBER) {
      let counterCount = this._config[namespaceIndex];

      this._cache[namespaceIndex] = this._store.length;
      this._store.claim(counterCount);
    }

    let storeIndex = this._cache[namespaceIndex] + counterIndex;
    this._store.increment(storeIndex);
  }

  _initializeStoreIfNeeded() {
    if (this._storeInitialized === false) {
      this._store = new FastIntArray(opts.storeSize || DEFAULT_STORE_SIZE);
      this._storeInitialized = true;
    }
  }

  cache() {
    let cache = this._cache;
    this._cache = null;

    return cache;
  }
}