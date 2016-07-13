'use strict';

var RSVP = require('rsvp');
var VERSION = require('../package.json').version;

function Node(id, data, parent) {
  this.id = id;
  this.stats = { own: data };
  this.children = [];
  this.parent = parent;
}

module.exports = Heimdall;
function Heimdall() {
  this.version = VERSION;

  this._current = undefined;
  this.start('heimdall');
  this._root = this._current;
}

Object.defineProperty(Heimdall.prototype, 'current', {
  get: function() {
    return this._current;
  }
});

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
  }

  var node = new Node(id, data, this._current);
  this._current = node;
  //TODO: node.addChild(node);

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
    resolve(callback());
  }).finally(function() {
    cookie.stop();
  });
};

Heimdall.prototype.registerMonitor = function (monitor) {

};

Heimdall.prototype.toJSON = function () {

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

function Cookie(node, heimdall) {
  this.node = node;
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
  this.heimdall._current = this.node.parent;
};

Cookie.prototype.resume = function() {
  if (this.stopped === false) {
    throw new TypeError('cannot resume: not stopped');
  }

  this.stopped = false;
  this.heimdall._current = this.node;
};
