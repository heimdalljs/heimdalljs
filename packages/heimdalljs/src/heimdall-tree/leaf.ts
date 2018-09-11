import HeimdallNode from './node';
import JsonSerializable from '../interfaces/json-serializable';

export default class HeimdallLeaf implements JsonSerializable<object> {
  private _id: string;

  public owner: HeimdallNode;
  public previousOp: string;
  public startTime: number;
  public annotations: object[];
  public nextOp: string;
  public endTime: number;
  public counters: object;
  public name: string;

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
    this.name = null;
  }

  get selfTime(): number {
    return this.endTime - this.startTime;
  }

  get isStopped(): boolean {
    return this.endTime !== 0;
  }

  public annotate(annotation: object): void {
    if (this.annotations === null) {
      this.annotations = [];
    }
    this.annotations.push(annotation);
  }

  public start(owner: HeimdallNode, previousOp: string, time: number): void {
    this.owner = owner;
    this.previousOp = previousOp;
    this.startTime = time;
  }

  public stop(nextOp: string, time: number, counters: object): void {
    this.nextOp = nextOp;
    this.endTime = time;
    this.counters = counters;
    this._id = this.name = `[${this.owner.name}]#${this.previousOp}:${nextOp}`;
  }

  public toJSON(): object {
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
