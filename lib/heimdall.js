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
  this._nextId = 0;
  this._current = undefined;
  this._previousTime = undefined;
  this.start('heimdall');
  this._root = this._current;
  this._monitorSchema = {};
};

// TODO: implement, and work nicely with DEBUG=*
Heimdall.prototype.log = function() {};
Heimdall.prototype.log.verbose = function() {};

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

  this._recordTime();

  var node = new Node(this, id, data, this._current);
  // always true except for root
  if (this._current) {
    this._current.addChild(node);
  }
  this._current = node;

  return new Cookie(node, this);
};

Heimdall.prototype._recordTime = function () {
  var time = process.hrtime();
  // always true except for root
  if (this._current) {
    var delta = (time[0] - this._previousTime[0]) * 1e9 + (time[1] - this._previousTime[1]);
    this._current.stats.time.self += delta;
  }
  this._previousTime = time;
};

Heimdall.prototype.node = function (name, Schema, callback, context) {
  if (arguments.length < 3) {
    callback = Schema;
    Schema = undefined;
  }

  var cookie = this.start(name, Schema);

  // NOTE: only works in very specific scenarios, specifically promises must
  // not escape their parents lifetime. In theory, promises could be augmented
  // to support those more advanced scenarios.
  return new RSVP.Promise(function(resolve) {
    resolve(callback.call(context, cookie.node.stats.own));
  }).finally(function() {
    cookie.stop();
  });
};

Heimdall.prototype.registerMonitor = function (name, Schema) {
  if (name === 'own' || name === 'time') {
    throw new Error('Cannot register monitor at namespace "' + name + '".  "own" and "time" are reserved');
  }
  if (this._monitorSchema[name]) {
    throw new Error('A monitor for "' + name + '" is already registered"');
  }
  this._monitorSchema[name] = Schema;
};

Heimdall.prototype.statsFor = function(name) {
  var stats = this._current.stats;
  var Schema;

  if (!stats[name]) {
    Schema = this._monitorSchema[name];
    if (!Schema) {
      throw new Error('No monitor registered for "' + name + '"');
    }
    stats[name] = new Schema();
  }

  return stats[name];
};

Heimdall.prototype.toJSON = function () {
  var result = [];

  this.visitPreOrder(function(node) {
    result.push(node.toJSON());
  });

  return { nodes: result }
  ;
};

Heimdall.prototype.visitPreOrder = function (cb) {
  this._root.visitPreOrder(cb);
};

Heimdall.prototype.visitPostOrder = function (cb) {
  this._root.visitPostOrder(cb);
};

Heimdall.prototype._createStats = function (data) {
  var stats = {
    own: data,
    time: { self: 0 },
  };
  return stats;
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

function Node(heimdall, id, data, parent) {
  this.heimdall = heimdall;

  this.id = id;
  this._id = heimdall._nextId++;
  this.stats = this.heimdall._createStats(data);
  this.children = [];
  this.parent = parent;
}

Node.prototype.visitPreOrder = function (cb) {
  cb(this);

  for (var i = 0; i < this.children.length; i++) {
    this.children[i].visitPreOrder(cb);
  }
};

Node.prototype.visitPostOrder = function (cb) {
  for (var i = 0; i < this.children.length; i++) {
    this.children[i].visitPostOrder(cb);
  }

  cb(this);
};

Node.prototype.toJSON = function () {
  return {
    _id: this._id,
    id: this.id,
    stats: this.stats,
    children: this.children.map(function (child) { return child._id; }),
  };
};

Node.prototype.toJSONSubgraph = function () {
  var nodes = [];

  this.visitPreOrder(function(node) {
    nodes.push(node.toJSON());
  });

  return nodes;
};

Node.prototype.addChild = function (node) {
  this.children.push(node);
};

function Cookie(node, heimdall) {
  this.node = node;
  this.restoreNode = this.node.parent;
  this.heimdall = heimdall;
  this.stopped = false;
}

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
