'use strict';

function shouldStripNode(node) {
  if (node.id &&
    node.id.type === 'Identifier' &&
    node.id.name === 'heimdall') {
    return true;
  } else if (node.type === 'CallExpression' &&
    node.callee &&
    node.callee.type === 'MemberExpression' &&
    node.callee.object.name === 'heimdall') {

    return true;

    // catch things like `token = heimdall.start('<id>')
  } else if (node.type === 'AssignmentExpression') {
    if (node.right) {
      return shouldStripNode(node.right);
    }
  } else if (node.type === 'VariableDeclarator') {
    if (node.init) {
      return shouldStripNode(node.init);
    }
  }

  return false;
}

function stripHeimdall(babel) {
  let t = babel.types;

  return {
    name: "strip-heimdall", // not required
    visitor: {

      ExpressionStatement: function(path) {
        let node = path.node;
        // strip stops
        if (shouldStripNode(node.expression)) {
          path.remove();
        }
      },

      VariableDeclaration: function(path) {
        let node = path.node;
        //strip `let token = heimdall.start('<id>');`
        if (node.declarations) {
          if (node.declarations.length === 1) {
            let d = node.declarations[0];

            if (shouldStripNode(d)) {
              path.remove();
            }
          } else {
            for (let i = 0; i < node.declarations.length; i++) {
              let d = node.declarations[i];
              if (d.init && d.init.type === 'CallExpression') {
                if (shouldStripNode(d)) {
                  node.declarations.splice(i, 1);
                }
              }
            }
          }
        }
      }
    }
  };
}

stripHeimdall.baseDir = function() {
  return __dirname;
};

module.exports = stripHeimdall;
