import HeimdallNode from './node';
import HeimdallLeaf from './leaf';
import EventArray from '../shared/event-array';
import CounterStore from '../shared/counter-store';
import HashMap from '../shared/hash-map';
import { format, normalizeTime, default as now } from '../shared/time';
import OpCodes from '../shared/op-codes';
import JsonSerializable from '../interfaces/json-serializable';

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

function statsFromCounters(counterStore, counterCache) {
  if (!counterStore || !counterCache) {
    return null;
  }

  return counterStore.restoreFromCache(counterCache);
}

export default class HeimdallTree implements JsonSerializable<Object> {
  private _heimdall: Object;

  root: HeimdallNode;
  format: string;
  lastKnownTime: number;

  constructor(heimdall: Object, lastKnownTime) {
    this._heimdall = heimdall;
    this.root = null;
    this.format = heimdall && heimdall._timeFormat ? heimdall._timeFormat : format;
    this.lastKnownTime = lastKnownTime;
  }

  static fromJSON(json: Object) {
    let events = json.events || [];
    let heimdall = {
      _timeFormat: json.format || format,
      _events: new EventArray(events.length, events),
      _monitors: CounterStore.fromJSON(json.monitors)
    };

    return new HeimdallTree(heimdall, json.serializationTime);
  }

  // primarily a test helper, you can get this at any time
  // to get an array representing the path of open node names
  // from "root" to the last open node.
  get path(): HeimdallNode[] {
    let events = this._heimdall._events;
    let root = new HeimdallNode('root', 1e9);
    let currentNode = root;
    let nodeMap: HashMap<HeimdallNode> = new HashMap<HeimdallNode>();
    let node;
    let top;
    let path = [];

    events.forEach(([op, name], i) => {
      switch (op) {
        case OpCodes.OP_START:
          node = new HeimdallNode(name, i);
          nodeMap.set(i, node);
          currentNode.addNode(node);
          currentNode = node;
          break;

        case OpCodes.OP_STOP:
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

        case OpCodes.OP_RESUME:
          node = nodeMap.get(name);
          node.resume(currentNode);
          currentNode = node;
          break;

        default:
          throw new Error(`HeimdallTree encountered an unknown OpCode '${op}' during path construction.`);
      }
    });

    top = currentNode;

    while (top !== undefined && top !== root) {
      path.unshift(top.name);
      top = top.parent;
    }

    return path;
  }

  // primarily a test helper, you can get this at any time
  // to get an array representing the "stack" of open node names.
  get stack(): any[] {
    let events = this._heimdall._events;
    let stack = [];
    let nodeMap = new HashMap<string>();

    events.forEach(([op, name], i) => {
      if (op === OpCodes.OP_START) {
        stack.push(name);
        nodeMap.set(i, name);
      } else if (op === OpCodes.OP_RESUME) {
        let n = nodeMap.get(name);
        stack.push(n);
      } else if (op === OpCodes.OP_STOP) {
        let n = nodeMap.get(name);

        if (n !== stack[stack.length -1]) {
          throw new Error('Invalid Stack!');
        }

        stack.pop();
      }
    });

    return stack;
  }

  _createLeaf(currentNode: HeimdallNode, time: number): HeimdallLeaf {
    let leaf = new HeimdallLeaf();
    leaf.start(currentNode, currentNode.name, time);
    currentNode.addLeaf(leaf);
    return leaf;
  }

  _chainLeaf(currentNode: HeimdallNode, incomingNode: HeimdallNode, time: number): HeimdallLeaf {
    let leaf = new HeimdallLeaf();
    leaf.start(currentNode, incomingNode.name, time);
    currentNode.addLeaf(leaf);
    return leaf;
  }

  _createNode(nodeName: string, index: number, nodeMap: HashMap<HeimdallNode>): HeimdallNode {
    let node = new HeimdallNode(nodeName, index);
    nodeMap.set(index, node);
    return node;
  }

  _chainNode(currentNode: HeimdallNode, nodeName: string, index: number, nodeMap: HashMap<HeimdallNode>): HeimdallNode {
    let node = this._createNode(nodeName, index, nodeMap);
    currentNode.addNode(node);
    return node;
  }

  construct() {
    let events: EventArray = this._heimdall._events;
    let currentLeaf: HeimdallLeaf = null;
    let currentNode: HeimdallNode = null;
    let nodeMap: HashMap<HeimdallNode> = new HashMap<HeimdallNode>();
    let openNodes: HeimdallNode[] = [];
    let node: HeimdallNode;
    let format: string = this.format;
    let counterStore: CounterStore = this._heimdall._monitors;
    let stopTime: number = this.lastKnownTime ? normalizeTime(this.lastKnownTime) : now();
    let pageRootIndex: number = events._length + 1;

    currentNode = this.root = this._createNode('page-root', pageRootIndex, nodeMap);
    currentLeaf = this._createLeaf(currentNode, 0);
    openNodes.push(node);

    events.forEach(([op, name, time, counters], i) => {
      if (op !== OpCodes.OP_ANNOTATE) {
        time = normalizeTime(time, format);
        counters = statsFromCounters(counterStore, counters);
      }

      switch (op) {
        case OpCodes.OP_START:
          currentNode = this._chainNode(currentNode, name, i, nodeMap);
          openNodes.push(currentNode);

          if (currentLeaf) {
            currentLeaf.stop(name, time, counters);
          }
          currentLeaf = this._createLeaf(currentNode, time);
          break;

        case OpCodes.OP_STOP:
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
          openNodes.splice(openNodes.indexOf(currentNode), 1);
          currentNode = currentNode.resumeNode;

          currentLeaf.stop(node.name, time, counters);
          currentLeaf = this._chainLeaf(currentNode, node, time);
          break;

        case OpCodes.OP_RESUME:
          node = nodeMap.get(name);
          node.resume(currentNode);
          currentNode = node;
          openNodes.push(node);

          if (currentLeaf) {
            currentLeaf.stop(node.name, time, counters);
          }
          currentLeaf = this._chainLeaf(currentNode, node, time);
          break;

        case OpCodes.OP_ANNOTATE:
          currentLeaf.annotate(counters);
          break;
        default:
          throw new Error(`HeimdallTree encountered an unknown OpCode '${op}' during tree construction.`);
      }
    });

    while (currentNode && !currentNode.stopped) {
      let name: string = currentNode.name;
      let node: HeimdallNode = currentNode;

      currentNode.stop();
      currentNode = currentNode.resumeNode;
      currentLeaf.stop(node.name, stopTime, null);

      if (currentNode) {
        currentLeaf = this._chainLeaf(currentNode, node, stopTime);
      }
    }
  }

  toJSON(): Object {
    if (!this.root) {
      this.construct();
    }
    return {
      heimdallVersion: 'VERSION_STRING_PLACEHOLDER',
      nodes: this.root.toJSONSubgraph()
    };
  }

  visitPreOrder(cb: Function): void {
    this.root.visitPreOrder(cb);
  }

  visitPostOrder(cb: Function): void {
    this.root.visitPostOrder(cb);
  }
}
