'use strict';

var RSVP = require('rsvp');

var Cookie = require('./cookie');
var HeimdallNode = require('./node');
var Session = require('./session');


module.exports = Heimdall;
function Heimdall(session) {
  if (arguments.length < 1) {
    session = new Session();
  }

  this._session = session;
  this._reset(false);
}

Object.defineProperty(Heimdall.prototype, 'current', {
  get: function() {
    return this._session.current;
  }
});

Object.defineProperty(Heimdall.prototype, 'root', {
  get: function() {
    return this._session.root;
  }
});

Heimdall.prototype._reset = function (resetSession) {
  if (resetSession !== false) {
    this._session.reset();
  }

  if (!this.root) {
    // The first heimdall to start will create the session and root.  Subsequent
    // heimdall instances continue to use the existing graph
    this.start('heimdall');
    this._session.root = this._session.current;
  }
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

  this._recordTime();

  var node = new HeimdallNode(this, id, data);
  if (this.current) {
    this.current.addChild(node);
  }

  this._session.current = node;

  return new Cookie(node, this);
};

Heimdall.prototype._recordTime = function () {
  debugger;
  var hrtime = process.hrtime();
  var time = hrtime[0] * 1e9 + hrtime[1];

  // always true except for root
  if (this.current) {
    var delta = time - this._session.previousTimeNS;
    this.current.stats.time.self += delta;
  }
  this._session.previousTimeNS = time;
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
    resolve(callback.call(context, cookie._node.stats.own));
  }).finally(function() {
    cookie.stop();
  });
};

Heimdall.prototype.registerMonitor = function (name, Schema) {
  if (name === 'own' || name === 'time') {
    throw new Error('Cannot register monitor at namespace "' + name + '".  "own" and "time" are reserved');
  }
  if (this._session.monitorSchemas.has(name)) {
    throw new Error('A monitor for "' + name + '" is already registered"');
  }

  this._session.monitorSchemas.set(name, Schema);
};

Heimdall.prototype.statsFor = function(name) {
  var stats = this.current.stats;
  var Schema;

  if (!stats[name]) {
    Schema = this._session.monitorSchemas.get(name);
    if (!Schema) {
      throw new Error('No monitor registered for "' + name + '"');
    }
    stats[name] = new Schema();
  }

  return stats[name];
};

Heimdall.prototype.configFor = function configFor(name) {
  var config = this._session.configs.get(name);

  if (!config) {
    config = this._session.configs.set(name, {});
  }

  return config;
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
  this.root.visitPreOrder(cb);
};

Heimdall.prototype.visitPostOrder = function (cb) {
  this.root.visitPostOrder(cb);
};

Heimdall.prototype.generateNextId = function () {
  return this._session.generateNextId();
};

Object.defineProperty(Heimdall.prototype, 'stack', {
  get: function () {
    var stack = [];
    var top = this.current;

    while (top !== undefined && top !== this.root) {
      stack.unshift(top);
      top = top.parent;
    }

    return stack.map(function(node) {
      return node.id.name;
    });
  }
});

