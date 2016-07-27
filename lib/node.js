export default class HeimdallNode {
  constructor(heimdall, id, data, parent) {
    this.heimdall = heimdall;

    this.id = id;
    this._id = heimdall._nextId++;
    this.stats = this.heimdall._createStats(data);
    this.children = [];
    this.parent = parent;
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

  toJSON() {
    return {
      _id: this._id,
      id: this.id,
      stats: this.stats,
      children: this.children.map(child => child._id),
    };
  }

  toJSONSubgraph() {
    let nodes = [];

    this.visitPreOrder(node => nodes.push(node.toJSON()));

    return nodes;
  }

  addChild(node) {
    this.children.push(node);
  }
}
