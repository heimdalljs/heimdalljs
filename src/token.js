export default class Token {
  constructor(id, heimdall) {
    this._heimdall = heimdall;
    this._id = id;
  }

  stop() {
    console.warn('DEPRECATED!! use of token.stop() should be refactored to heimdall.stop(token);');
    this._heimdall.stop(this);
  }

  get stats() {
    console.warn('DEPRECATED!! use of token.stats should be refactored to heimdall.statsForNode(token).own;');
    return this._heimdall.statsForNode(this).own;
  }

  resume() {
    console.warn('DEPRECATED!! use of token.resume() should be refactored to heimdall.resume(token);');
    this._heimdall.resume(this);
  }
}