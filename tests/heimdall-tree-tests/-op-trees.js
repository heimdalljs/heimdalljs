import {
  OP_START,
  OP_STOP,
  OP_RESUME,
  OP_ANNOTATE
} from '../../src/shared/op-codes';
import { format, ORIGIN_TIME } from '../../src/shared/time';
import EventArray from '../../src/shared/event-array';

/*
  Creates a fake time signature from the number of milliseconds provided
  since system time began.
 */
function fT(milliseconds) {
  switch (format) {
    case 'milli':
      return milliseconds;
    case 'hrtime':
      let seconds = Math.floor(milliseconds / 1000);
      let ms = milliseconds - (seconds * 1000);
      let nanoseconds = ms * 1e6;

      return [seconds, nanoseconds];
    case 'timestamp':
      return ORIGIN_TIME + milliseconds;
    default:
      return milliseconds;
  }
}

/*
 This results in the node tree.

 A
 |_ B
 | |_C
 |_ D

 The leafy tree looks like this.

 A
 |_ AB
 |_ B
 |  |_ BC
 |  |_ C
 |  |  |_ CC
 |  |_ CB
 |_ BD
 |_ D
 |  |_ DD
 |_ DA

 */
export const NICE_OP_TREE = new EventArray(undefined,
 [
    OP_START, 'A',0, null,
    OP_START, 'B', 1, null,
    OP_START, 'C', 2, null,
    OP_STOP, 8, 3, null,  // stop C
    OP_STOP, 4, 4, null,  // stop B
    OP_START, 'D', 5, null,
    OP_ANNOTATE, null, null, { foo: 'bar' },
    OP_STOP, 20, 6, null,  // stop D
    OP_STOP, 0, 7, null  // stop A
  ]);

export const NICE_OP_TREE_TIMINGS = {
  0: fT(0), 1: fT(1), 2: fT(2), 3: fT(3), 4: fT(4), 5: fT(5), 6: fT(6), 7: fT(7)
};

export const BAD_OP_TREE_INACTIVE_STOPPED = new EventArray(undefined,
  [
    OP_START, 'A', 0, null,
    OP_STOP, 0, 1, null, // stop A
    OP_STOP, 0, 2, null  // stop A again
  ]);

export const BAD_OP_TREE_INACTIVE_STOPPED_TIMINGS = {
  0: fT(0), 1: fT(1), 2: fT(3)
};

export const BAD_OP_TREE_ACTIVE_CHILD_STOPPED = new EventArray(undefined,
  [
      OP_START, 'A', 0, null,
      OP_START, 'B', 1, null,
      OP_STOP, 0, 2, null // stop A while B is active
    ]);

export const BAD_OP_TREE_ACTIVE_CHILD_STOPPED_TIMINGS = {
  0: fT(0), 1: fT(1), 2: fT(1)
};

export const BAD_OP_TREE_ACTIVE_RESUMED = new EventArray(undefined,
  [
    OP_START, 'A', 0, null,
    OP_RESUME, 0, 1, null // restart A
  ]);

export const BAD_OP_TREE_ACTIVE_RESUMED_TIMINGS = {
  0: fT(0), 1: fT(1)
};
export default {
  NICE_OP_TREE,
  BAD_OP_TREE_INACTIVE_STOPPED,
  BAD_OP_TREE_ACTIVE_CHILD_STOPPED,
  BAD_OP_TREE_ACTIVE_RESUMED,
  NICE_OP_TREE_TIMINGS,
  BAD_OP_TREE_INACTIVE_STOPPED_TIMINGS,
  BAD_OP_TREE_ACTIVE_CHILD_STOPPED_TIMINGS,
  BAD_OP_TREE_ACTIVE_RESUMED_TIMINGS
}