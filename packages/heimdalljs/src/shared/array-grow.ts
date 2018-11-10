import hasTypedArrays from './has-typed-arrays';
import arrayFill from './array-fill';

export default function grow(array: Uint32Array | number[], oldLength: number, newLength: number, fillValue = 0) {
  if (hasTypedArrays(array)) {
    const ret = new Uint32Array(newLength);
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
