// provides easily interceptable indirection.
class Dict {
  constructor() {
    this._storage = {};
  }

  has(key) {
    return key in this._storage;
  }

  get(key) {
    return this._storage[key];
  }

  set(key, value) {
    return (this._storage[key] = value);
  }

  delete(key) {
    delete this._storage[key];
  }
}

export default class HeimdallSession {
  constructor() {
    this.reset();
  }

  reset() {
    this._nextId = 0;
    this.current = undefined;
    this.root = null;
    this.previousTimeNS = 0;
    this.monitorSchemas = new Dict();
    this.configs = new Dict();
  }

  generateNextId() {
    return this._nextId++;
  }
}
