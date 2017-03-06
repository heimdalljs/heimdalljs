export const UNDEFINED_KEY: Object = Object.create(null);

export default class HashMap<T> {
  private _data: Object;

  data: Object;

  constructor(entries?: any) {
    this._data = Object.create(null);

    if (entries) {
      for (let i = 0; i < entries.length; i++) {
        this.data[entries[i][0]] = entries[i][1];
      }
    }
  }

  forEach(cb: Function): HashMap<T> {
    for (let key in this._data) {
      // skip undefined
      if (this._data[key] !== UNDEFINED_KEY) {
        cb(this._data[key], key);
      }
    }

    return this;
  }

  has(key: string): boolean {
    return key in this._data && this._data[key] !== UNDEFINED_KEY;
  }

  get(key: string): T | undefined {
    let val: T = this._data[key];

    return val === UNDEFINED_KEY ? undefined : val;
  }

  set(key: string | number, value: T): HashMap<T> {
    this._data[key] = value;

    return this;
  }

  delete(key: string): void {
    this._data[key] = UNDEFINED_KEY;
  }
}
