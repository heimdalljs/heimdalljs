import {
  OP_START,
  OP_STOP,
  OP_RESUME,
  OP_ANNOTATE
} from '../../src/shared/op-codes';

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
export const NICE_OP_TREE = {
  length: 9,
  _data: [
    [OP_START, 'A', 0, null],
    [OP_START, 'B', 1, null],
    [OP_START, 'C', 2, null],
    [OP_STOP, 2, 3, null],  // stop C
    [OP_STOP, 1, 4, null],  // stop B
    [OP_START, 'D', 5, null],
    [OP_ANNOTATE, null, null, { foo: 'bar' }],
    [OP_STOP, 5, 6, null],  // stop D
    [OP_STOP, 0, 7, null]  // stop A
  ]
};

export const BAD_OP_TREE_INACTIVE_STOPPED = {
  length: 3,
  _data: [
    [OP_START, 'A', 0, null],
    [OP_STOP, 0, 1, null], // stop A
    [OP_STOP, 0, 3, null]  // stop A again
  ]
};

export const BAD_OP_TREE_ACTIVE_CHILD_STOPPED = {
  length: 3,
  _data: [
      [OP_START, 'A', 0, null],
      [OP_START, 'B', 1, null],
      [OP_STOP, 0, 1, null] // stop A while B is active
    ]
};

export const BAD_OP_TREE_ACTIVE_RESUMED = {
  length: 2,
  _data: [
    [OP_START, 'A', 0, null],
    [OP_RESUME, 0, 1, null] // restart A
  ]
};

export default {
  NICE_OP_TREE,
  BAD_OP_TREE_INACTIVE_STOPPED,
  BAD_OP_TREE_ACTIVE_CHILD_STOPPED,
  BAD_OP_TREE_ACTIVE_RESUMED
}