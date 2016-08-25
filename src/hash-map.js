import EmptyObject from './empty-object';

export const UNDEFINED_KEY = Object.create(null);

export default class HashMap {

  constructor(entries) {
    this._data = new EmptyObject();

    if (entries) {
      for (let i = 0; i < entries.length; i++) {
        this.data[entries[i][0]] = entries[i][1];
      }
    }
  }

  forEach(cb) {
    for (let key in this._data) {
      // skip undefined
      if (this._data[key] !== UNDEFINED_KEY) {
        cb(this._data[key], key);
      }
    }

    return this;
  }

  get({ _id:key }) {
    let val = this._data[key];

    return val === UNDEFINED_KEY ? undefined : val;
  }

  set({ _id:key }, value) {
    this._data[key] = value;

    return this;
  }

  delete(key) {
    this._data[key] = UNDEFINED_KEY;

    return true;
  }

}