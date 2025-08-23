#!/usr/bin/env node
'use strict';

const nodeResolve = require('@rollup/plugin-node-resolve');
const babel = require('rollup-plugin-babel');
const commonjs = require('@rollup/plugin-commonjs');
const json = require('@rollup/plugin-json');
const pkg = require('../package.json');
const rollup = require('rollup');

rollup
  .rollup({
    input: 'src/node/index.js',
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
    return bundle
      .write({
        name: 'heimdalljs',
        file: 'dist/heimdalljs.cjs.js',
        format: 'cjs',
      })
      .then(() => {
        return bundle.write({
          name: 'heimdalljs',
          file: 'dist/heimdalljs.es.js',
          format: 'es',
        });
      });
  });
