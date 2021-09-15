module.exports = function arrayOf(value, len) {
  let rv = new Array(len);

  for (let i = 0; i < rv.length; ++i) {
    rv[i] = value;
  }

  return rv;
};
