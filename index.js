'use strict';

var Heimdall = require('./src/heimdall');
var semver = require('semver');
var version = require('./package.json').version;
var compatibleVersion = '^' + version;


if (process._heimdall) {
  var globalVersion = process._heimdall.version;
  if (!semver.satisfies(globalVersion, compatibleVersion)) {
    throw new Error('Version "' + globalVersion + '" not compatible with "' + compatibleVersion + '"');
  }
} else {
  process._heimdall = new Heimdall();
}


module.exports = process._heimdall;
