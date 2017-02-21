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
import { ScopeCache, default as PerformanceMeasure } from '../../src/shared/performance-measure';
import { default as mockPerformance, removePerformance } from '../mock/performance';
import { OP_START, OP_STOP, OP_RESUME } from '../../src/shared/op-codes';

import mockConsole from '../mock/console';

const originalMeasureProperty = Object.getOwnPropertyDescriptor(PerformanceMeasure, 'hasMeasureApi');
const { expect } = chai;

function doubleMeasureProperty(v) {
  Object.defineProperty(PerformanceMeasure, 'hasMeasureApi', { get() { return v; }});
}

function restoreMeasureProperty() {
  Object.defineProperty(PerformanceMeasure, 'hasMeasureApi', originalMeasureProperty);
}

chai.use(chaiAsPromised);

describe('PerformanceMeasure', function() {
  describe('_timings', function() {
     it('allocates based on PerformanceMeasure.hasMeasureApi.', function() {
       doubleMeasureProperty(false);
       let measure = new PerformanceMeasure();

       expect(measure._timings).to.eql(Object.create(null), `_timings is a dictionary when hasMeasureApi is false`);

       doubleMeasureProperty(true);
       measure = new PerformanceMeasure();

       expect(measure._timings).to.equal(null, `_timings is null when hasMeasureApi is true`);

       restoreMeasureProperty();
    });
  });

  describe('_enableMeasurements', function() {
    it('is activates when enableScopes() is called.', function() {
      let measure = new PerformanceMeasure();

      expect(measure._enableMeasurements).to.equal(false, `It is initially false`);

      measure.enableScopes();

      expect(measure._enableMeasurements).to.equal(true, `It true once enableScopes() is called`);
    });
  });

  describe('_scopeCache', function() {
    it('is lazily instantiated.', function() {
      let measure = new PerformanceMeasure();

      expect(measure.__scopeCache).to.equal(null, `It is initially null`);
      measure._scopeCache;
      expect(measure.__scopeCache instanceof ScopeCache).to.equal(true, `It caches a ScopeCache`);
    });
  });

  describe('_startMarksCache', function() {
    it('is lazily instantiated.', function() {
      let measure = new PerformanceMeasure();

      expect(measure.__startMarksCache).to.equal(null, `It is initially null`);
      measure._startMarksCache;
      expect(measure.__startMarksCache).to.eql(Object.create(null), `It caches a dictionary`);
    });
  });

  describe('trace()', function() {

  });

  describe('_measureMarks()', function() {

  });

  describe('enableScopes()', function() {

  });

  describe('now()', function() {

  });

  describe('mark()', function() {

  });

  describe('measureStart()', function() {

  });

  describe('measure()', function() {

  });

  describe('getEntries()', function() {
    it('is callable', function() {
      let measure = new PerformanceMeasure();

      expect(typeof measure.getEntries).to.equal('function');
      expect(() => { measure.getEntries(); }).to.not.throw();
    });
    it('returns _timings when hasMeasureApi is false', function() {
      doubleMeasureProperty(false);
      let measure = new PerformanceMeasure();
      let timings = measure._timings;

      measure.enableScopes();
      measure.trace(1, OP_START, 'foo');

      let entries = measure.getEntries();

      expect(entries === timings).to.equal(true, 'we returned _timings');
      restoreMeasureProperty();
    });
    it('returns _timings when hasMeasureApi is true but _timings is present', function() {
      doubleMeasureProperty(true);
      let measure = new PerformanceMeasure();
      let performance = mockPerformance();
      let timings = measure._timings = {};

      measure.enableScopes();
      measure.trace(1, OP_START, 'foo');

      let entries = measure.getEntries();

      expect(entries === timings).to.equal(true, 'we returned _timings');
      performance.restore();
      restoreMeasureProperty();
    });
    it('returns the result of iterating marks when hasMeasureApi is true', function() {
      doubleMeasureProperty(true);
      let performance = mockPerformance();
      let measure = new PerformanceMeasure();
      let timings = measure._timings;
      let marks = performance.getEntriesByType();

      measure.enableScopes();
      measure.trace(1, OP_START, 'foo');

      let entries = measure.getEntries();
      let mark = marks[0];

      expect(timings).to.equal(null, '_timings is null');
      expect(performance.markCalls).to.equal(1, 'performance.mark was called');
      expect(entries).to.eql({ [mark.name]: mark.startTime }, '_timings is generated from the performance mark entries');
      performance.restore();
      restoreMeasureProperty();
    });
  });

  describe('clearEntries()', function() {
    it('is callable', function() {
      let measure = new PerformanceMeasure();

      expect(typeof measure.clearEntries).to.equal('function');
      expect(() => { measure.clearEntries(); }).to.not.throw();
    });
    it('correctly clears entries', function() {
      doubleMeasureProperty(false);
      let measure = new PerformanceMeasure();
      let originalTimings = measure._timings;
      measure.enableScopes();
      measure.trace(1, OP_START, 'foo');

      let originalScopeCache = measure.__scopeCache;

      measure.clearEntries();

      expect(measure.__scopeCache === originalScopeCache).to.equal(true, 'we did not clear _scopeCache');
      expect(measure._enableMeasurements).to.equal(true, 'we did not reset _enableMeasurements');
      expect(measure.__startMarksCache).to.equal(null, 'we cleared _startMarksCache');
      expect(measure._timings).to.eql(Object.create(null), 'We reset _timings');
      expect(measure._timings === originalTimings).to.equal(false, '_timings is a new dictionary instance');
      restoreMeasureProperty();
    });
  });

  describe('reset()', function() {
    it('is callable', function() {
      let measure = new PerformanceMeasure();

      expect(typeof measure.reset).to.equal('function');
      expect(() => { measure.reset(); }).to.not.throw();
    });
    it('correctly resets state', function() {
      doubleMeasureProperty(false);
      let measure = new PerformanceMeasure();
      let originalTimings = measure._timings;
      measure.enableScopes();
      measure.trace(1, OP_START, 'foo');
      measure.reset();

      expect(measure.__scopeCache).to.equal(null, 'we cleared _scopeCache');
      expect(measure._enableMeasurements).to.equal(false, 'we reset _enableMeasurements');
      expect(measure.__startMarksCache).to.equal(null, 'we cleared _startMarksCache');
      expect(measure._timings).to.eql(Object.create(null), 'We reset _timings');
      expect(measure._timings === originalTimings).to.equal(false, '_timings is a new dictionary instance');
      restoreMeasureProperty();
    });
  });
});
