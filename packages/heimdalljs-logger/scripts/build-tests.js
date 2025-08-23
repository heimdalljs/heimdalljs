#!/usr/bin/env node
'use strict';

var rollup = require('rollup');
const nodeResolve = require('@rollup/plugin-node-resolve');
const babel = require('rollup-plugin-babel');
const commonjs = require('@rollup/plugin-commonjs');
const json = require('@rollup/plugin-json');
const pkg = require('../package.json');

rollup
  .rollup({
    input: 'tests/index.js',
    external: [
      ...Object.keys(pkg.devDependencies),
      ...Object.keys(pkg.dependencies),
      'path',
    ],
    plugins: [
      babel({ exclude: 'node_modules/**', include: 'src/**', babelrc: true }),
      nodeResolve({ jsnext: true, main: true }),
      commonjs({ include: '../../node_modules/**', ignoreGlobal: true }),
      json(),
    ],
  })
  .then((bundle) => {
    return bundle.write({
      name: 'heimdall-js-logger',
      file: 'dist/tests/index.js',
      format: 'cjs',
    });
  });
