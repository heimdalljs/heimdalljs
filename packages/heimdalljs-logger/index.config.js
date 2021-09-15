import nodeResolve from '@rollup/plugin-node-resolve';
import babel from 'rollup-plugin-babel';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';

export default {
  input: 'src/index.js',
  output: [
    {
      name: 'heimdalljs-logger',
      file: 'dist/index.js',
      format: 'cjs',
    },
  ],
  external: ['heimdalljs', 'debug'],
  plugins: [
    babel({ exclude: 'node_modules/**', babelrc: true }),
    nodeResolve({ jsnext: true, main: true }),
    commonjs({ include: '../../node_modules/**', ignoreGlobal: true }),
    json(),
  ],
};
