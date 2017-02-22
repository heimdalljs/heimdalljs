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
    it('returns an incrementing id', function() {
      doubleMeasureProperty(false);
      let console = mockConsole();
      let measure = new PerformanceMeasure();
      let ret = measure.trace(123, OP_START, 'foo');
      let ret2 = measure.trace(456, OP_START, 'bar');

      expect(typeof ret).to.equal('number');
      expect(ret2 - ret).to.equal(1);

      console.restore();
      restoreMeasureProperty();
    });
    it('generates a mark with the traceId (console-api)', function() {
      doubleMeasureProperty(false);
      let console = mockConsole();
      let measure = new PerformanceMeasure();
      let ret = measure.trace(123, OP_START, 'foo');
      let marks = measure.getEntries();
      expect(typeof ret).to.equal('number');
      expect(typeof marks[ret]).to.not.equal('undefined');

      console.restore();
      restoreMeasureProperty();
    });
    it('generates a mark with the traceId (performance-api)', function() {
      doubleMeasureProperty(true);
      let performance = mockPerformance();
      let measure = new PerformanceMeasure();
      let ret = measure.trace(123, OP_START, 'foo');
      let marks = measure.getEntries();
      expect(typeof ret).to.equal('number');
      expect(typeof marks[ret]).to.not.equal('undefined');

      performance.restore();
      restoreMeasureProperty();
    });
    it('measures between a start and a stop (console-api)', function() {
      doubleMeasureProperty(false);
      let console = mockConsole();
      let measure = new PerformanceMeasure();

      measure.enableScopes('*');
      measure.trace(123, OP_START, 'foo');

      expect(console.timeCalls).to.equal(1, 'We started the timer');
      expect(console.lastTimeArgs).to.eql(['foo-:123']);

      measure.trace(123, OP_STOP);

      expect(console.timeEndCalls).to.equal(1, 'We stopped the timer');
      expect(console.lastTimeEndArgs).to.eql(['foo-:123']);

      console.restore();
      restoreMeasureProperty();
    });
    it('measures between a start and a stop (performance-api)', function() {
      doubleMeasureProperty(true);
      let performance = mockPerformance();
      let measure = new PerformanceMeasure();

      measure.enableScopes('*');
      let markA = measure.trace(123, OP_START, 'foo');

      expect(performance.markCalls).to.equal(1, 'We created a mark');
      expect(performance.lastMarkArgs).to.eql([markA]);

      let markB = measure.trace(123, OP_STOP);

      expect(performance.markCalls).to.equal(2, 'We created a second mark');
      expect(performance.lastMarkArgs).to.eql([markB]);
      expect(performance.measureCalls).to.equal(1, 'We called measure');
      expect(performance.lastMeasureArgs).to.eql(['foo-:123', markA, markB]);

      performance.restore();
      restoreMeasureProperty();
    });
    it('measure is skipped when _enableMeasurements is false (console-api)', function() {
      doubleMeasureProperty(false);
      let console = mockConsole();
      let measure = new PerformanceMeasure();

      measure.trace(123, OP_START, 'foo');
      measure.trace(123, OP_STOP);

      expect(console.timeCalls).to.equal(0, 'We never called time');
      expect(console.timeEndCalls).to.equal(0, 'We never called timeEnd');

      console.restore();
      restoreMeasureProperty();
    });
    it('measure is skipped when _enableMeasurements is false (performance-api)', function() {
      doubleMeasureProperty(true);
      let performance = mockPerformance();
      let measure = new PerformanceMeasure();

      measure.trace(123, OP_START, 'foo');
      measure.trace(123, OP_STOP);

      expect(performance.measureCalls).to.equal(0, 'We did not call measure');

      performance.restore();
      restoreMeasureProperty();
    });
  });

  describe('enableScopes()', function() {
    it(`calling with no args enables '*'`, function() {
      doubleMeasureProperty(true);
      let performance = mockPerformance();
      let measure = new PerformanceMeasure();

      measure.enableScopes();
      measure.trace(123, OP_START, 'foo');
      measure.trace(123, OP_STOP);

      expect(performance.measureCalls).to.equal(1, 'We called measure');

      performance.restore();
      restoreMeasureProperty();
    });
    it(`can be called with a scope`, function() {
      doubleMeasureProperty(true);
      let performance = mockPerformance();
      let measure = new PerformanceMeasure();

      measure.enableScopes('foo');
      measure.trace(123, OP_START, 'foo');
      measure.trace(123, OP_STOP);
      measure.trace(234, OP_START, 'bar');
      measure.trace(234, OP_STOP);

      expect(performance.measureCalls).to.equal(1, 'We called measure only once');

      performance.restore();
      restoreMeasureProperty();
    });
    it(`can be called with a subscope`, function() {
      doubleMeasureProperty(true);
      let performance = mockPerformance();
      let measure = new PerformanceMeasure();

      measure.enableScopes('foo:bar');
      measure.trace(123, OP_START, 'foo');
      measure.trace(123, OP_STOP);
      measure.trace(234, OP_START, 'foo:bar');
      measure.trace(234, OP_STOP);

      expect(performance.measureCalls).to.equal(1, 'We called measure only once');

      performance.restore();
      restoreMeasureProperty();
    });
    it(`can be called with multiple scopes and subscopes`, function() {
      doubleMeasureProperty(true);
      let performance = mockPerformance();
      let measure = new PerformanceMeasure();

      measure.enableScopes('foo,bar,baz:foo');
      measure.trace(123, OP_START, 'foo');
      measure.trace(123, OP_STOP);
      measure.trace(234, OP_START, 'bar:baz');
      measure.trace(234, OP_STOP);
      measure.trace(567, OP_START, 'baz');
      measure.trace(567, OP_STOP);
      measure.trace(891, OP_START, 'baz:foo');
      measure.trace(891, OP_STOP);

      expect(performance.measureCalls).to.equal(3, 'We called measure only three times');

      performance.restore();
      restoreMeasureProperty();
    });
  });

  describe('mark()', function() {
    it('calls mark when the performance-api is present', function() {
      doubleMeasureProperty(true);
      let performance = mockPerformance();
      let measure = new PerformanceMeasure();

      measure.mark(100);

      expect(performance.markCalls).to.equal(1, 'We called mark');
      expect(measure._timings).to.equal(null, 'We did not store our own timing');

      performance.restore();
      restoreMeasureProperty();
    });
    it('calls creates and stores a timing when the performance-api is not present', function() {
      doubleMeasureProperty(false);
      let performance = mockPerformance();
      let measure = new PerformanceMeasure();
      measure.now = function() { return 1; };

      measure.mark(100);

      expect(performance.markCalls).to.equal(0, 'We did not call mark');
      expect(measure._timings).to.eql({ 100: 1 }, 'We stored our own timing');

      performance.restore();
      restoreMeasureProperty();
    });
  });

  describe('measureStart()', function() {
    it('no-ops performance.measure is available', function() {
      doubleMeasureProperty(true);
      let performance = mockPerformance();
      let console = mockConsole();
      let measure = new PerformanceMeasure();
      measure.measureStart('foo');

      expect(performance.measureCalls).to.equal(0, `We shouldn't call measure`);
      expect(console.timeCalls).to.equal(0, 'We did not call time');
      expect(console.lastTimeArgs).to.equal(null, 'We did not call time');

      performance.restore();
      console.restore();
      restoreMeasureProperty();
    });
    it('calls console.time when performance.measure is not available', function() {
      doubleMeasureProperty(false);
      let performance = mockPerformance();
      let console = mockConsole();
      let measure = new PerformanceMeasure();
      measure.measureStart('foo');

      expect(performance.measureCalls).to.equal(0, `We shouldn't call measure`);
      expect(console.timeCalls).to.equal(1, 'We called time');
      expect(console.lastTimeArgs).to.eql(['foo'], 'We called time with a label');

      performance.restore();
      console.restore();
      restoreMeasureProperty();
    });
  });

  describe('measure()', function() {
    it('calls performance.measure when available', function() {
      doubleMeasureProperty(true);
      let performance = mockPerformance();
      let console = mockConsole();
      let measure = new PerformanceMeasure();
      measure.measure('foo', 'bar', 'baz');

      expect(performance.measureCalls).to.equal(1, 'We called measure');
      expect(performance.lastMeasureArgs).to.eql(['foo', 'bar', 'baz'], 'We called measure with the right args.');
      expect(console.timeEndCalls).to.equal(0, 'We did not call timeEnd');

      performance.restore();
      console.restore();
      restoreMeasureProperty();
    });
    it('calls console.timeEnd when performance.measure is not available', function() {
      doubleMeasureProperty(false);
      let performance = mockPerformance();
      let console = mockConsole();
      let measure = new PerformanceMeasure();
      measure.measure('foo', 'bar', 'baz');

      expect(performance.measureCalls).to.equal(0, 'We did not call measure');
      expect(console.timeEndCalls).to.equal(1, 'We called timeEnd');
      expect(console.lastTimeEndArgs).to.eql(['foo'], 'We called timeEnd with the right args.');

      performance.restore();
      console.restore();
      restoreMeasureProperty();
    });
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
