let timeNS;

// adapted from
// https://gist.github.com/paulirish/5438650
const now = Date.now || function () {
  return new Date().getTime();
};

const dateOffset = now();

export function timeFromDate() {
  let timeMS = now() - dateOffset;

  return timeMS * 1e6;
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
