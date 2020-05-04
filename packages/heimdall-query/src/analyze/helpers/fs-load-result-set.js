const fs = require('fs');

module.exports = function fsLoadResultSet(path) {
  return JSON.parse(fs.readFileSync(path, 'UTF8'));
};
