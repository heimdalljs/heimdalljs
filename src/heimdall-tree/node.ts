import HeimdallLeaf from './leaf';
import JsonSerializable from '../interfaces/json-serializable';

export default class HeimdallNode implements JsonSerializable<Object> {
  private _id: number;

  name: string;
  parent: HeimdallNode;
  resumeNode: HeimdallNode;
  stopped: boolean;
  leaves: HeimdallLeaf[];
  nodes: HeimdallNode[];
  children: any[];

  constructor(name: string, id: number) {
    this._id = id;
    this.parent = null;
    this.resumeNode = null;
    this.name = name;
    this.stopped = false;
    this.leaves = [];
    this.nodes = [];
    this.children = [];
  }

  get stats(): Object {
    let own = {
      selfTime: 0,
      duration: 0,
      startTime: this.leaves[0].startTime,
      endTime: this.leaves[this.leaves.length - 1].endTime
    };
    own.duration = own.endTime - own.startTime;

    let counters: any[] = [];
    let annotations: any[] = [];
    let stats: Object = {
      self: own,
      // _annotations: annotations,
      // _counters: counters
    };

    this.forEachLeaf((leaf: HeimdallLeaf) => {
      own.selfTime += leaf.selfTime;
      annotations.push(leaf.annotations);

      for (let namespace in leaf.counters) {
        let value: any = leaf.counters[namespace];

        if (!stats.hasOwnProperty(namespace)) {
          stats[namespace] = value;
        } else {
          for (let label in value) {
            stats[namespace][label] += value[label];
          }
        }
      }

      counters.push(leaf.counters);
    });

    return stats;
  }

  stop(): void | never {
    if (this.stopped === true) {
      throw new Error('Cannot Stop node, already stopped!');
    }
    this.stopped = true;
  }

  resume(resumeNode: HeimdallNode): void | never {
    if (!this.stopped) {
      throw new Error('Cannot Resume node, already running!');
    }
    this.resumeNode = resumeNode;
    this.stopped = false;
  }

  addLeaf(leaf: HeimdallLeaf): void {
    leaf.owner = this;
    this.leaves.push(leaf);
    this.children.push(leaf);
  }

  addNode(node: HeimdallNode): void | never {
    if (node.parent) {
      throw new Error(`Cannot set parent of node '${node.name}', node already has a parent!`);
    }
    node.parent = this;
    node.resumeNode = this;
    this.nodes.push(node);
    this.children.push(node);
  }

  get isRoot(): boolean {
    return this.parent === null;
  }

  visitPreOrder(cb: Function): void {
    cb(this);

    for (let i = 0; i < this.nodes.length; i++) {
      this.nodes[i].visitPreOrder(cb);
    }
  }

  visitPostOrder(cb: Function): void {
    for (let i = 0; i < this.nodes.length; i++) {
      this.nodes[i].visitPostOrder(cb);
    }

    cb(this);
  }

  forEachNode(cb: Function): void {
    for (let i=0; i<this.nodes.length; ++i) {
      cb(this.nodes[i]);
    }
  }

  forEachLeaf(cb: Function): void {
    for (let i=0; i<this.leaves.length; ++i) {
      cb(this.leaves[i]);
    }
  }

  forEachChild(cb: Function): void {
    for (let i=0; i<this.children.length; ++i) {
      cb(this.children[i]);
    }
  }

  toJSON(): Object {
    return {
      _id: this._id,
      name: this.name,
      leaves: this.leaves.map(leaf => leaf.toJSON()),
      nodes: this.nodes.map(child => child._id),
      children: this.children.map(child => child._id )
    };
  }

  toJSONSubgraph(): HeimdallNode[] {
    let nodes: HeimdallNode[] = [];

    this.visitPreOrder(node => nodes.push(node.toJSON()));

    return nodes;
  }
}
