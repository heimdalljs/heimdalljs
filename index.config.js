import nodeResolve from 'rollup-plugin-node-resolve';
import buble from 'rollup-plugin-buble';
import commonjs from 'rollup-plugin-commonjs';

export default {
  entry: 'index.js',
  moduleName: 'heimdall',
  format: 'iife',
  plugins: [
    buble(),
    nodeResolve({ jsnext: true, main: true }),
    commonjs({ include: 'node_modules/**' })
  ],
  targets: [
    { dest: 'dist/bundle.cjs.js', format: 'cjs' },
    { dest: 'dist/bundle.umd.js', format: 'umd' },
    { dest: 'dist/bundle.es.js', format: 'es' },
  ]
}
