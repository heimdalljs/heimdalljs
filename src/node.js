import FastArray from 'perf-primitives/addon/fast-array';
export const RECYCLE_POOL = new FastArray(500, 'Node Pool');

export default class HeimdallNode {
  constructor(heimdall, id, data) {
    this._init(heimdall, id, data);
  }

  _init(heimdall, id, data) {
    this._isDestroyed = false;
    this._heimdall = heimdall;

    this._id = heimdall.generateNextId();
    this.id = id;

    // TODO: strip for production builds for perfz
    // if (!(typeof this.id === 'object' && this.id !== null && typeof this.id.name === 'string')) {
    //  throw new TypeError('HeimdallNode#id.name must be a string');
    // }

    // lazy vs eager?
    this.stats = {
      own: data,
      time: { self: 0 },
    };

    // lazy vs eager?
    this._children = [];

    this.parent = null;
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

  static create(heimdall, id, data) {
    let obj = RECYCLE_POOL.pop();

    if (obj) {
      obj._init(heimdall, id, data);
      return obj;
    }

    return new HeimdallNode(heimdall, id, data);
  }

  destroy() {
    this._isDestroyed = true;
    this._heimdall = undefined;
    this._id = undefined;
    this.id = undefined;
    this.stats = undefined;
    this._children = undefined;
    this.parent = undefined;

    RECYCLE_POOL.push(this);
  }
}
