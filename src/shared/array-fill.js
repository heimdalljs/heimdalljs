import { HAS_TYPED_ARRAYS } from './a';

export default function fill(array, value, start, end) {
  if (HAS_TYPED_ARRAYS) {
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
