/*
  In 0.3, HeimdallSession.events stored information in four-indeces segments
  that mapped to `opCode, token|name, timestamp, counterCache`.

  In 0.4, the third index is a `traceId` instead, which can be used to locate
  the timestamp from within the dictionary returned by `HeimdallSession.timings`.

  On the surface, this change is non-breaking; however, HeimdallTree must be able
  to correctly inter-op these two formats.  To do so, the following algorithm is used:

  - if the opCode is OP_ANNOTATE, do nothing
  - else if the third param is not a number, assume it is a timestamp
  - else if the third param is a float, assume it is a timestamp
  - else if the third param is an integer matching a traceId in the dictionary, treat it as a traceId
  - else treat it as a timestamp
 */
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { OP_START, OP_STOP } from '../../src/shared/op-codes';
import Tree from '../../src/heimdall-tree';
import EventArray from '../../src/shared/event-array';

const { expect } = chai;

import { ORIGIN_TIME } from '../../src/shared/time';

function fT(milliseconds, format) {
  switch (format) {
    case 'hrtime':
      let seconds = Math.floor(milliseconds / 1000);
      let ms = milliseconds - (seconds * 1000);
      let nanoseconds = ms * 1e6;

      return [seconds, nanoseconds];
    default:
      return ORIGIN_TIME + milliseconds;
  }
}

chai.use(chaiAsPromised);

const testHeimdallInstance = {
  _events: new EventArray(undefined, [
    OP_START, 'foo', fT(1), null,
    OP_START, 'bar', 1, null,
    OP_STOP, 4, 2, null,
    OP_STOP, 0, fT(4), null,
    OP_START, 'foo-2', fT(4.1), null,
    OP_STOP, 16, fT(4.2), null
  ]),
  _timings: {
    1: fT(2),
    2: fT(3)
  },
  _timeFormat: 'timestamp'
};

describe('HeimdallTree-compat-for-0.3-and-0.4-session', function() {
  it('can construct a tree with intermixed versions', function() {
    let tree = new Tree(testHeimdallInstance);

    expect(function() { tree.construct() }).to.not.throw();

    expect(tree.root.leaves.length).to.equal(3);
    expect(tree.root.nodes.length).to.equal(2);
    expect(tree.root.children.length).to.equal(5);

    let child = tree.root.nodes[0];

    expect(child.leaves.length).to.equal(2);
    expect(child.nodes.length).to.equal(1);
    expect(child.children.length).to.equal(3);
  });
  it('correctly parses times for each node', function() {
    let tree = new Tree(testHeimdallInstance);

    expect(function() { tree.construct() }).to.not.throw();

    let v3Node = tree.root.nodes[0];
    let v4Node = v3Node.nodes[0];
    let v3NodeFloat = tree.root.nodes[1];

    expect(v3Node.stats.self.duration).to.equal(3000000, `We spent 3ms in the v3 node`);
    expect(v4Node.stats.self.duration).to.equal(1000000,  `We spent 1ms in the inner v4 node`);
    expect(v3NodeFloat.stats.self.duration).to.equal(100000,  `We spent .1ms in the second v3 node`);
  });
});