export default class HeimdallNode {
  constructor(name, id) {
    this._id = id;
    this.parent = null;
    this.resumeNode = null;
    this.name = name;
    this.stopped = false;
    this.leaves = [];
    this.nodes = [];
    this.children = [];
  }

  get stats() {
    let own = {
      selfTime: 0,
      duration: 0,
      startTime: this.leaves[0].startTime,
      endTime: this.leaves[this.leaves.length - 1].endTime
    };
    own.duration = own.endTime - own.startTime;

    let counters = [];
    let annotations = [];
    let stats = {
      self: own,
      annotations,
      counters
    };

    this.forEachLeaf((leaf) => {
      own.selfTime += leaf.selfTime;
      annotations.push(leaf.annotations);
      counters.push(leaf.counters);
    });

    return stats;
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

  addNode(node) {
    if (node.parent) {
      throw new Error(`Cannot set parent of node '${node.name}', node already has a parent!`);
    }
    node.parent = this;
    node.resumeNode = this;
    this.nodes.push(node);
    this.children.push(node);
  }

  get isRoot() {
    return this.parent === null;
  }

  visitPreOrder(cb) {
    cb(this);

    for (let i = 0; i < this.nodes.length; i++) {
      this.nodes[i].visitPreOrder(cb);
    }
  }

  visitPostOrder(cb) {
    for (let i = 0; i < this.nodes.length; i++) {
      this.nodes[i].visitPostOrder(cb);
    }

    cb(this);
  }

  forEachNode(cb) {
    for (let i=0; i<this.nodes.length; ++i) {
      cb(this.nodes[i]);
    }
  }

  forEachLeaf(cb) {
    for (let i=0; i<this.leaves.length; ++i) {
      cb(this.leaves[i]);
    }
  }

  forEachChild(cb) {
    for (let i=0; i<this.children.length; ++i) {
      cb(this.children[i]);
    }
  }

  toJSON() {
    return {
      _id: this._id,
      name: this.name,
      leaves: this.leaves.map(leaf => leaf.toJSON()),
      nodes: this.nodes.map(child => child._id),
      children: this.children.map(child => child._id )
    };
  }

  toJSONSubgraph() {
    let nodes = [];

    this.visitPreOrder(node => nodes.push(node.toJSON()));

    return nodes;
  }
}