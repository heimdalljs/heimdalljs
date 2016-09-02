// provides easily interceptable indirection.
import HashMap from './hash-map';
import FastArray from './fast-array';
import CounterStore from './counter-store';

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
