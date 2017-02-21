export default function makeDict() {
  let dict = Object.create(null);
  dict['__dict'] = '';
  delete dict['__dict'];

  return dict;
}