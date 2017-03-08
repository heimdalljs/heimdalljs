export default function assert(msg: String, test: any) {
  if (!test) {
    throw new Error(msg);
  }
}