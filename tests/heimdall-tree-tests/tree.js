import Tree from '../../src/heimdall-tree';
import Node from '../../src/heimdall-tree/node';
import {
  OP_START,
  OP_STOP,
  OP_RESUME,
  OP_ANNOTATE
} from '../../src/shared/op-codes';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';

const { expect } = chai;

const NICE_OP_TREE = [
  [OP_START, 'A', 0, null],
  [OP_START, 'B', 1, null],
  [OP_START, 'C', 2, null],
  [OP_STOP, 2, 3, null],  // stop C
  [OP_STOP, 1, 4, null],  // stop B
  [OP_START, 'D', 5, null],
  [OP_STOP, 5, 6, null],  // stop D
  [OP_STOP, 0, 7, null]  // stop A
];

const BAD_OP_TREE_INACTIVE_STOPPED = [
  [OP_START, 'A', 0, null],
  [OP_STOP, 0, 1, null], // stop A
  [OP_STOP, 0, 3, null]  // stop A again
];

const BAD_OP_TREE_ACTIVE_CHILD_STOPPED = [
  [OP_START, 'A', 0, null],
  [OP_START, 'B', 1, null],
  [OP_STOP, 0, 1, null] // stop A while B is active
];

const BAD_OP_TREE_ACTIVE_RESUMED = [
  [OP_START, 'A', 0, null],
  [OP_RESUME, 0, 1, null] // restart A
];

chai.use(chaiAsPromised);
describe('HeimdallTree', function() {
  describe('when constructing the tree', function() {
    let heimdall;
    let tree;

    beforeEach(function () {
      heimdall = {
        _events: []
      };
      tree = new Tree(heimdall);
    });

    it('sets the root node to ---system', function() {
      tree.construct();

      expect(tree.root instanceof Node).to.equal(true);
      expect(tree.root.name).to.equal('---system');
      expect(tree.root.children.length).to.equal(0);
    });

    it('properly adds children', function() {
      heimdall._events = NICE_OP_TREE;
      tree.construct();

      expect(tree.root.leaves.length).to.equal(0);
      expect(tree.root.nodes.length).to.equal(1);
      expect(tree.root.children.length).to.equal(1);

      let child = tree.root.children[0];

      expect(child.leaves.length).to.equal(3);
      expect(child.nodes.length).to.equal(2);
      expect(child.children.length).to.equal(5);
    });

    it('errors when stopping an already stopped node', function() {
      heimdall._events = BAD_OP_TREE_INACTIVE_STOPPED;

      expect(function () {
        tree.construct();
      }).to.throw('Cannot Stop node, already stopped!');
    });

    it('errors when stopping a node with an active child node', function() {
      heimdall._events = BAD_OP_TREE_ACTIVE_CHILD_STOPPED;

      expect(function () {
        tree.construct();
      }).to.throw('Cannot Stop, Attempting to stop a node with an active child!');
    });

    it('errors when resuming a node that has not been stopped', function() {
      heimdall._events = BAD_OP_TREE_ACTIVE_RESUMED;

      expect(function () {
        tree.construct();
      }).to.throw('Cannot Resume node, already running!');
    });

  })
});