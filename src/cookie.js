module.exports = Cookie;
function Cookie(node, heimdall) {
  this._node = node;
  this._restoreNode = node.parent;
  this._heimdall = heimdall;
  this._stopped = false;
}

Object.defineProperty(Cookie.prototype, 'stats', {
  get: function() {
    return this._node.stats.own;
  }
});

Cookie.prototype.stop = function() {
  var monitor;

  if (this._heimdall.current !== this._node) {
    throw new TypeError('cannot stop: not the current node');
  } else if (this.stopped === true) {
    throw new TypeError('cannot stop: already stopped');
  }

  this._stopped = true;
  this._heimdall._recordTime();
  this._heimdall._session.current = this._restoreNode;
};

Cookie.prototype.resume = function() {
  if (this._stopped === false) {
    throw new TypeError('cannot resume: not stopped');
  }

  this._stopped = false;
  this._restoreNode = this._heimdall.current;
  this._heimdall._session.current = this._node;
};
