const SMALL_ARRAY_LENGTH = 250;

export default class EventArray {
  constructor(length = SMALL_ARRAY_LENGTH, initialData) {
    this.init(length, initialData);
  }

  init(length = SMALL_ARRAY_LENGTH, initialData) {
    this.length = 0;
    this._length = length;
    this._data = new Array(length);

    if (initialData) {
      if (initialData.length > length) {
        length = initialData.length;
        this._data.length = length;
        this._length = length;
      }

      for (let j = 0; j < initialData.length; j++) {
        this._data[j] = initialData[j];
        this.length++;
      }
    }
  }

  get(index) {
    if (index >= 0 && index < this.length) {
      return this._data.slice(index, index + 4);
    }

    return undefined;
  }

  set(index, value) {
    if (index > this.length) {
      throw new Error("Index is out of array bounds.");
    }

    if (index === this.length) {
      this.length++;
    }

    this._data[index] = value;
  }

  forEach(cb) {
    for (let i = 0; i < this.length; i += 4) {
      cb(this._data.slice(i, i + 4), i);
    }
  }

  push(op, name, time, data) {
    let index = this.length;
    this.length += 4;

    if (index >= this._length) {
      this._length *= 2;
      this._data.length = this._length;
    }

    this._data[index] = op;
    this._data[index + 1] = name;
    this._data[index + 2] = time;
    this._data[index + 3] = data;

    return index;
  }

  pop() {
    let index = --this.length;

    if (index < 0) {
      this.length = 0;
      return undefined;
    }

    return this._data[index];
  }

}