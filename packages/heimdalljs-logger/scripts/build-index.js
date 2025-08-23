#!/usr/bin/env node
'use strict';

const nodeResolve = require('@rollup/plugin-node-resolve');
const babel = require('rollup-plugin-babel');
const commonjs = require('@rollup/plugin-commonjs');
const json = require('@rollup/plugin-json');
const rollup = require('rollup');

rollup
  .rollup({
    input: 'src/index.js',
    external: ['heimdalljs', 'debug'],
    plugins: [
      babel({ exclude: 'node_modules/**', babelrc: true }),
      nodeResolve({ jsnext: true, main: true }),
      commonjs({ include: '../../node_modules/**', ignoreGlobal: true }),
      json(),
    ],
  })
  .then((bundle) => {
    return bundle.write({
      name: 'heimdalljs-logger',
      file: 'dist/index.js',
      format: 'cjs',
    });
  });
