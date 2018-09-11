import FastIntArray from './fast-int-array';
import JsonSerializable from '../interfaces/json-serializable';

const SMALL_ARRAY_LENGTH: number = 250;

export default class EventArray implements JsonSerializable<number[]> {
  private _length: number;
  private _data: any[];

  public length: number;

  constructor(length: number = SMALL_ARRAY_LENGTH, initialData?: any[]) {
    this.init(length, initialData);
  }

  public toJSON(): number[] {
    return this._data.slice(0, this.length);
  }

  public init(length: number = SMALL_ARRAY_LENGTH, initialData?: any[]): void {
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

  // TODO this should probably multiple index by 4 to hide
  // that we store in a flat array
  public get(index: number): any | undefined {
    if (index >= 0 && index < this.length) {
      return this._data.slice(index, index + 4);
    }

    return undefined;
  }

  public set(index: number, value: any): void {
    if (index > this.length) {
      throw new Error('Index is out of array bounds.');
    }

    if (index === this.length) {
      this.length++;
    }

    this._data[index] = value;
  }

  public forEach(cb: (x: any, n: number) => void): void {
    for (let i = 0; i < this.length; i += 4) {
      cb(this._data.slice(i, i + 4), i);
    }
  }

  public push(op: number, name: string | number, time: number, data: Uint32Array | number[] | FastIntArray): number {
    const index: number = this.length;
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

  public pop(): any | undefined {
    const index: number = --this.length;

    if (index < 0) {
      this.length = 0;
      return undefined;
    }

    return this._data[index];
  }
}
