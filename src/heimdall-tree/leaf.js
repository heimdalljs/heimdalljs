export default class HeimdallLeaf {
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

  get selfTime() {
    console.log('leaf selfTime', this.endTime, this.startTime, this.endTime - this.startTime);
    return this.endTime - this.startTime;
  }

  get isStopped() {
    return this.endTime !== 0;
  }

  annotate(annotation) {
    if (this.annotations === null) {
      this.annotations = [];
    }
    this.annotations.push(annotation);
  }

  start(owner, previousOp, time) {
    this.owner = owner;
    this.previousOp = previousOp;
    this.startTime = time;

  }

  stop(nextOp, time, counters) {
    this.nextOp = nextOp;
    this.endTime = time;
    this.counters = counters;
    this._id = this.name = `[${this.owner.name}]#${this.previousOp}:${nextOp}`;
  }

  toJSON() {
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