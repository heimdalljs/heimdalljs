import heimdall from 'heimdalljs';

const MATCHER = n => true;

export default class Prefixer {
  constructor() {
    let logConfig = heimdall.configFor('logging');

    this.matcher = logConfig.matcher || MATCHER;
    this.depth = typeof logConfig.depth === 'number' ? logConfig.depth : 3;
  }

  // TODO: possibly memoize this using a WeakMap
  //  currently we compute prefix on every call to `log`
  prefix() {
    let parts = [];
    let node = heimdall.current;

    while (node) {
      if (node.isRoot || parts.length >= this.depth) {
        break;
      }

      if (this.matcher(node.id)) {
        parts.push(`${node.id.name}#${node._id}`);
      }

      node = node.parent;
    }

    return parts.length > 0 ? `[${parts.reverse().join(' -> ')}] ` : '';
  }
}
