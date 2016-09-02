import HeimdallNode from '../../src/heimdall-tree/node';
import HeimdallTree from '../../src/heimdall-tree';
import {
  OP_START,
  OP_STOP,
  OP_RESUME,
  OP_ANNOTATE
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
      let node = new HeimdallNode('a', 0, null);
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
      let node = new HeimdallNode('a', 0, null);
      expect(node).to.have.property('parent');
    });
  });

  describe('toJSON', function() {
    it('must return the minimum json properties', function() {
      let node = new HeimdallNode('a', 0, null);
      let child1 = new HeimdallNode('b1', 1);
      node.addChild(child1);
      let child2 = new HeimdallNode('b2', 2, null);
      node.addChild(child2);

      console.log(node.toJSON());

      expect(node.toJSON()).to.eql({
        _id: 1,
        name: 'a',
        leaves: [],
        children: [1, 2],
      });
    });
  });

  describe('toJSONSubgraph', function() {
    it('returns the JSON of the subtree rooted at node, in an array', function() {
      let node = new HeimdallNode(mockHeimdall, { name: 'a' }, { foo: 'foo' });
      let child1 = new HeimdallNode(mockHeimdall, { name: 'b1' }, { bar: 'bar' });
      node.addChild(child1);
      let child2 = new HeimdallNode(mockHeimdall, { name: 'b2' }, { baz: 'baz' });
      node.addChild(child2);

      expect(node.toJSONSubgraph()).to.eql([{
        _id: 1,
        id: { name: 'a' },
        stats: { time: { self: 0 }, own: { foo: 'foo' }},
        children: [2, 3],
      }, {
        _id: 2,
        id: { name: 'b1' },
        stats: { time: { self: 0 }, own: { bar: 'bar' }},
        children: [],
      }, {
        _id: 3,
        id: { name: 'b2' },
        stats: { time: { self: 0 }, own: { baz: 'baz' }},
        children: [],
      }]);
    });
  });

  describe('.addChild', function() {
    it('errors if child already has a parent', function() {
      let node = new HeimdallNode(mockHeimdall, { name: 'a' }, {});
      let parent1 = new HeimdallNode(mockHeimdall, { name: 'p1' }, {});
      let parent2 = new HeimdallNode(mockHeimdall, { name: 'p2' }, {});

      parent1.addChild(node);

      expect(node.parent).to.equal(parent1);

      expect(function () {
        parent2.addChild(node);
      }).to.throw(/already has a parent/);
    });

    it("adds child to this node's children", function() {
      let node = new HeimdallNode(mockHeimdall, { name: 'a' }, {});
      let parent = new HeimdallNode(mockHeimdall, { name: 'p' }, {});

      expect(parent.toJSON().children).to.eql([]);

      parent.addChild(node);

      expect(node._id).to.equal(1);
      expect(parent.toJSON().children).to.eql([1]);
    });

    it('sets itself as the parent of child', function() {
      let node = new HeimdallNode(mockHeimdall, { name: 'a' }, {});
      let parent = new HeimdallNode(mockHeimdall, { name: 'p' }, {});

      expect(node.parent).to.equal(null);

      parent.addChild(node);

      expect(node.parent).to.equal(parent);
    });
  });

  describe('visiting', function() {
    let root;
    let heimdall;
    // root
    //-  |- a1
    //   |   |- a1.b
    //   |
    //   |- a2


    beforeEach( function() {
      heimdall = new Heimdall();

      let tokenRoot = heimdall.start('root');
      // root of subtree
      root = heimdall.current;

      let tokenA1 = heimdall.start('a1');
      let tokenB = heimdall.start('a1.b');

      heimdall.stop(tokenB);
      heimdall.stop(tokenA1);

      heimdall.stop(heimdall.start('a2'));

      heimdall.stop(tokenRoot);

      heimdall.stop(heimdall.start('sibling1'));
      heimdall.stop(heimdall.start('sibling2'));
    });

    it('.visitPreOrder visits nodes depth first pre-order', function() {
      let path = [];

      root.visitPreOrder(node => path.push(node.id.name));

      expect(path).to.eql([
        'root', 'a1', 'a1.b', 'a2',
      ]);
    });


    it('.visitPostOrder visits nodes depth first post-order', function() {
      let path = [];

      root.visitPostOrder(node => path.push(node.id.name));

      expect(path).to.eql([
        'a1.b', 'a1', 'a2', 'root',
      ]);
    });

    it('forEachChild visits each child only', function() {
      let path = [];

      root.forEachChild(node => path.push(node.id.name));

      expect(path).to.eql([
        'a1', 'a2'
      ]);
    });
  });
});
