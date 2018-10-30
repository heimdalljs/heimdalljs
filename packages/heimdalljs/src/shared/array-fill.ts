import hasTypedArrays from './has-typed-arrays';

export default function fill(array: Uint32Array | number[], value: number, start?: number, end?: number) {
  if (hasTypedArrays()) {
    return (array as Uint32Array).fill(value, start, end);
  } else {
    let s: number = start || 0;
    const e: number = end || array.length;
    for (; s < e; s++) {
      array[s] = value;
    }
    return array;
  }
}
