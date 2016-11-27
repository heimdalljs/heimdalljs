import A from './a';

export default function fill(array, value, start, end) {
  if (typeof array.fill === 'function') {
    return array.fill(value, start, end);
  } else {
    let len = array.length;
    let s = start || 0;
    let e = end || len;
    for (;s<e;s++) {
      array[s] = value;
    }
    return array;
  }
}
