import hasTypedArrays from './has-typed-arrays';

export default function fill(array, value, start, end) {
  if (hasTypedArrays()) {
    return array.fill(value, start, end);
  } else {
    let s = start || 0;
    let e = end || array.length;
    for (;s<e;s++) {
      array[s] = value;
    }
    return array;
  }
}
