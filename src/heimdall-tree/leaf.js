export default class HeimdallLeaf {
  constructor() {
    // set on start
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
    this.selfTime = 0;
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
    this.name = `[${owner.name}]#${this.previousOp}:${nextOp}`;
  }
}