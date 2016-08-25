import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { Promise, defer } from 'rsvp';
import sinon from './polyfill/sinon';

import { timeFromDate } from '../src/time';

const { expect } = chai;

chai.use(chaiAsPromised);


describe('timeFromDate', function() {
  let clock;

  beforeEach( function() {
    this.clock = clock = sinon.useFakeTimers();
  });

  afterEach( function() {
    clock.restore();
  });

  it('reports a diff in nanoseconds', function() {
    let markA = timeFromDate();

    clock.tick(15);

    let markB = timeFromDate();

    expect(Math.round((markB - markA) / 1e6)).to.equal(15);
  });
});
