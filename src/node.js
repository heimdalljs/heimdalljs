export default class HeimdallNode {
  constructor(heimdall, id, data) {
    this._heimdall = heimdall;
    this._stopped = false;

    this._id = heimdall.generateNextId();
    this.id = id;

    // lazy vs eager?
    this.stats = {
      own: data,
      time: { self: 0 },
    };

    // lazy vs eager?
    this._children = [];

    this.parent = null;
    this._restoreNode = null;
  }

  get isRoot() {
    return this.parent === null;
  }

  visitPreOrder(cb) {
    cb(this);

    for (let i = 0; i < this._children.length; i++) {
      this._children[i].visitPreOrder(cb);
    }
  }

  visitPostOrder(cb) {
    for (let i = 0; i < this._children.length; i++) {
      this._children[i].visitPostOrder(cb);
    }

    cb(this);
  }

  forEachChild(cb) {
    for (let i=0; i<this._children.length; ++i) {
      cb(this._children[i]);
    }
  }

  remove() {
    if (!this.parent) {
      throw new Error('Cannot remove the root heimdalljs node.');
    }
    if (this._heimdall.current === this) {
      throw new Error('Cannot remove an active heimdalljs node.');
    }

    return this.parent.removeChild(this);
  }

  toJSON() {
    return {
      _id: this._id,
      id: this.id,
      stats: this.stats,
      children: this._children.map(child => child._id ),
    };
  }

  toJSONSubgraph() {
    let nodes = [];

    this.visitPreOrder(node => nodes.push(node.toJSON()));

    return nodes;
  }

  addChild(node) {
    if (node.parent) {
      throw new TypeError('Node ' + node._id + ' already has a parent.  Cannot add to ' + this._id);
    }

    this._children.push(node);

    node.parent = this;
    node._restoreNode = node._restoreNode || this;
  }


  removeChild(child) {
    let index = this._children.indexOf(child);

    if (index < 0) {
      throw new Error('Child(' + child._id + ') not found in Parent(' + this._id + ').  Something is very wrong.');
    }
    this._children.splice(index, 1);

    child.parent = null;

    return child;
  }
}
