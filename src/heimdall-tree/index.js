import HeimdallNode from './node';
import HeimdallLeaf from './leaf';
import HashMap from '../shared/hash-map';
import { normalizeTime } from '../shared/time';
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

  // primarily a test helper, you can get this at any time
  // to get an array representing the path of open node names
  // from "root" to the last open node.
  get path() {
    let events = this._heimdall._events;
    let root = new HeimdallNode('---system', 1e9);
    let currentNode = root;
    let nodeMap = new HashMap();
    let node;
    let top;
    let path = [];

    for (let i = 0; i < events.length; i++) {
      let [op, name] = events._data[i];

      switch (op) {
        case OP_START:
          node = new HeimdallNode(name, i);
          nodeMap.set(i, node);
          currentNode.addNode(node);
          currentNode = node;
          break;

        case OP_STOP:
          node = nodeMap.get(name);

          if (name !== currentNode._id) {
            // potentially throw the correct error (already stopped)
            if (node) {
              node.stop();
            } else {
              throw new Error("Cannot Stop, Attempting to stop a non-existent node!");
            }
            throw new Error("Cannot Stop, Attempting to stop a node with an active child!");
          }

          currentNode.stop();
          currentNode = currentNode.resumeNode;
          break;

        case OP_RESUME:
          node = nodeMap.get(name);
          node.resume(currentNode);
          currentNode = node;
          break;

        default:
          throw new Error(`HeimdallTree encountered an unknown OpCode '${op}' during path construction.`);
      }
    }

    top = currentNode;

    while (top !== undefined && top !== root) {
      path.unshift(top.name);
      top = top.parent;
    }

    return path;
  }

  // primarily a test helper, you can get this at any time
  // to get an array representing the "stack" of open node names.
  get stack() {
    let events = this._heimdall._events;
    let stack = [];
    let nodeMap = new HashMap();

    for (let i = 0; i < events.length; i++) {
      let [op, name] = events._data[i];

      if (op === OP_START) {
        stack.push(name);
        nodeMap.set(i, name);
      } else if (op === OP_RESUME) {
        let n = nodeMap.get(name);
        stack.push(n);
      } else if (op === OP_STOP) {
        let n = nodeMap.get(name);

        if (n !== stack[stack.length -1]) {
          throw new Error('Invalid Stack!');
        }

        stack.pop();
      }
    }

    return stack;
  }

  construct() {
    let events = this._heimdall._events;
    let currentLeaf = null;
    let root = new HeimdallNode('---system', 1e9);
    let currentNode = root;
    let nodeMap = new HashMap();
    let node;

    this.root = root;

    for (let i = 0; i < events.length; i++) {
      let [op, name, time, counters] = events._data[i];

      if (op !== OP_ANNOTATE) {
        time = normalizeTime(time);
      }

      switch (op) {
        case OP_START:
          node = new HeimdallNode(name, i);
          nodeMap.set(i, node);
          currentNode.addNode(node);
          currentNode = node;

          if (currentLeaf) {
            currentLeaf.stop(name, time, counters);
          }
          currentLeaf = new HeimdallLeaf();
          currentLeaf.start(currentNode, name, time);
          currentNode.addLeaf(currentLeaf);
          break;

        case OP_STOP:
          node = nodeMap.get(name);

          if (name !== currentNode._id) {
            // potentially throw the correct error (already stopped)
            if (node) {
              node.stop();
            } else {
              throw new Error("Cannot Stop, Attempting to stop a non-existent node!");
            }
            throw new Error("Cannot Stop, Attempting to stop a node with an active child!");
          }

          currentNode.stop();
          currentNode = currentNode.resumeNode;

          currentLeaf.stop(node.name, time, counters);
          currentLeaf = new HeimdallLeaf();
          currentLeaf.start(currentNode, node.name, time);
          currentNode.addLeaf(currentLeaf);
          break;

        case OP_RESUME:
          node = nodeMap.get(name);
          node.resume(currentNode);
          currentNode = node;

          if (currentLeaf) {
            currentLeaf.stop(node.name, time, counters);
          }
          currentLeaf = new HeimdallLeaf();
          currentLeaf.start(currentNode, node.name, time);
          currentNode.addLeaf(currentLeaf);
          break;

        case OP_ANNOTATE:
          currentLeaf.annotate(counters);
          break;
        default:
          throw new Error(`HeimdallTree encountered an unknown OpCode '${op}' during tree construction.`);
      }
    }

    if (currentLeaf) {
      root.leaves.splice(root.leaves.indexOf(currentLeaf), 1);
      root.children.splice(root.children.indexOf(currentLeaf), 1);
      currentLeaf.owner = null;
      currentLeaf = null;
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