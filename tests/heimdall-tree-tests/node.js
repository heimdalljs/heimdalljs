import Heimdall from '../../src/runtime';

import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { Promise, defer } from 'rsvp';

const { expect } = chai;

chai.use(chaiAsPromised);

describe('HeimdallNode', function() {
  describe('_id', function() {
    it('exists on a node', function() {
      let node = new HeimdallNode('a', 0, null);
      expect(node).to.have.property('_id');
    });
  });

  describe('isRoot', function() {
    let heimdall;

    beforeEach( function() {
      heimdall = new Heimdall();
    });

    it('is true for the root node only', function() {
      expect(heimdall.root.isRoot).to.equal(true);
      expect(heimdall.current.isRoot).to.equal(true);

      let token = heimdall.start('child');

      expect(heimdall.root.isRoot).to.equal(true);
      expect(heimdall.current.isRoot).to.equal(false);

      heimdall.stop(token);

      expect(heimdall.current.isRoot).to.equal(true);
    });
  });

  describe('parent', function() {
    it('exists on a node', function() {
      let node = new HeimdallNode(mockHeimdall, { name: 'a' }, {}, null);
      expect(node).to.have.property('parent');
    });
  });

  describe('toJSON', function() {
    it('must return the minimum json properties', function() {
      let node = new HeimdallNode(mockHeimdall, { name: 'a' }, { foo: 'foo' });
      let child1 = new HeimdallNode(mockHeimdall, { name: 'b1' }, {});
      node.addChild(child1);
      let child2 = new HeimdallNode(mockHeimdall, { name: 'b2' }, {});
      node.addChild(child2);

      expect(node.toJSON()).to.eql({
        _id: 1,
        id: { name: 'a' },
        stats: { time: { self: 0 }, own: { foo: 'foo' }},
        children: [2, 3],
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

  describe('removeChild', function() {
    it("errors if child is not one of this node's children", function() {
      let node = new HeimdallNode(mockHeimdall, { name: 'a' }, {});
      let stranger = new HeimdallNode(mockHeimdall, { name: 'p' }, {});

      expect(function () {
        stranger.removeChild(node);
      }).to.throw(/not found/);
    });

    it("removes the child from this node's children", function() {
      let node = new HeimdallNode(mockHeimdall, { name: 'a' }, {});
      let child = new HeimdallNode(mockHeimdall, { name: 'b' }, {});

      node.addChild(child);

      expect(child._id).to.equal(2);
      expect(node.toJSON().children).to.eql([2]);

      node.removeChild(child);
      expect(node.toJSON().children).to.eql([]);
    });

    it("clears the child's parent", function() {
      let node = new HeimdallNode(mockHeimdall, { name: 'a' }, {});
      let child = new HeimdallNode(mockHeimdall, { name: 'b' }, {});

      expect(child.parent).to.equal(null);

      node.addChild(child);

      expect(child.parent).to.equal(node);

      node.removeChild(child);

      expect(child.parent).to.equal(null);
    });
  });

  describe('remove', function() {
    // Really this should error if called on any active node, ie any node from
    // current to root
    it('errors if called on the current node', function() {
      let heimdall = new Heimdall();

      heimdall.start('a');

      let nodeA = heimdall.current;

      expect(function () {
        nodeA.remove();
      }).to.throw('Cannot remove an active heimdalljs node.');
    });

    it('errors if called on nodes without a parent', function() {
      let orphanNode = new HeimdallNode({ generateNextId: function () { return 1; }}, { name: 'a' }, {});

      expect(function () {
        orphanNode.remove();
      }).to.throw(/Cannot remove/);
    });

    it('errors if called on the root node', function() {
      let heimdall = new Heimdall();

      heimdall.start('a');

      let root = heimdall.root;

      expect(function () {
        heimdall.root.remove();
      }).to.throw('Cannot remove the root heimdalljs node.');
    });

    it('calls removeChild on its parent', function() {
      let heimdall = new Heimdall();

      heimdall.start('a');

      let nodeA = heimdall.current;

      let tokenB = heimdall.start('b');

      let nodeB = heimdall.current;

      expect(nodeB._id).to.equal(2);

      heimdall.stop(tokenB);

      expect(heimdall.current).to.equal(nodeA);

      expect(nodeB.parent).to.equal(nodeA);
      expect(nodeA.toJSON().children).to.eql([2]);

      nodeB.remove();

      expect(nodeB.parent).to.equal(null);
      expect(nodeA.toJSON().children).to.eql([]);
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
