import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { Promise, defer } from 'rsvp';

import { timeFromDate } from '../src/time';

const { expect } = chai;

chai.use(chaiAsPromised);

describe('timeFromDate', function () {
  it('reports a diff in nanoseconds', function () {
    const markA = timeFromDate();

    return new Promise((resolve) => {
      setTimeout(resolve, 15);
    }).then(() => {
      const markB = timeFromDate();

      expect(markB).to.be.gte(15 * 1e6);
      expect(markB - markA).to.be.gte(15 * 1e6);
      expect(markB - markA).to.be.lt(20 * 1e6);
    });
  });
});
