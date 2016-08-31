export let now;
export let format;
export let ORIGIN_TIME;

if (typeof performance === 'object' && typeof performance.now === 'function') {
  now = performance.now.bind(performance);
  format = 'milli';
} else if (typeof process !== 'undefined' && typeof process.hrtime === 'function') {
  now = process.hrtime.bind(process);
  format = 'hrtime';
} else {
  ORIGIN_TIME = Date.now();
  now = Date.now.bind(Date);
  format = 'timestamp';
}

export function normalizeTime(time) {
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

export function milliToNano(time) {
  return Math.floor(time * 1e6);
}

export function timeFromHRTime() {
  let hrtime = process.hrtime();
  return hrtime[0] * 1e9 + hrtime[1];
}

export default now;