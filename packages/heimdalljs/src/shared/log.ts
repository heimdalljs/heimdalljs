const HAS_CONSOLE: boolean = typeof console !== 'undefined';
const K: (...args: any[]) => void = () => {};

export const warn = HAS_CONSOLE ? function warn(...args: any[]) {
  console.warn.apply(console, args);
} : K;

export const log = HAS_CONSOLE ? function log(...args: any[]) {
  console.log.apply(console, args);
} : K;

export default {
  warn,
  log
};
