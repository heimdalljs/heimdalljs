import nodeResolve from 'rollup-plugin-node-resolve';
import buble from 'rollup-plugin-buble';
import commonjs from 'rollup-plugin-commonjs';

export default {
  entry: 'tests/index.js',
  moduleName: 'heimdall-js',
  format: 'iife',
  plugins: [
    buble(),
    nodeResolve({ jsnext: true, main: true }),
    commonjs({ include: 'node_modules/**' })
  ],
  targets: [
    { dest: 'dist/tests/bundle.cjs.js', format: 'cjs' },
    { dest: 'dist/tests/bundle.umd.js', format: 'umd' },
    { dest: 'dist/tests/bundle.es.js', format: 'es' },
  ]
}
