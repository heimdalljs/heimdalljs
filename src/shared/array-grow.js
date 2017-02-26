import { HAS_TYPED_ARRAYS, default as A } from './a';
import arrayFill from './array-fill';

export default function grow(array, oldLength, newLength, fillValue = 0) {
  if (HAS_TYPED_ARRAYS) {
    let ret = new A(newLength);
    ret.set(array);

    if (fillValue !== 0) {
      ret.fill(fillValue, oldLength);
    }

    return ret;
  } else {
    array.length = newLength;
    arrayFill(array, fillValue, oldLength, newLength);

    return array;
  }
}
