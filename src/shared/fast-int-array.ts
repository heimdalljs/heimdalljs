export const SMALL_ARRAY_LENGTH: number = 250;
export const MAX_ARRAY_LENGTH: number = 1e6;
import hasTypedArrays from './has-typed-arrays';
import fillArray from './array-fill';
import arrayGrow from './array-grow';
import JsonSerializable from '../interfaces/json-serializable';

export default class FastIntArray implements JsonSerializable<Uint32Array | number[]> {
  private _length: number;
  private _fillValue: number;
  private _data: Uint32Array | number[];

  public length: number;

  constructor(length: number = SMALL_ARRAY_LENGTH, initialData?: Uint32Array | number[] | FastIntArray) {
    this.init(length, initialData);
  }

  public init(length: number = SMALL_ARRAY_LENGTH, initialData?: Uint32Array | number[] | FastIntArray): void {
    const useTypedArray = hasTypedArrays();
    this.length = 0;
    this._length = length;
    this._fillValue = 0;
    this._data = useTypedArray ? new Uint32Array(length) : new Array(length);

    if (!useTypedArray) {
      fillArray(this._data, this._fillValue);
    }

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

  public toJSON(): Uint32Array | number[] {
    return this._data.slice(0, this.length);
  }

  public get(index: number): number | undefined {
    if (index >= 0 && index < this.length) {
      return this._data[index];
    }

    return undefined;
  }

  public increment(index: number): void {
    this._data[index]++;
  }

  /*
   Uint32Arrays have an immutable length. This method
   enables us to efficiently increase the length by
   any quantity.
   */
  public grow(newLength: number): void {
    this._data = arrayGrow(this._data, this._length, newLength, this._fillValue);
    this._length = newLength;
  }

  public claim(count: number): void {
    this.length += count;
    while (this.length > this._length) {
      this.grow(this._length * 2);
    }
  }

  public push(int: number): void {
    const index: number = this.length++;

    if (index === this._length) {
      this.grow(this._length * 2);
    }

    this._data[index] = int;
  }
}
