import doubleArray from '../mock/has-typed-arrays';

export default {
  default: {
    setup() {}
  },

  'array-fallback': {
    setup() {
      doubleArray(false);
    }
  }
};