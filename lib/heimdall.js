'use strict';

var RSVP = require('rsvp');
var VERSION = require('../package.json').version;

module.exports = Heimdall;
function Heimdall() {
  this.version = VERSION;

  this._reset();
}

Object.defineProperty(Heimdall.prototype, 'current', {
  get: function() {
    return this._current;
  }
});

Heimdall.prototype._reset = function () {
  counter = 0;
  this._current = undefined;
  this.start('heimdall');
  this._root = this._current;
};

Heimdall.prototype.start = function (name, Schema) {
  var id;
  var data;

  if (typeof name === 'string') {
    id = { name: name };
  } else {
    id = name;
  }

  if (typeof Schema === 'function') {
    data = new Schema();
  } else {
    data = {};
  }

  var node = new Node(id, data, this._current);
  // always true except for root
  if (this._current) {
    this._current.addChild(node);
  }
  this._current = node;

  return new Cookie(node, this);
};

Heimdall.prototype.node = function (name, Schema, callback) {
  if (arguments.length < 3) {
    callback = Schema;
    Schema = undefined;
  }

  var cookie = this.start(name, Schema);

  // NOTE: only works in very specific scenarios, specifically promises must
  // not escape their parents lifetime. In theory, promises could be augmented
  // to support those more advanced scenarios.
  return new RSVP.Promise(function(resolve) {
    resolve(callback(cookie.node.stats.own));
  }).finally(function() {
    cookie.stop();
  });
};

Heimdall.prototype.registerMonitor = function (monitor) {

};

Heimdall.prototype.toJSON = function () {
  return {
    root: this._root.toJSON(),
  };
};

Object.defineProperty(Heimdall.prototype, 'stack', {
  get: function () {
    var stack = [];
    var top = this._current;

    while (top !== undefined && top !== this._root) {
      stack.unshift(top);
      top = top.parent;
    }

    return stack.map(function(node) {
      return node.id.name;
    });
  }
});

var counter;

function Node(id, data, parent) {
  this.id = id;
  this._id = counter++;
  this.stats = { own: data };
  this.children = [];
  this.parent = parent;
}

Node.prototype.toJSON = function () {
  return {
    _id: this._id,
    id: this.id,
    stats: this.stats,
    children: this.children.map(function (child) { return child.toJSON(); }),
  };
};

Node.prototype.addChild = function (node) {
  this.children.push(node);
}

function Cookie(node, heimdall) {
  this.node = node;
  this.restoreNode = this.node.parent;
  this.heimdall = heimdall;
  this.stopped = false;
}

Cookie.prototype.stop = function() {
  if (this.heimdall._current !== this.node) {
    throw new TypeError('cannot stop: not the current node');
  } else if (this.stopped === true) {
    throw new TypeError('cannot stop: already stopped');
  }

  this.stopped = true;
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
