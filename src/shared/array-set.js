import { HAS_TYPED_ARRAYS } from './a';

export default function set(array, dataSource, offset = 0) {
  if (HAS_TYPED_ARRAYS) {
    return array.set(dataSource, offset);
  } else {
    for (let i = 0, j = offset, l = dataSource.length; i < l; i++, j++) {
      array[j] = dataSource[i];
    }
    return array;
  }
}
