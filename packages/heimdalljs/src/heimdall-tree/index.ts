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

export default class HeimdallTree implements JsonSerializable<object> {
  private _heimdall: {
    _events: EventArray,
    _monitors: CounterStore,
    _timeFormat: string
  };

  private _createLeaf(currentNode: HeimdallNode, time: number): HeimdallLeaf {
    const leaf = new HeimdallLeaf();
    leaf.start(currentNode, currentNode.name, time);
    currentNode.addLeaf(leaf);
    return leaf;
  }

  private _chainLeaf(currentNode: HeimdallNode, incomingNode: HeimdallNode, time: number): HeimdallLeaf {
    const leaf = new HeimdallLeaf();
    leaf.start(currentNode, incomingNode.name, time);
    currentNode.addLeaf(leaf);
    return leaf;
  }

  private _createNode(nodeName: string, index: number, nodeMap: HashMap<HeimdallNode>): HeimdallNode {
    const node = new HeimdallNode(nodeName, index);
    nodeMap.set(index, node);
    return node;
  }

  private _chainNode(currentNode: HeimdallNode,
                     nodeName: string,
                     index: number,
                     nodeMap: HashMap<HeimdallNode>): HeimdallNode {
    const node = this._createNode(nodeName, index, nodeMap);
    currentNode.addNode(node);
    return node;
  }

  public static fromJSON(json: {
    events: any[],
    format: string,
    monitors: CounterStore,
    serializationTime: number
  }) {
    const events = json.events || [];
    const heimdall = {
      _timeFormat: json.format || format,
      _events: new EventArray(events.length, events),
      _monitors: CounterStore.fromJSON(json.monitors)
    };

    return new HeimdallTree(heimdall, json.serializationTime);
  }

  public root: HeimdallNode;
  public format: string;
  public lastKnownTime: number;

  constructor(heimdall: {
    _events: EventArray,
    _monitors: CounterStore,
    _timeFormat: string
  },          lastKnownTime: number) {
    this._heimdall = heimdall;
    this.root = null;
    this.format = heimdall && heimdall._timeFormat ? heimdall._timeFormat : format;
    this.lastKnownTime = lastKnownTime;
  }

  // primarily a test helper, you can get this at any time
  // to get an array representing the path of open node names
  // from "root" to the last open node.
  get path(): HeimdallNode[] {
    const events = this._heimdall._events;
    const root = new HeimdallNode('root', 1e9);
    const nodeMap: HashMap<HeimdallNode> = new HashMap<HeimdallNode>();
    const path = [];

    let node;
    let top;
    let currentNode = root;

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

          if (name !== currentNode.id) {
            // potentially throw the correct error (already stopped)
            if (node) {
              node.stop();
            } else {
              throw new Error('Cannot Stop, Attempting to stop a non-existent node!');
            }
            throw new Error('Cannot Stop, Attempting to stop a node with an active child!');
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
    const events = this._heimdall._events;
    const stack = [];
    const nodeMap = new HashMap<string>();

    events.forEach(([op, name], i) => {
      if (op === OpCodes.OP_START) {
        stack.push(name);
        nodeMap.set(i, name);
      } else if (op === OpCodes.OP_RESUME) {
        const n = nodeMap.get(name);
        stack.push(n);
      } else if (op === OpCodes.OP_STOP) {
        const n = nodeMap.get(name);

        if (n !== stack[stack.length - 1]) {
          throw new Error('Invalid Stack!');
        }

        stack.pop();
      }
    });

    return stack;
  }

  public construct(): void {
    const events: EventArray = this._heimdall._events;
    let node: HeimdallNode;

    const nodeMap: HashMap<HeimdallNode> = new HashMap<HeimdallNode>();
    const openNodes: HeimdallNode[] = [];
    const format: string = this.format;
    const counterStore: CounterStore = this._heimdall._monitors;
    const stopTime: number = this.lastKnownTime ? normalizeTime(this.lastKnownTime) : now();
    const pageRootIndex: number = events.length + 1;

    let currentNode: HeimdallNode = this.root = this._createNode('page-root', pageRootIndex, nodeMap);
    let currentLeaf: HeimdallLeaf = this._createLeaf(currentNode, 0);

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

          if (name !== currentNode.id) {
            // potentially throw the correct error (already stopped)
            if (node) {
              node.stop();
            } else {
              throw new Error('Cannot Stop, Attempting to stop a non-existent node!');
            }
            throw new Error('Cannot Stop, Attempting to stop a node with an active child!');
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
      const name: string = currentNode.name;
      const n: HeimdallNode = currentNode;

      currentNode.stop();
      currentNode = currentNode.resumeNode;
      currentLeaf.stop(n.name, stopTime, null);

      if (currentNode) {
        currentLeaf = this._chainLeaf(currentNode, n, stopTime);
      }
    }
  }

  public toJSON(): {
    heimdallVersion: string,
    nodes: HeimdallNode[]
  } {
    if (!this.root) {
      this.construct();
    }
    return {
      heimdallVersion: 'VERSION_STRING_PLACEHOLDER',
      nodes: this.root.toJSONSubgraph()
    };
  }

  public visitPreOrder(cb: (HeimdallNode) => void): void {
    this.root.visitPreOrder(cb);
  }

  public visitPostOrder(cb: (HeimdallNode) => void): void {
    this.root.visitPostOrder(cb);
  }
}
