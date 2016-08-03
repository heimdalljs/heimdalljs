module.exports = Cookie;
function Cookie(node, heimdall) {
  this.node = node;
  this.restoreNode = this.node.parent;
  this.heimdall = heimdall;
  this.stopped = false;
}

Object.defineProperty(Cookie.prototype, 'stats', {
  get: function() {
    return this.node.stats.own;
  }
});

Cookie.prototype.stop = function() {
  var monitor;

  if (this.heimdall._current !== this.node) {
    throw new TypeError('cannot stop: not the current node');
  } else if (this.stopped === true) {
    throw new TypeError('cannot stop: already stopped');
  }

  this.stopped = true;
  this.heimdall._recordTime();
  this.heimdall._current = this.restoreNode;
};

Cookie.prototype.resume = function() {
  if (this.stopped === false) {
    throw new TypeError('cannot resume: not stopped');
  }

  this.stopped = false;
  this.restoreNode = this.heimdall._current;
  this.heimdall._current = this.node;
};
