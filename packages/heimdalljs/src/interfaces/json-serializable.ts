/**
 * Simple interface that type checks `toJSON` method.
 *
 * @interface JsonSerializable
 * @template T
 */
interface JsonSerializable<T> {
  toJSON(): T;
}

export default JsonSerializable;
