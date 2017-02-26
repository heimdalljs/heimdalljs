const HAS_CONSOLE: boolean = typeof console !== 'undefined';
const K: Function = function() {};

export const warn = HAS_CONSOLE ? function warn() {
  console.warn.apply(console, arguments);
} : K;

export const log = HAS_CONSOLE ? function log() {
  console.log.apply(console, arguments);
} : K;

export default {
  warn,
  log
};