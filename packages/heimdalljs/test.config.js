import nodeResolve from '@rollup/plugin-node-resolve';
import babel from 'rollup-plugin-babel';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import pkg from './package.json';

export default {
  input: 'tests/index.js',
  output: [{
    name: 'heimdalljs',
    file: 'dist/tests/bundle.cjs.js',
    format: 'cjs',
  },
  {
    name: 'heimdalljs',
    file: 'dist/tests/bundle.umd.js',
    format: 'umd',
  },{
    name: 'heimdalljs',
    file: 'dist/tests/bundle.es.js',
    format: 'es',
  }],
  external: [...Object.keys(pkg.devDependencies), ...Object.keys(pkg.dependencies), 'path'],
  plugins: [
    babel({ exclude: 'node_modules/**', include: 'src/**', babelrc: true }),
    nodeResolve({ jsnext: true, main: true }),
    commonjs({ include: '../../node_modules/**', ignoreGlobal: true }),
    json(),
  ],
};