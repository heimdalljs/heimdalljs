#!/usr/bin/env node
'use strict';

var rollup = require('rollup');
var nodeResolve = require('@rollup/plugin-node-resolve');
var babel = require('rollup-plugin-babel');
var commonjs = require('@rollup/plugin-commonjs');
var json = require('@rollup/plugin-json');

async function build(input, dest, format) {
  const bundle = await rollup.rollup({
    input,
    external: [
      'clear-require',
      'chai',
      'fs',
      'heimdalljs',
      'heimdalljs-graph',
      'module',
    ],
    plugins: [
      babel({
        exclude: 'node_modules/**',
        presets: [['es2015', { modules: false }]],
        plugins: [
          'external-helpers',
          [
            'transform-runtime',
            {
              helpers: false, // defaults to true
              polyfill: false, // defaults to true
              regenerator: true, // defaults to true
            },
          ],
        ],
      }),
      nodeResolve({ jsnext: true, main: true }),
      commonjs({ include: '../../node_modules/**', ignoreGlobal: true }),
      json(),
    ],
  });

  await bundle.write({
    file: dest,
    format,
  });
}

(async function () {
  await build('src/index.js', 'dist/index.js', 'cjs');
  await build('tests/index.js', 'dist/tests/index.js', 'cjs');
  await build(
    'tests/fixtures/silly-module.js',
    'dist/tests/fixtures/silly-module.js',
    'cjs'
  );
  await build(
    'tests/fixtures/slow-module.js',
    'dist/tests/fixtures/slow-module.js',
    'cjs'
  );
})();
