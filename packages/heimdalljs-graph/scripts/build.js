#!/usr/bin/env node
'use strict';

var rollup = require('rollup');
var babel = require('rollup-plugin-babel');
var nodeResolve = require('@rollup/plugin-node-resolve');
var commonjs = require('@rollup/plugin-commonjs');
var json = require('@rollup/plugin-json');

async function build(input, dest, format, name) {
  const bundle = await rollup.rollup({
    input,
    external: ['fs', 'heimdalljs', 'chai'],
    plugins: [
      babel({ exclude: 'node_modules/**' }),
      nodeResolve({ jsnext: true, main: true }),
      commonjs({ include: '../../node_modules/**', ignoreGlobal: true }),
      json(),
    ],
  });

  await bundle.write({
    name,
    file: dest,
    format,
  });
}

(async function () {
  await build(
    'src/runtimes/browser.js',
    'dist/amd/heimdalljs-graph.js',
    'amd',
    'heimdalljs-graph'
  );
  await build('src/runtimes/node.js', 'dist/cjs/index.js', 'cjs');
  await build(
    'tests/runtimes/browser.js',
    'dist/amd/heimdalljs-graph-tests.js',
    'amd',
    'heimdalljs-graph-tests'
  );
  await build('tests/runtimes/node.js', 'dist/cjs/tests/index.js', 'cjs');
})();
