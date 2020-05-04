'use strict';

const assert = require('assert');
const path = require('path');

const babel = require('babel-core');
const StripHeimdall = require('../index');
const stripIndent = require('common-tags').stripIndent;

describe('babel6-plugin-strip-heimdall', function() {
  let precompile, plugins;

  function transform(code) {
    return babel.transform(code, {
      plugins
    }).code.trim();
  }

  beforeEach(function() {
    precompile = (template) => template.toUpperCase();

    plugins = [
      [StripHeimdall]
    ];
  });

  it("strips general heimdall statements", function() {
    let input = stripIndent`
      (function (global) {
        var heimdall = global.heimdall;

        const { foo } = heimdall.registerMonitor('bar', 'foo');

        let token = heimdall.start('foo');

        let a = 'hi', b = heimdall.start('bar');
        let c = heimdall.start('c'), d = 'bye';

        switch (a) {
          case 'foo':
            heimdall.stop(token);
            break;
          case 'bar':
            heimdall.annotate({});
            heimdall.stop(token);
            break;
          default:
            heimdall.increment(foo);
            break;
        }

        heimdall.stop(token);
        token = heimdall.start('bar');

      })(window);
    `;

    let expected = stripIndent`
      (function (global) {

        let a = 'hi';
        let d = 'bye';

        switch (a) {
          case 'foo':
            break;
          case 'bar':
            break;
          default:
            break;
        }
      })(window);
    `;
    let actual = transform(input);

    assert.equal(expected, actual);
  });
});
