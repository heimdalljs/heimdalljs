// for serious,
//
// Be very careful about changing ANY tests here.  This is the public API and
// must work between different heimdalljs versions.  Changing things here
// will very likely require a shim.  A node cannot assume that other nodes in
// the graph share the same version.
//
// Sincerely,
//    Serious.

import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { Promise, defer } from 'rsvp';
import Session from '../src/session';
import Heimdall from '../src/heimdall';
import HeimdallNode from '../src/node';

const { expect } = chai;

chai.use(chaiAsPromised);

describe('HeimdallSession', function() {
  describe('current', function() {
    it('exists on the session', function() {
      expect(new Session()).to.have.property('current');
    });
  });

  describe('root', function() {
    it('exists on the session', function() {
      expect(new Session()).to.have.property('root');
    });
  });

  describe('previousTimeNS', function() {
    it('exists on the session', function() {
      expect(new Session()).to.have.property('previousTimeNS');
    });
  });

  describe('monitorSchemas', function() {
    it('is a dict on the session', function() {
      let monitorSchemas = new Session().monitorSchemas;

      expect(typeof monitorSchemas.has).to.equal('function');
      expect(typeof monitorSchemas.get).to.equal('function');
      expect(typeof monitorSchemas.set).to.equal('function');
    });
  });

  describe('configs', function() {
    it('is a dict on the session', function() {
      let configs = new Session().configs;

      expect(typeof configs.has).to.equal('function');
      expect(typeof configs.get).to.equal('function');
      expect(typeof configs.set).to.equal('function');
    });
  });

  describe('reset', function() {
    it('resets properties', function() {
      let session = new Session();

      let current = session.current = {};
      let root = session.root = {};
      let previousTimeNS = session.previousTimeNS = 10;

      session.reset();

      expect(session.current).to.not.equal(current);
      expect(session.root).to.not.equal(root);
      expect(session.previousTimeNS).to.equal(0);
    });

    it('resets ids', function() {
      let session = new Session();
      let firstThreeIds = [session.generateNextId(), session.generateNextId(), session.generateNextId()];
      let nextThreeIds = [session.generateNextId(), session.generateNextId(), session.generateNextId()];

      expect(firstThreeIds).to.not.eql(nextThreeIds);

      session.reset();

      let nextThreeIdsAfterReset = [session.generateNextId(), session.generateNextId(), session.generateNextId()];

      expect(firstThreeIds).to.eql(nextThreeIdsAfterReset);
    });

    it('resets monitorSchemas', function() {
      let session = new Session();
      let monitorSchemas = session.monitorSchemas;

      function FSSchema() { }
      function OtherSchema() { }

      expect(monitorSchemas.has('fs')).to.equal(false);
      monitorSchemas.set('fs', OtherSchema);
      expect(monitorSchemas.has('fs')).to.equal(true);
      expect(monitorSchemas.get('fs')).to.equal(OtherSchema);

      monitorSchemas.set('fs', FSSchema);
      expect(monitorSchemas.has('fs')).to.equal(true);
      expect(monitorSchemas.get('fs')).to.equal(FSSchema);

      session.reset();

      expect(session.monitorSchemas).to.not.equal(monitorSchemas);
      expect(session.monitorSchemas.has('fs')).to.equal(false);
      expect(session.monitorSchemas.get('fs')).to.equal(undefined);

      session.monitorSchemas.set('fs', FSSchema);
      expect(monitorSchemas.has('fs')).to.equal(true);

      session.monitorSchemas.delete('fs');
      expect(session.monitorSchemas.has('fs')).to.equal(false);
    });

    it('resets configs', function() {
      let session = new Session();
      let configs = session.configs;

      let config = { some: 'value' };
      let otherConfig = { some: 'otherValue' };

      expect(configs.has('fs')).to.equal(false);
      configs.set('fs', otherConfig);
      expect(configs.has('fs')).to.equal(true);
      expect(configs.get('fs')).to.equal(otherConfig);

      configs.set('fs', config);
      expect(configs.has('fs')).to.equal(true);
      expect(configs.get('fs')).to.equal(config);

      session.reset();

      expect(session.configs).to.not.equal(configs);
      expect(session.configs.has('fs')).to.equal(false);
      expect(session.configs.get('fs')).to.equal(undefined);

      session.configs.set('fs', config);
      expect(configs.has('fs')).to.equal(true);

      session.configs.delete('fs');
      expect(session.configs.has('fs')).to.equal(false);
    });
  });

  describe('generateNextId', function() {
    it('returns unique ids', function() {
      let session = new Session();
      let firstId = session.generateNextId();
      let secondId = session.generateNextId();
      let thirdId = session.generateNextId();

      expect(firstId).to.not.equal(secondId);
      expect(firstId).to.not.equal(thirdId);
      expect(secondId).to.not.equal(thirdId);
    });
  });
});

describe('HeimdallNode', function() {
  let mockHeimdall;

  beforeEach(function() {
    mockHeimdall = {
      id: 0,

      generateNextId: function () {
        return ++this.id;
      }
    };
  });

  describe('_id', function() {
    it('exists on a node', function() {
      let node = new HeimdallNode(mockHeimdall, { name: 'a' }, {}, null);
      expect(node).to.have.property('_id');
    });
  });

  describe('id', function() {
    it('exists on a node', function() {
      let node = new HeimdallNode(mockHeimdall, { name: 'a' }, {}, null);
      expect(node).to.have.property('id');
    });

    it('must have a string name', function() {
      let node = new HeimdallNode(mockHeimdall, { name: 'a' }, {}, null);
      expect(node.id.name).to.equal('a');

      expect(function () {
        new HeimdallNode(mockHeimdall, {}, {}, null);
      }).to.throw('HeimdallNode#id.name must be a string');
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

      let cookie = heimdall.start('child');

      expect(heimdall.root.isRoot).to.equal(true);
      expect(heimdall.current.isRoot).to.equal(false);

      cookie.stop();

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

      let cookieB = heimdall.start('b');

      let nodeB = heimdall.current;

      expect(nodeB._id).to.equal(2);

      cookieB.stop();

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
    // root
    //-  |- a1
    //   |   |- a1.b
    //   |
    //   |- a2


    beforeEach( function() {
      heimdall = new Heimdall();

      let cookieRoot = heimdall.start('root');
      // root of subtree
      root = heimdall.current;

      let cookieA1 = heimdall.start('a1');
      let cookieB = heimdall.start('a1.b');

      cookieB.stop();
      cookieA1.stop();

      heimdall.start('a2').stop();

      cookieRoot.stop();

      heimdall.start('sibling1').stop();
      heimdall.start('sibling2').stop();
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
