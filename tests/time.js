import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { Promise, defer } from 'rsvp';

import { timeFromPerformanceNow } from '../src/time';

const { expect } = chai;

chai.use(chaiAsPromised);


describe('timeFromPerformanceNow', function() {
  it('reports a diff in nanoseconds', function() {
    const markA = timeFromPerformanceNow();

    return new Promise((resolve) => {
      setTimeout(resolve, 15);
    }).then(() => {
      const markB = timeFromPerformanceNow();

      expect(markB).to.be.gte(15 * 1e6);
      expect(markB - markA).to.be.gte(15 * 1e6);
      expect(markB - markA).to.be.lt(20 * 1e6);
    });
  });
});
