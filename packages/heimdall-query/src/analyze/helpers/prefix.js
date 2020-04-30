const arrayOf = require('./array-of');

module.exports = function prefix(depth) {
  return `${arrayOf('* ', depth).join('')}`;
};
