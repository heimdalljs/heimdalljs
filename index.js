'use strict';
import Heimdall, { VERSION } from './lib/heimdall';
// import semver from 'semver';

let compatibleVersion = '^' + VERSION;
let heimdall;

if (typeof process !== 'undefined') {
  if (process._heimdall) {
    var globalVersion = process._heimdall.version;
    if (!semver.satisfies(globalVersion, compatibleVersion)) {
      throw new Error('Version "' + globalVersion + '" not compatible with "' + compatibleVersion + '"');
    }
    heimdall = process._heimdall;
  } else {
    heimdall = process._heimdall = new Heimdall();
  }
} else {
  heimdall = new Heimdall();
}

export default heimdall;
