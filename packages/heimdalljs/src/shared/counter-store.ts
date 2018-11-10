import { MAX_ARRAY_LENGTH, default as FastIntArray } from './fast-int-array';
import hasTypedArrays from './has-typed-arrays';
import arrayGrow from './array-grow';
import arrayFill from './array-fill';
import JsonSerializable from '../interfaces/json-serializable';
import CounterStoreOptions from './counter-store-options';

// NULL_NUMBER is a number larger than the largest
// index we are capable of utilizing in the store.
// if an index is this number, we know that it is null.
export const NULL_NUMBER: number = MAX_ARRAY_LENGTH + 1;
const LOB: number = (1 << 16) - 1;

export default class CounterStore implements JsonSerializable<object> {
  private _storeInitialized: boolean;
  private _store: FastIntArray;
  private _namespaceCount: number;
  private _config: FastIntArray;
  private _cache: Uint32Array | number[];
  private _labelCache: object;
  private _nameCache: object;

  private _initializeIfNeeded(): void {
    if (this.initialized === false) {
      this._config = new FastIntArray(this.options.namespaceAllocation);
      this._labelCache = Object.create(null);
      this._nameCache = Object.create(null);
      this.initialized = true;
    }
  }

  private _initializeStoreIfNeeded(): void {
    if (this._storeInitialized === false) {
      this._store = new FastIntArray(this.options.storeSize);
      this._storeInitialized = true;
    }
  }

  public static fromJSON(json: CounterStore): CounterStore {
    const store: CounterStore = new CounterStore();
    store._namespaceCount = json._namespaceCount;
    store._labelCache = json._labelCache;
    store._nameCache = json._nameCache;

    if (json._store) {
      store._store = new FastIntArray(json._store.length, json._store);
    }

    if (json._config) {
      store._config = new FastIntArray(json._config.length, json._config);
    }
    return store;
  }

  public options: CounterStoreOptions;
  public initialized: boolean;

  constructor(options: CounterStoreOptions = new CounterStoreOptions()) {
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

  public clean(): void {
    this._storeInitialized = false;
    this._store = null;
    this._cache = null;
  }

  public toJSON(): object {
    return {
      _namespaceCount: this._namespaceCount,
      _config: this._config,
      _labelCache: this._labelCache,
      _nameCache: this._nameCache,
      _store: this._store
    };
  }

  public registerNamespace(name: string, labels: string[]): object {
    this._initializeIfNeeded();

    const numCounters: number = labels.length;
    const namespaceIndex: number = this._namespaceCount++;
    const bitNamespaceIndex: number = namespaceIndex << 16;
    const namespace: object = Object.create(null);

    // we also generate a map between the counters
    // and these labels so that we can reconstruct
    // a meaningful structure later.
    this._nameCache[namespaceIndex] = name;
    this._labelCache[name] = labels;

    // grow the existing config and cache to account
    // for the new namespace
    this._config.push(numCounters);

    if (this._cache !== null) {
      this._cache = arrayGrow(this._cache, namespaceIndex, this._namespaceCount, NULL_NUMBER);
    }

    for (let i = 0; i < numCounters; i++) {
      namespace[labels[i]] = bitNamespaceIndex + i;
    }

    return namespace;
  }

  public restoreFromCache(cache): object {
    const stats = Object.create(null);

    for (let i = 0; i < cache.length; i++) {
      if (cache[i] !== NULL_NUMBER) {
        const startIndex: number = cache[i];
        const namespace: number | string = this._nameCache[i];
        const counterCount: number = this._config.get(i);

        stats[namespace] = Object.create(null);

        for (let j = 0; j < counterCount; j++) {
          const storeIndex: number = startIndex + j;
          const label: string = this._labelCache[namespace][j];

          stats[namespace][label] = this._store.get(storeIndex);
        }
      }
    }

    return stats;
  }

  public increment(counter): void {
    const namespaceIndex: number = counter >> 16;
    const counterIndex: number = counter & LOB;

    if (this._cache === null) {
      this._initializeStoreIfNeeded();
      const a = hasTypedArrays() ? new Uint32Array(this._namespaceCount) : new Array(this._namespaceCount);
      this._cache = arrayFill(a, NULL_NUMBER);
    }

    if (this._cache[namespaceIndex] === NULL_NUMBER) {
      const counterCount: number = this._config.get(namespaceIndex);

      this._cache[namespaceIndex] = this._store.length;
      this._store.claim(counterCount);
    }

    const storeIndex: number = this._cache[namespaceIndex] + counterIndex;
    this._store.increment(storeIndex);
  }

  public has(name): boolean {
    return this._labelCache && name in this._labelCache;
  }

  public cache(): Uint32Array | number[] | FastIntArray {
    const cache = this._cache;
    this._cache = null;

    return cache;
  }
}
