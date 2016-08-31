/* eslint no-unused-vars:0 */
let fs = require('fs');

module.exports = function() {
  return {
    visitor: {
      CallExpression(path) {
        let node = path.node;

        if (node.callee.type === "MemberExpression" &&
            node.callee.object.name === 'babelHelpers' &&
            node.callee.property.name === 'classCallCheck') {

          // skip the preflight check in rollup-plugin-babel
          //   for whatever weird reason that plugin includes
          //   `transform( 'export default class Foo {}', options )

          let filePath = path.hub.file.parserOpts.filename;
          if (fs.existsSync(filePath)) {
            path.remove();
          }
        }
      }
    }
  };
};

