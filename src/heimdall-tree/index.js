import HeimdallNode from './node';
import HeimdallLeaf from './leaf';
import EventArray from '../shared/event-array';
import CounterStore from '../shared/counter-store';
import HashMap from '../shared/hash-map';
import { format, normalizeTime, default as now } from '../shared/time';
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

function statsFromCounters(counterStore, counterCache) {
  if (!counterStore || !counterCache) {
    return null;
  }

  return counterStore.restoreFromCache(counterCache);
}

/*
 In 0.3, HeimdallSession.events stored information in four-indeces segments
 that mapped to `opCode, token|name, timestamp, counterCache`.

 In 0.4, the third index is a `traceId` instead, which can be used to locate
 the timestamp from within the dictionary returned by `HeimdallSession.timings`.

 On the surface, this change is non-breaking; however, HeimdallTree must be able
 to correctly inter-op these two formats.  To do so, the following algorithm is used:

 - if the opCode is OP_ANNOTATE, do nothing
 - else if the third param is not a number, assume it is a timestamp
 - else if the third param is a float, assume it is a timestamp
 - else if the third param is an integer matching a traceId in the dictionary, treat it as a traceId
 - else treat it as a timestamp
 */
function getSessionCompatibleTime(timings, traceId) {
  if (typeof traceId !== 'number') {
    return traceId;
  }

  if (!numberIsInteger(traceId)) {
    return traceId;
  }

  return timings[traceId] !== undefined ? timings[traceId] : traceId;
}

function numberIsInteger(value) {
  return isFinite(value) &&
    Math.floor(value) === value;
}

export default class HeimdallTree {
  constructor(heimdall, lastKnownTime) {
    this._heimdall = heimdall;
    this.root = null;
    this.format = heimdall && heimdall._timeFormat ? heimdall._timeFormat : format;
    this.lastKnownTime = lastKnownTime;
  }

  static fromJSON(json) {
    let events = json.events || [];
    let heimdall = {
      _timeFormat: json.format || format,
      _events: new EventArray(events.length, events),
      _monitors: CounterStore.fromJSON(json.monitors),
      _timings: json.timings
    };

    return new HeimdallTree(heimdall, json.serializationTime);
  }

  // primarily a test helper, you can get this at any time
  // to get an array representing the path of open node names
  // from "root" to the last open node.
  get path() {
    let events = this._heimdall._events;
    let root = new HeimdallNode('root', 1e9);
    let currentNode = root;
    let nodeMap = new HashMap();
    let node;
    let top;
    let path = [];

    events.forEach(([op, name], i) => {
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
  get stack() {
    let events = this._heimdall._events;
    let stack = [];
    let nodeMap = new HashMap();

    events.forEach(([op, name], i) => {
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
    });

    return stack;
  }

  _createLeaf(currentNode, time) {
    let leaf = new HeimdallLeaf();
    leaf.start(currentNode, currentNode.name, time);
    currentNode.addLeaf(leaf);
    return leaf;
  }

  _chainLeaf(currentNode, incomingNode, time) {
    let leaf = new HeimdallLeaf();
    leaf.start(currentNode, incomingNode.name, time);
    currentNode.addLeaf(leaf);
    return leaf;
  }

  _createNode(nodeName, index, nodeMap) {
    let node = new HeimdallNode(nodeName, index);
    nodeMap.set(index, node);
    return node;
  }

  _chainNode(currentNode, nodeName, index, nodeMap) {
    let node = this._createNode(nodeName, index, nodeMap);
    currentNode.addNode(node);
    return node;
  }

  construct() {
    let events = this._heimdall._events;
    let counterStore = this._heimdall._monitors;
    let timings = this._heimdall._timings;
    let currentLeaf = null;
    let currentNode = null;
    let nodeMap = new HashMap();
    let openNodes = [];
    let node;
    let format = this.format;
    let stopTime = this.lastKnownTime ? normalizeTime(this.lastKnownTime) : now();
    let pageRootIndex = events._length + 1;

    currentNode = this.root = this._createNode('page-root', pageRootIndex, nodeMap);
    currentLeaf = this._createLeaf(currentNode, 0);
    openNodes.push(this.root);

    events.forEach((traceEvent, i) => {
      let op = traceEvent[0];
      let name = traceEvent[1];
      let traceId = traceEvent[2];
      let counters = traceEvent[3];
      let time;

      if (op !== OP_ANNOTATE) {
        time = normalizeTime(getSessionCompatibleTime(timings, traceId), format);
        counters = statsFromCounters(counterStore, counters);
      }

      switch (op) {
        case OP_START:
          currentNode = this._chainNode(currentNode, name, i, nodeMap);
          openNodes.push(currentNode);

          if (currentLeaf) {
            currentLeaf.stop(name, time, counters);
          }
          currentLeaf = this._createLeaf(currentNode, time);
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
          openNodes.splice(openNodes.indexOf(currentNode), 1);
          currentNode = currentNode.resumeNode;

          currentLeaf.stop(node.name, time, counters);
          currentLeaf = this._chainLeaf(currentNode, node, time);
          break;

        case OP_RESUME:
          node = nodeMap.get(name);
          node.resume(currentNode);
          currentNode = node;
          openNodes.push(node);

          if (currentLeaf) {
            currentLeaf.stop(node.name, time, counters);
          }
          currentLeaf = this._chainLeaf(currentNode, node, time);
          break;

        case OP_ANNOTATE:
          currentLeaf.annotate(counters);
          break;
        default:
          throw new Error(`HeimdallTree encountered an unknown OpCode '${op}' during tree construction.`);
      }
    });

    while (currentNode && !currentNode.stopped) {
      let name = currentNode.name;
      let node = currentNode;

      currentNode.stop();
      currentNode = currentNode.resumeNode;
      currentLeaf.stop(node.name, stopTime, null);

      if (currentNode) {
        currentLeaf = this._chainLeaf(currentNode, node, stopTime);
      }
    }
  }

  toJSON() {
    if (!this.root) {
      this.construct();
    }
    return {
      heimdallVersion: 'VERSION_STRING_PLACEHOLDER',
      nodes: this.root.toJSONSubgraph()
    };
  }

  visitPreOrder(cb) {
    return this.root.visitPreOrder(cb);
  }

  visitPostOrder(cb) {
    return this.root.visitPostOrder(cb);
  }
}
