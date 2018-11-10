export const UNDEFINED_KEY: any = Object.create(null);

export default class HashMap<T> {
  private _data: object;

  public data: object;

  constructor(entries?: any) {
    this._data = Object.create(null);

    if (entries) {
      for (let i = 0; i < entries.length; i++) {
        this.data[entries[i][0]] = entries[i][1];
      }
    }
  }

  public forEach(cb: (arg1: any, arg2: any) => void): HashMap<T> {
    for (const key in this._data) {
      // skip undefined
      if (this._data[key] !== UNDEFINED_KEY) {
        cb(this._data[key], key);
      }
    }

    return this;
  }

  public has(key: string): boolean {
    return key in this._data && this._data[key] !== UNDEFINED_KEY;
  }

  public get(key: string): T | undefined {
    const val: T = this._data[key];

    return val === UNDEFINED_KEY ? undefined : val;
  }

  public set(key: string | number, value: T): HashMap<T> {
    this._data[key] = value;

    return this;
  }

  public delete(key: string): void {
    this._data[key] = UNDEFINED_KEY;
  }
}
