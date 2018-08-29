const DEFAULT_STORE_SIZE: number = 1e3;
const DEFAULT_NAMESPACE_SIZE: number = 10;

/**
 * Wrapper type around options for `CounterStore`.
 *
 * Intentionally left private as `CounterStore`
 * only used internally when `HeimdallSession` is created.
 *
 * @class CounterStoreOptions
 */
export default class CounterStoreOptions {
  public storeSize: number;
  public namespaceAllocation: number;

  constructor(storeSize: number = DEFAULT_STORE_SIZE, namespaceAllocation: number = DEFAULT_NAMESPACE_SIZE) {
    this.storeSize = storeSize;
    this.namespaceAllocation = namespaceAllocation;
  }
}
