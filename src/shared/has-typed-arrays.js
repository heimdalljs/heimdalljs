let HAS_TYPED_ARRAYS = typeof Uint32Array !== 'undefined';

/*
  For stubbing in tests
 */
export function _setHasTypedArrays(v) {
  HAS_TYPED_ARRAYS = v;
}

export default function hasTypedArrays() {
  return HAS_TYPED_ARRAYS;
}
