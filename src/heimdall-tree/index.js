export default class HeimdallTree {
  constructor(heimdall) {
    this._heimdall = heimdall;
    this._nextId = 0;
  }

  construct() {

  }

  visitPreOrder(cb) {
    throw new Error('TODO, implement');
  }

  visitPostOrder(cb) {
    throw new Error('TODO, implement');
  }

  generateNextId() {
    return this._nextId++;
  }
}