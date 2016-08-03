module.exports = HeimdallNode;
function HeimdallNode(heimdall, id, data, parent) {
  this.heimdall = heimdall;

  this.id = id;
  this._id = heimdall._nextId++;
  this.stats = this.heimdall._createStats(data);
  this.children = [];
  this.parent = parent;
}

Object.defineProperty(HeimdallNode.prototype, 'isRoot', {
  get: function () {
    return this.parent === undefined;
  },
});

HeimdallNode.prototype.visitPreOrder = function (cb) {
  cb(this);

  for (var i = 0; i < this.children.length; i++) {
    this.children[i].visitPreOrder(cb);
  }
};

HeimdallNode.prototype.visitPostOrder = function (cb) {
  for (var i = 0; i < this.children.length; i++) {
    this.children[i].visitPostOrder(cb);
  }

  cb(this);
};

HeimdallNode.prototype.remove = function () {
  if (!this.parent) {
    throw new Error('Cannot remove the root heimdalljs node.');
  }
  if (this.heimdall.current === this) {
    throw new Error('Cannot remove an active heimdalljs node.');
  }

  var index = this.parent.children.indexOf(this);
  if (index < 0) {
    throw new Error('Child(' + this._id + ') not found in Parent(' + this.parent._id + ').  Something is very wrong.');
  }
  this.parent.children.splice(index, 1);

  return this;
};

HeimdallNode.prototype.toJSON = function () {
  return {
    _id: this._id,
    id: this.id,
    stats: this.stats,
    children: this.children.map(function (child) { return child._id; }),
  };
};

HeimdallNode.prototype.toJSONSubgraph = function () {
  var nodes = [];

  this.visitPreOrder(function(node) {
    nodes.push(node.toJSON());
  });

  return nodes;
};

HeimdallNode.prototype.addChild = function (node) {
  this.children.push(node);
};

