// provides easily interceptable indirection.
import HashMap from './hash-map';
import FastArray from './fast-array';

export default class HeimdallSession {
  constructor(options = {}) {
    this._nextId = 0;
    this.stats = null;
    this.monitorSchemas = new HashMap();
    this.configs = new HashMap();
    this._events = new FastArray((options.preallocateCount || 1000) + 1);
  }

  generateNextId() {
    return this._nextId++;
  }
}
