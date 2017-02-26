import hasTypedArrays from './has-typed-arrays';

export default function fill(array: Uint32Array | number[], value: number, start?: number, end?: number) {
  if (hasTypedArrays()) {
    return array.fill(value, start, end);
  } else {
    let s: number = start || 0;
    let e: number = end || array.length;
    for (;s<e;s++) {
      array[s] = value;
    }
    return array;
  }
}
