// import HeimdallNode from './node';
import HeimdallLeaf from './leaf';
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
 |_ B
 | |_ BC
 | |
 | |_C
 | | |_ CC
 | |
 | |_ CB
 |
 |_ BA

*/

class HeimdallNode {
  constructor(name, time) {
    this.name = name;
    this.stopTime = null;
    this.counters = null;
    this.stopped = false;
    this.leaves = [];
    this.nodes = [];
    this.children = [];
  }

  start(time, counters) {

  }

  stop(event) {

  }

  resume() {

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
}


export default class HeimdallTree {
  constructor(heimdall) {
    this._heimdall = heimdall;
    this.root = null;
  }

  // heimdall._monitors
  // heimdall._events
  construct() {
    let events = this._heimdall._events;
    let roots = [];
    let currentLeaf = null;
    let root;
    let currentNode = HeimdallNode('all');

    for (let i = 0; i < events.length; i++) {
      let [op, name, time, counters] = events[i];

      switch (op) {
        case OP_START:
          if (currentLeaf) {
            currentLeaf.stop(name, time, counters);
          }
          currentLeaf = new HeimdallLeaf();
          currentLeaf.start(currentNode, name, time);
          currentNode.addLeaf(currentLeaf);
          break;
        case OP_STOP:
          currentLeaf.stop(name, time, counters);
          currentLeaf = new HeimdallLeaf();
          currentLeaf.start(currentNode, name, time);
          currentNode.addLeaf(currentLeaf);
          break;
        case OP_RESUME:
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

  visitPreOrder(cb) {
    throw new Error('TODO, implement');
  }

  visitPostOrder(cb) {
    throw new Error('TODO, implement');
  }
}