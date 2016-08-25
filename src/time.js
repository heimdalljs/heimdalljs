let timeNS;

// adapted from
// https://gist.github.com/paulirish/5438650
let now;
if (typeof performance === 'object' && typeof performance.now === 'function') {
  now = function now() {
    return performance.now.call(performance);
  };
} else {
  const dateOffset = new Date().getTime();
  now = function now() { return new Date().getTime() - dateOffset; };
}

const dateOffset = now();

export function timeFromDate() {
  return Math.floor(now() * 1e6);
}


export function timeFromHRTime() {
  let hrtime = process.hrtime();
  return hrtime[0] * 1e9 + hrtime[1];
}

if (typeof process === 'object' && typeof process.hrtime === 'function') {
  timeNS = timeFromHRTime;
} else {
  timeNS = timeFromDate;
}

export default timeNS;
