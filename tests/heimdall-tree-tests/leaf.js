import Tree from '../../src/heimdall-tree';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { NICE_OP_TREE } from './-op-trees';

const { expect } = chai;

chai.use(chaiAsPromised);

describe('HeimdallLeaf', function() {
  let heimdall = {
    _events: NICE_OP_TREE
  };
  let tree;
  let baseNode;

  beforeEach(function() {
    tree = new Tree(heimdall);
    tree.construct();
    baseNode = tree.root.nodes[0];
  });

  it('properly generates a name', function() {
    expect(baseNode.leaves[0].name).to.equal('[A]#A:B');
  });

  it('properly adds annotations', function() {
    expect(baseNode.nodes[1].name).to.equal('D');
    expect(baseNode.nodes[1].leaves[0].name).to.equal('[D]#D:D');
    expect(baseNode.nodes[1].leaves[0].annotations).to.eql([{ foo: 'bar' }]);
  });
});