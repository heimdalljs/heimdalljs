'use strict';

var Heimdall = require('./lib/heimdall');
var semver = require('semver');
var compatibleVersion = '^' + require('./package.json');


if (process._heimdall) {
  var version = process._heimdall.version;
  if (!semver.satisfies(version, compatibleVersion)) {
    throw new Error('Version "' + version + '" not compatible with "' + compatibleVersion + '"');
  }
} else {
  process._heimdall = new Heimdall();
}


module.exports = process._heimdall;
