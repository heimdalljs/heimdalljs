export const SMALL_ARRAY_LENGTH = 250;
export const MAX_ARRAY_LENGTH = 1e6;
import A from './a';

export default class FastIntArray {
  constructor(length = SMALL_ARRAY_LENGTH, initialData) {
    this.init(length, initialData);
  }

  init(length = SMALL_ARRAY_LENGTH, initialData) {
    this.length = 0;
    this._length = length;
    this._fillValue = 0;
    this._data = new A(length);

    if (initialData) {
      if (initialData.length > length) {
        length = initialData.length;

        this.grow(length);
      }

      for (let j = 0; j < initialData.length; j++) {
        this._data[j] = initialData[j];
        this.length++;
      }
    }
  }

  toJSON() {
    return this._data.slice(0, this.length);
  }

  get(index) {
    if (index >= 0 && index < this.length) {
      return this._data[index];
    }

    return undefined;
  }

  increment(index) {
    this._data[index]++;
  }

  /*
   Uint32Arrays have an immutable length. This method
   enables us to efficiently increase the length by
   any quantity.
   */
  grow(newLength) {
    this._data = arrayGrow(this._data, this._length, newLength, this._fillValue);
    this._length = newLength;
  }

  claim(count) {
    this.length += count;
    while (this.length > this._length) {
      this.grow(this._length * 2);
    }
  }

  push(int) {
    let index = this.length++;

    if (index === this._length) {
      this.grow(this._length * 2);
    }

    this._data[index] = int;
  }
}
