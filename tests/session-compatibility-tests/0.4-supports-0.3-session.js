/*
  In 0.3, HeimdallSession.events stored information in four-indeces segments
  that mapped to `token, opCode, timestamp, counterCache`.

  In 0.4, the third index is a `traceId` instead, which can be used to locate
  the timestamp from within the dictionary returned by `HeimdallSession.timings`.

  On the surface, this change is non-breaking; however, HeimdallTree must be able
  to correctly inter-op these two formats.  To do so, the following algorithm is used:


 */
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