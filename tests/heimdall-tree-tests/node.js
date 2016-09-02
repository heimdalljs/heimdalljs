import HeimdallNode from '../../src/heimdall-tree/node';
import HeimdallTree from '../../src/heimdall-tree';
import {
  OP_START,
  OP_STOP
} from '../../src/shared/op-codes';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { Promise, defer } from 'rsvp';

const { expect } = chai;

chai.use(chaiAsPromised);

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

describe('HeimdallNode', function() {
  describe('_id', function() {
    it('exists on a node', function() {
      let node = new HeimdallNode('a', 0);
      expect(node).to.have.property('_id');
    });
  });

  describe('isRoot', function() {
    let heimdall;
    let tree;

    beforeEach( function() {
      heimdall = { _events: NICE_OP_TREE };
      tree = new HeimdallTree(heimdall);
      tree.construct();
    });

    it('is true for the root node only', function() {
      expect(tree.root.isRoot).to.equal(true);
      expect(tree.root.nodes[0].isRoot).to.equal(false);
    });
  });

  describe('parent', function() {
    it('exists on a node', function() {
      let node = new HeimdallNode('a', 0);
      expect(node).to.have.property('parent');
    });
  });

  describe('toJSON', function() {
    it('must return the minimum json properties', function() {
      let node = new HeimdallNode('a', 0);
      let child1 = new HeimdallNode('b1', 1);
      let child2 = new HeimdallNode('b2', 2);
      node.addNode(child1);
      node.addNode(child2);

      expect(node.toJSON()).to.eql({
        _id: 0,
        name: 'a',
        leaves: [],
        nodes: [1, 2],
        children: [1, 2],
      });
    });
  });

  describe('toJSONSubgraph', function() {
    it('returns the JSON of the subtree rooted at node, in an array', function() {
      let node = new HeimdallNode('a', 0);
      let child1 = new HeimdallNode('b1', 1);
      let child2 = new HeimdallNode('b2', 2);
      node.addNode(child1);
      node.addNode(child2);

      expect(node.toJSONSubgraph()).to.eql([{
        _id: 0,
        name: 'a',
        leaves: [],
        nodes: [1, 2],
        children: [1, 2]
      }, {
        _id: 1,
        name: 'b1',
        leaves: [],
        nodes: [],
        children: []
      }, {
        _id: 2,
        name: 'b2',
        leaves: [],
        nodes: [],
        children: []
      }]);
    });
  });

  describe('.addChild', function() {
    it('errors if child already has a parent', function() {
      let node = new HeimdallNode('a', 0);
      let parent1 = new HeimdallNode('p1', 1);
      let parent2 = new HeimdallNode('p2', 2);

      parent1.addNode(node);

      expect(node.parent).to.equal(parent1);

      expect(function () {
        parent2.addNode(node);
      }).to.throw(`Cannot set parent of node 'a', node already has a parent!`);
    });

    it("adds child to this node's children", function() {
      let node = new HeimdallNode('a', 0);
      let parent = new HeimdallNode('p', 1);

      expect(parent.toJSON().children).to.eql([]);

      parent.addNode(node);

      expect(node._id).to.equal(0);
      expect(parent.toJSON().children).to.eql([0]);
    });

    it('sets itself as the parent of child', function() {
      let node = new HeimdallNode('a', 0);
      let parent = new HeimdallNode('p', 1);

      expect(node.parent).to.equal(null);

      parent.addNode(node);

      expect(node.parent).to.equal(parent);
    });
  });

  describe('visiting', function() {
    let root;
    let heimdall;
    let tree;


    beforeEach( function() {
      heimdall = { _events: NICE_OP_TREE };
      tree = new HeimdallTree(heimdall);
      tree.construct();
      root = tree.root;

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
    });

    it('.visitPreOrder visits nodes depth first pre-order', function() {
      let path = [];

      root.visitPreOrder(node => path.push(node.name));

      expect(path).to.eql([
        '---system', 'A', 'B', 'C', 'D'
      ]);
    });


    it('.visitPostOrder visits nodes depth first post-order', function() {
      let path = [];

      root.visitPostOrder(node => path.push(node.name));

      expect(path).to.eql([
        'C', 'B', 'D', 'A', '---system'
      ]);
    });

    it('forEachNode visits each child node only', function() {
      let path = [];
      let baseNode = root.children[0];

      baseNode.forEachNode(node => path.push(node.name));

      expect(path).to.eql([
        'B', 'D'
      ]);
    });

    it('forEachLeaf visits each child leaf only', function() {
      let path = [];
      let baseNode = root.children[0];

      // `[${this.owner.name}]#${this.previousOp}:${nextOp}`
      // AB BD DA
      let leaves = [
        '[A]#A:B',
        '[A]#B:D',
        '[A]#D:A',
      ];
      baseNode.forEachLeaf(leaf => path.push(leaf.name));

      expect(path).to.eql(leaves);
    });

    it('forEachChild visits each child only', function() {
      let path = [];
      let baseNode = root.children[0];
      let children = [
        '[A]#A:B',
        'B',
        '[A]#B:D',
        'D',
        '[A]#D:A',
      ];

      baseNode.forEachChild(child => path.push(child.name));

      expect(path).to.eql(children);
    });
  });
});
