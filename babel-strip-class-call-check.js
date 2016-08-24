/* eslint no-unused-vars:0 */
module.exports = function() {
  return {
    visitor: {
      ExpressionStatement(path) {
        let node = path.node;

        if (node.expression.type === 'CallExpression' &&
           node.expression.callee &&
           node.expression.callee.type === 'MemberExpression' &&
           node.expression.callee.object.name === 'babelHelpers' &&
           node.expression.callee.property.name === 'classCallCheck') {

          // TODO this `if` check is magix, we need to know why this makes this work
          if (path.parent.body.length > 1) {
            path.remove();
          }
         }
     }
    }
  };
};

