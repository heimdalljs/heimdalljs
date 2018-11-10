let HAS_TYPED_ARRAYS: boolean = typeof Uint32Array !== 'undefined';

/*
  For stubbing in tests
 */
export function _setHasTypedArrays(v: boolean) {
  HAS_TYPED_ARRAYS = v;
}

export default function hasTypedArrays(array?: Uint32Array | number[]): array is Uint32Array {
  return HAS_TYPED_ARRAYS;
}
