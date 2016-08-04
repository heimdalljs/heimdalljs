var SESSION_VERSION = 1;

module.exports = HeimdallSession;
function HeimdallSession() {
  this.version = SESSION_VERSION;
}

HeimdallSession.prototype.reset = function () {
  this._nextId = 0;
  this.current = undefined;
  this.root = null;
  this.monitorSchemas = new Dict();
  this.configs = new Dict();
};

HeimdallSession.prototype.generateNextId = function () {
  return this._nextId++;
}

// provides easily interceptable indirection.
function Dict() {
  this._storage  = {};
}

Dict.prototype.has = function (key) {
  return key in this._storage;
};

Dict.prototype.get = function(key) {
  return this._storage[key];
};

Dict.prototype.set = function(key, value) {
  return this._storage[key] = value;
};

