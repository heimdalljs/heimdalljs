import A from './a';

export default function fill(array: Uint32Array | number[], value: number, start?: number, end?: number): Uint32Array | number[] {
  if (typeof array.fill === 'function') {
    return array.fill(value, start, end);
  } else {
    let len: number = array.length;
    let s: number = start || 0;
    let e: number = end || len;
    for (;s<e;s++) {
      array[s] = value;
    }
    return array;
  }
}
