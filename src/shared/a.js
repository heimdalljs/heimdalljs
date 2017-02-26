export const HAS_TYPED_ARRAYS = typeof Uint32Array !== 'undefined';

export default HAS_TYPED_ARRAYS ? Uint32Array : Array;
