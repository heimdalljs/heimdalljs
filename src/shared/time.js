export let now;
export let format;
export const ORIGIN_TIME = Date.now();

// It turns out to be nicer for perf to bind than to close over the time method
// however, when testing we need to be able to stub the clock via the global
// so we use this boolean to determine whether we "bind" or use a wrapper function.
const freeGlobal = typeof window !== 'undefined' ? window : global;
const IS_TESTING = freeGlobal.IS_HEIMDALL_TEST_ENVIRONMENT;
export const HAS_PERFORMANCE_NOW = typeof performance === 'object' && typeof performance.now === 'function';

if (HAS_PERFORMANCE_NOW) {
  now = IS_TESTING ? function now() { return performance.now(); } : performance.now.bind(performance);
  format = 'milli';
} else if (typeof process !== 'undefined' && typeof process.hrtime === 'function') {
  now = IS_TESTING ? function now() { return process.hrtime(); } : process.hrtime.bind(process);
  format = 'hrtime';
} else {
  now = Date.now.bind(Date);
  format = 'timestamp';
}

export function normalizeTime(time, format = format) {
  switch (format) {
    case 'milli':
      return milliToNano(time);
    case 'hrtime':
      return timeFromHRTime(time);
    case 'timestamp':
      return milliToNano(time - ORIGIN_TIME);
    default:
      throw new Error('Unknown Format');
  }
}

export function toPrecision(n, decimals = 2) {
  let padding = 1;
  while (decimals > 0) {
    padding *= 10;
    decimals--;
  }
  n *= padding;
  n = Math.round(n);
  return n / padding;
}

export function milliToNano(time) {
  return Math.round(toPrecision(time) * 1e6);
}

export function timeFromHRTime(hrtime) {
  return hrtime[0] * 1e9 + hrtime[1];
}

export default now;