import Heimdall from './index';
import deprecate from '../shared/deprecate';

export default class DeprecatedNode {
  private _heimdall: Heimdall;
  private _id: any;

  constructor(token, heimdall, id, data) {
    this._heimdall = heimdall;

    this._id = token;
    this.id = id;

    if (id === '' || typeof id !== 'string') {
      deprecate(`non-string-id`, {
        id: 'non-string-id',
        since: '0.3',
        until: '0.4'
      });

      if (!id || id.name === '' || typeof id.name !== 'string') {
        throw new TypeError('HeimdallNode#id.name must be a string');
      }

      this.id = id.name;
      heimdall.annotate({ 'heimdall-node-id': id });
    }

    // TODO we need to make this a counter primitive
    // TODO this would also fail if we segmented the data
    this.stats = data;
    heimdall.annotate({ 'heimdall-node-stats': data });

    // this._children = [];
    // this.parent = null;
  }

  get isRoot() {
    throw new Error('removed');
  }

  visitPreOrder() {
    throw new Error('removed');
  }

  visitPostOrder() {
    throw new Error('removed');
  }

  forEachChild() {
    throw new Error('removed');
  }

  remove() {
    throw new Error('Shim Needs Implemented');
    /*
    if (!this.parent) {
      throw new Error('Cannot remove the root heimdalljs node.');
    }
    if (this._heimdall.current === this) {
      throw new Error('Cannot remove an active heimdalljs node.');
    }

    return this.parent.removeChild(this);
    */
  }

  toJSON() {
    throw new Error('removed');
  }

  toJSONSubgraph() {
    throw new Error('removed');
  }

  addChild(node) {
    throw new Error('Shim Needs Implemented');
    /*
    if (node.parent) {
      throw new TypeError('Node ' + node._id + ' already has a parent.  Cannot add to ' + this._id);
    }

    this._children.push(node);

    node.parent = this;
    */
  }


  removeChild(child) {
    throw new Error('Shim Needs Implemented');
    /*
    let index = this._children.indexOf(child);

    if (index < 0) {
      throw new Error('Child(' + child._id + ') not found in Parent(' + this._id + ').  Something is very wrong.');
    }
    this._children.splice(index, 1);

    child.parent = null;

    return child;
    */
  }
}
