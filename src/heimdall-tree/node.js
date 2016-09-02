export default class HeimdallNode {
  constructor(name, id, parent) {
    this._id = id;
    this.parent = parent;
    this.resumeNode = parent;
    this.name = name;
    this.stopped = false;
    this.leaves = [];
    this.nodes = [];
    this.children = [];
  }

  stop() {
    if (this.stopped === true) {
      throw new Error('Cannot Stop node, already stopped!');
    }
    this.stopped = true;
  }

  resume(resumeNode) {
    if (!this.stopped) {
      throw new Error('Cannot Resume node, already running!');
    }
    this.resumeNode = resumeNode;
    this.stopped = false;
  }

  addLeaf(leaf) {
    leaf.owner = this;
    this.leaves.push(leaf);
    this.children.push(leaf);
  }

  addChild(node) {
    node.parent = this;
    this.nodes.push(node);
    this.children.push(node);
  }

  get isRoot() {
    return this.parent === null;
  }

  visitPreOrder(cb) {
    cb(this);

    for (let i = 0; i < this.children.length; i++) {
      this.children[i].visitPreOrder(cb);
    }
  }

  visitPostOrder(cb) {
    for (let i = 0; i < this.children.length; i++) {
      this.children[i].visitPostOrder(cb);
    }

    cb(this);
  }

  forEachChild(cb) {
    for (let i=0; i<this._children.length; ++i) {
      cb(this._children[i]);
    }
  }

  toJSON() {
    return {
      _id: this._id,
      name: this.name,
      leaves: this.leaves.map(leaf => leaf.toJSON()),
      nodes: this.nodes.map(child => child._id),
      children: this._children.map(child => child._id )
    };
  }

  toJSONSubgraph() {
    let nodes = [];

    this.visitPreOrder(node => nodes.push(node.toJSON()));

    return nodes;
  }
}