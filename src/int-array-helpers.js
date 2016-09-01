export default function grow(arr) {
  let a = new Uint32Array(arr.length *2);
  a.set(arr);

  return a;
};