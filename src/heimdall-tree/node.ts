import HeimdallLeaf from './leaf';
import JsonSerializable from '../interfaces/json-serializable';

export default class HeimdallNode implements JsonSerializable<object> {
  private _id: number;

  public name: string;
  public parent: HeimdallNode;
  public resumeNode: HeimdallNode;
  public stopped: boolean;
  public leaves: HeimdallLeaf[];
  public nodes: HeimdallNode[];
  public children: any[];

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

  get id(): number {
    return this._id;
  }

  get stats(): object {
    const own = {
      selfTime: 0,
      duration: 0,
      startTime: this.leaves[0].startTime,
      endTime: this.leaves[this.leaves.length - 1].endTime
    };
    own.duration = own.endTime - own.startTime;

    const counters: any[] = [];
    const annotations: any[] = [];
    const stats: object = {
      self: own
    };

    this.forEachLeaf((leaf: HeimdallLeaf) => {
      own.selfTime += leaf.selfTime;
      annotations.push(leaf.annotations);

      for (const namespace in leaf.counters) {
        const value: any = leaf.counters[namespace];

        if (!stats.hasOwnProperty(namespace)) {
          stats[namespace] = value;
        } else {
          for (const label in value) {
            stats[namespace][label] += value[label];
          }
        }
      }

      counters.push(leaf.counters);
    });

    return stats;
  }

  public stop(): void | never {
    if (this.stopped === true) {
      throw new Error('Cannot Stop node, already stopped!');
    }
    this.stopped = true;
  }

  public resume(resumeNode: HeimdallNode): void | never {
    if (!this.stopped) {
      throw new Error('Cannot Resume node, already running!');
    }
    this.resumeNode = resumeNode;
    this.stopped = false;
  }

  public addLeaf(leaf: HeimdallLeaf): void {
    leaf.owner = this;
    this.leaves.push(leaf);
    this.children.push(leaf);
  }

  public addNode(node: HeimdallNode): void | never {
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

  public visitPreOrder(cb: (HeimdallNode) => void): void {
    cb(this);

    for (let i = 0; i < this.nodes.length; i++) {
      this.nodes[i].visitPreOrder(cb);
    }
  }

  public visitPostOrder(cb: (HeimdallNode) => void): void {
    for (let i = 0; i < this.nodes.length; i++) {
      this.nodes[i].visitPostOrder(cb);
    }

    cb(this);
  }

  public forEachNode(cb: (HeimdallNode) => void): void {
    for (let i = 0; i < this.nodes.length; ++i) {
      cb(this.nodes[i]);
    }
  }

  public forEachLeaf(cb: (HeimdallLeaf) => void): void {
    for (let i = 0; i < this.leaves.length; ++i) {
      cb(this.leaves[i]);
    }
  }

  public forEachChild(cb: (any) => void): void {
    for (let i = 0; i < this.children.length; ++i) {
      cb(this.children[i]);
    }
  }

  public toJSON(): object {
    return {
      _id: this._id,
      name: this.name,
      leaves: this.leaves.map(leaf => leaf.toJSON()),
      nodes: this.nodes.map(child => child._id),
      children: this.children.map(child => child._id)
    };
  }

  public toJSONSubgraph(): HeimdallNode[] {
    const nodes: HeimdallNode[] = [];

    this.visitPreOrder(node => nodes.push(node.toJSON()));

    return nodes;
  }
}
