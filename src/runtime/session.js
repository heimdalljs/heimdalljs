// provides easily interceptable indirection.
import HashMap from '../shared/hash-map';
import FastArray from '../shared/fast-array';
import CounterStore from '../shared/counter-store';

export default class HeimdallSession {
  constructor(options = {}) {
    this._nextId = 0;
    this.monitors = new CounterStore();
    this.configs = new HashMap();
    this._events = new FastArray((options.preallocateCount || 1000) + 1);
  }

  generateNextId() {
    return this._nextId++;
  }
}
