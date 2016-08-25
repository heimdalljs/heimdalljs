import EmptyObject from './empty-object';

const deprecations = new EmptyObject();

function deprecated(notice) {
  if (deprecations[notice]) {
    return;
  }

  deprecations[notice] = true;
  console.warn('DEPRECATED!! ' + notice);
}
export default class Token {
  constructor(id, heimdall) {
    this._heimdall = heimdall;
    this._id = id;
  }

  stop() {
    deprecated('use of token.stop() should be refactored to heimdall.stop(token);');
    this._heimdall.stop(this);
  }

  get stats() {
    deprecated('use of token.stats should be refactored to heimdall.statsForNode(token).own;');
    return this._heimdall.statsForNode(this).own;
  }

  resume() {
    deprecated('use of token.resume() should be refactored to heimdall.resume(token);');
    this._heimdall.resume(this);
  }
}