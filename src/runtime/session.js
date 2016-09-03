// provides easily interceptable indirection.
import HashMap from '../shared/hash-map';
import FastArray from '../shared/fast-array';
import CounterStore from '../shared/counter-store';

export default class HeimdallSession {
  constructor(options) {
    this.init(options);
  }

  // separate from constructor mostly for testing purposes
  init(options = {}) {
    this.monitors = new CounterStore();
    this.configs = new HashMap();
    this.events = new FastArray((options.preallocateCount || 1000) + 1);
  }
}
