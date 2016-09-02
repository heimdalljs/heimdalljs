import HeimdallNode from './node';
import HeimdallLeaf from './leaf';
import HashMap from '../shared/hash-map';
import {
  OP_START,
  OP_STOP,
  OP_RESUME,
  OP_ANNOTATE
} from '../shared/op-codes';

/*
Example Event Timeline and tree reconstruction

As       Bs       Cs       Ce       Be       Ae
|--------|--------|--------|--------|--------|
   AB        BC       CC      CB        BA

Tree
A
 \
  B
   \
    C

Leafy Tree
A <- node
 |_AB <- leaf
 |_ B <- child node
 | |_ BC
 | |
 | |_C
 | | |_ CC
 | |
 | |_ CB
 |
 |_ BA

*/
export default class HeimdallTree {
  constructor(heimdall) {
    this._heimdall = heimdall;
    this.root = null;
  }

  construct() {
    let events = this._heimdall._events;
    let currentLeaf = null;
    let root = new HeimdallNode('---system', 1e9, null);
    let currentNode = root;
    let nodeMap = new HashMap();

    this.root = root;

    for (let i = 0; i < events.length; i++) {
      let [op, name, time, counters] = events[i];

      switch (op) {
        case OP_START:
          let node = new HeimdallNode(name, i, currentNode);
          nodeMap.set(i, node);
          currentNode.addChild(node);
          currentNode = node;

          if (currentLeaf) {
            currentLeaf.stop(name, time, counters);
          }
          currentLeaf = new HeimdallLeaf();
          currentLeaf.start(currentNode, name, time);
          currentNode.addLeaf(currentLeaf);
          break;

        case OP_STOP:
          if (!currentNode) {
            throw new Error("Cannot Stop, There is no active node!");
          }
          if (name !== currentNode._id) {
            throw new Error("Cannot Stop, Attempting to stop a node with an active child!");
          }
          currentNode.stop();
          currentNode = currentNode.resumeNode;

          currentLeaf.stop(name, time, counters);
          currentLeaf = new HeimdallLeaf();
          currentLeaf.start(currentNode, name, time);
          currentNode.addLeaf(currentLeaf);
          break;

        case OP_RESUME:
          let node = nodeMap.get(name);
          node.resume(currentNode);
          currentNode = node;

          if (currentLeaf) {
            currentLeaf.stop(name, time, counters);
          }
          currentLeaf = new HeimdallLeaf();
          currentLeaf.start(currentNode, name, time);
          currentNode.addLeaf(currentLeaf);
          break;

        case OP_ANNOTATE:
          currentLeaf.annotate(counters);
          break;
        default:
          throw new Error(`HeimdallTree encountered an unknown OpCode '${op}' during tree construction.`);
      }
    }
  }

  toJSON() {
    return { nodes: this.root.toJSONSubgraph() };
  }

  visitPreOrder(cb) {
    return this.root.visitPreOrder(cb);
  }

  visitPostOrder(cb) {
    return this.root.visitPostOrder(cb);
  }
}