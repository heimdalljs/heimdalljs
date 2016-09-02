export const SMALL_ARRAY_LENGTH = 250;
export const MAX_ARRAY_LENGTH = 1e6;

export class FastIntArray {
  constructor(length = SMALL_ARRAY_LENGTH) {
    this.init(length);
  }

  init(length = SMALL_ARRAY_LENGTH) {
    this.length = 0;
    this._length = length;
    this._fill = 0;
    this._data = new Uint32Array(length);
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
    let l = this._length;
    this._length = newLength;


    let data = this._data;
    let _d = this._data = new Uint32Array(newLength);

    _d.set(data);

    if (this._fill !== 0) {
      _d.fill(this._fill, l);
    }
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

export default FastIntArray;