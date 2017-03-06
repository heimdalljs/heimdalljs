import HeimdallNode from './node';
import JsonSerializable from '../interfaces/json-serializable';

export default class HeimdallLeaf implements JsonSerializable<Object> {
  private _id: string;

  owner: HeimdallNode;
  previousOp: string;
  startTime: number;
  annotations: Object[];
  nextOp: string;
  endTime: number;
  counters: Object;
  name: string;

  constructor() {
    // set on start
    this._id = null;
    this.owner = null;
    this.previousOp = null;
    this.startTime = 0;

    // set on annotate
    this.annotations = null;

    // set on stop
    this.nextOp = null;
    this.endTime = 0;
    this.counters = null;
    this.name= null;
  }

  get selfTime(): number {
    return this.endTime - this.startTime;
  }

  get isStopped(): boolean {
    return this.endTime !== 0;
  }

  annotate(annotation: Object): void {
    if (this.annotations === null) {
      this.annotations = [];
    }
    this.annotations.push(annotation);
  }

  start(owner: HeimdallNode, previousOp: string, time: number): void {
    this.owner = owner;
    this.previousOp = previousOp;
    this.startTime = time;
  }

  stop(nextOp: string, time: number, counters: Object): void {
    this.nextOp = nextOp;
    this.endTime = time;
    this.counters = counters;
    this._id = this.name = `[${this.owner.name}]#${this.previousOp}:${nextOp}`;
  }

  toJSON(): Object {
    return {
      _id: this._id,
      name: this.name,
      startTime: this.startTime,
      endTime: this.endTime,
      counters: this.counters,
      annotations: this.annotations
    };
  }
}
