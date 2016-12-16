import Tree from '../../src/heimdall-tree';
import Node from '../../src/heimdall-tree/node';
import {
  NICE_OP_TREE,
  BAD_OP_TREE_ACTIVE_RESUMED,
  BAD_OP_TREE_INACTIVE_STOPPED,
  BAD_OP_TREE_ACTIVE_CHILD_STOPPED
} from './-op-trees';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';

const { expect } = chai;

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

    it('sets the root node to "page-root"', function() {
      tree.construct();

      expect(tree.root instanceof Node).to.equal(true);
      expect(tree.root.name).to.equal('page-root');
      expect(tree.root.children.length).to.equal(1);
    });

    it('properly adds children', function() {
      heimdall._events = NICE_OP_TREE;
      tree.construct();

      expect(tree.root.leaves.length).to.equal(2);
      expect(tree.root.nodes.length).to.equal(1);
      expect(tree.root.children.length).to.equal(3);

      let child = tree.root.nodes[0];

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
