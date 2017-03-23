import { MAX_ARRAY_LENGTH, default as FastIntArray } from './fast-int-array';
import hasTypedArrays from './has-typed-arrays';
import arrayGrow from './array-grow';
import arrayFill from './array-fill';
import JsonSerializable from '../interfaces/json-serializable';
import deprecate from './deprecate';

const DEFAULT_STORE_SIZE: number = 1e3;
const DEFAULT_NAMESPACE_SIZE: number = 10;

function DeprecatedMonitor(name: String) {
  deprecate('You should no longer supply a schema for a monitor to registerMonitor, pass in strings instead.' +
      '\n\nExample:\n```\nfunction BaseballSchema() {\n\tthis.hits = 0;\n\tthis.runs = 0;\n\tthis.bats = 0;\n}\n' +
      "heimdall.registerMonitor('baseball', BaseballSchema);\nlet monitor = heimdall.statsFor('baseball');```\n" +
      "\nBecomes:\n```let monitor = heimdall.registerMonitor('baseball', 'hits', 'runs', 'bats');\n```",
      {
    id: `monitor-schema:${name}`,
    since: '0.3',
    until: '0.4'
  });
}

function extractDeprecatedLabels(PotentialSchema: Function) {
  let labels = [];

  if (typeof PotentialSchema !== 'function') {
    throw new Error(`You supplied what looks to be a Schema for ${name} to heimdall.registerMonitor(), but it is not a constructor.`);
  }

  // extract keys from schema
  let instance = new PotentialSchema();

  for (let potentialKey in instance) {
    if (instance.hasOwnProperty(potentialKey)) {
      let val = instance[potentialKey];
      // disallow types
      if (val && typeof val === 'number') {
        labels.push(potentialKey);
      } else {
        throw new Error("You can only provide instance properties with numeric values on schemas provided to heimdall.registerMonitor();\n" +
            `\tDiscovered the property '${potentialKey}' on the schema for '${name}' with the type '${typeof val}'`);
      }
    }
  }

  return labels;
}

/**
 * Wrapper type around options for `CounterStore`.
 *
 * Intentionally left private as `CounterStore`
 * only used internally when `HeimdallSession` is created.
 *
 * @class CounterStoreOptions
 */
class CounterStoreOptions {
  storeSize: number;
  namespaceAllocation: number;

  constructor(storeSize: number = DEFAULT_STORE_SIZE, namespaceAllocation: number = DEFAULT_NAMESPACE_SIZE) {
    this.storeSize = storeSize;
    this.namespaceAllocation = namespaceAllocation;
  }
}

// NULL_NUMBER is a number larger than the largest
// index we are capable of utilizing in the store.
// if an index is this number, we know that it is null.
export const NULL_NUMBER: number = MAX_ARRAY_LENGTH + 1;
const LOB: number = (1 << 16) - 1;

export default class CounterStore implements JsonSerializable<Object> {
  private _storeInitialized: boolean;
  private _store: FastIntArray;
  private _namespaceCount: number;
  private _config: FastIntArray;
  private _cache: Uint32Array | number[];
  private _labelCache: Object;
  private _nameCache: Object;
  private _namespaceCache: Object;

  options: CounterStoreOptions;
  initialized: boolean;

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
    this._namespaceCache = null;
  }

  clean(): void {
    this._storeInitialized = false;
    this._store = null;
    this._cache = null;
  }

  toJSON(): Object {
    return {
      _namespaceCount: this._namespaceCount,
      _config: this._config,
      _labelCache: this._labelCache,
      _nameCache: this._nameCache,
      _store: this._store
    }
  }

  static fromJSON(json: CounterStore): CounterStore {
    let store: CounterStore = new CounterStore();
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

  registerNamespace(name: string, labels: string[]|Function[]): Object {
    this._initializeIfNeeded();

    let numCounters: number = labels.length;
    let namespaceIndex: number = this._namespaceCount++;
    let bitNamespaceIndex: number = namespaceIndex << 16;
    let namespace: Object = Object.create(null);
    let deprecatedMonitor = null;
    let heimdall = this;

    if (numCounters === 1 && typeof labels[0] !== 'string') {
      deprecatedMonitor = new DeprecatedMonitor(name);
      labels = extractDeprecatedLabels(labels[0]);
      numCounters = labels.length;
    }

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

    for (let i = 0; i < numCounters; i++) {
      let label = labels[i];
      let namespaceCounterToken = namespace[label] = bitNamespaceIndex + i;

      if (deprecatedMonitor) {
        Object.defineProperty(deprecatedMonitor, label, {
          get() {
            return namespaceCounterToken;
          },

          set() {
            deprecate("You should no longer directly increment a property on a Monitor.\n\n" +
                "Refactor:\n```\n" +
                `${name}Monitor.${label}++;` +
                "\n```\nTo:\n```\n" +
                `heimdall.increment(${name}Monitor.${label});` +
                "\n```", {
              id: `no-direct-monitor-increment:{${name}:${label}}`,
              since: '0.3',
              until: '0.4'
            });
            heimdall.increment(namespaceCounterToken);
          }
        });
      }
    }

    if (deprecatedMonitor && typeof Object.freeze === 'function') {
      Object.freeze(deprecatedMonitor);
    }

    this._namespaceCache = deprecatedMonitor || namespace;

    return deprecatedMonitor || namespace;
  }

  getNamespace(name) {
    if (this._namespaceCache) {
      return this._namespaceCache[name];
    }
  }

  _initializeIfNeeded(): void {
    if (this.initialized === false) {
      this._config = new FastIntArray(this.options.namespaceAllocation);
      this._labelCache = Object.create(null);
      this._nameCache = Object.create(null);
      this._namespaceCache = Object.create(null);
      this.initialized = true;
    }
  }

  restoreFromCache(cache): Object {
    let stats = Object.create(null);

    for (let i = 0; i < cache.length; i++) {
      if (cache[i] !== NULL_NUMBER) {
        let startIndex: number = cache[i];
        let namespace: number | string = this._nameCache[i];
        let counterCount: number = this._config.get(i);

        stats[namespace] = Object.create(null);

        for (let j = 0; j < counterCount; j++) {
          let storeIndex: number = startIndex + j;
          let label: string = this._labelCache[namespace][j];

          stats[namespace][label] = this._store.get(storeIndex);
        }
      }
    }

    return stats;
  }

  increment(counter): void {
    let namespaceIndex: number = counter >> 16;
    let counterIndex: number = counter & LOB;

    if (this._cache === null) {
      this._initializeStoreIfNeeded();
      let a = hasTypedArrays() ? new Uint32Array(this._namespaceCount) : new Array(this._namespaceCount);
      this._cache = arrayFill(a, NULL_NUMBER);
    }

    if (this._cache[namespaceIndex] === NULL_NUMBER) {
      let counterCount: number = this._config.get(namespaceIndex);

      this._cache[namespaceIndex] = this._store.length;
      this._store.claim(counterCount);
    }

    let storeIndex: number = this._cache[namespaceIndex] + counterIndex;
    this._store.increment(storeIndex);
  }

  _initializeStoreIfNeeded(): void {
    if (this._storeInitialized === false) {
      this._store = new FastIntArray(this.options.storeSize);
      this._storeInitialized = true;
    }
  }

  has(name): boolean {
    return this._labelCache && name in this._labelCache;
  }

  cache(): Uint32Array | number[] {
    let cache = this._cache;
    this._cache = null;

    return cache;
  }
}
