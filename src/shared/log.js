const HAS_CONSOLE = typeof console !== 'undefined';
const K = function() {};

export const warn = HAS_CONSOLE ? function warn() {
  console.warn.apply(console, arguments);
} : K;

export default {
  warn
};