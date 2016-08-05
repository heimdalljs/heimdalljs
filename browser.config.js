import nodeResolve from 'rollup-plugin-node-resolve';
import babel from 'rollup-plugin-babel';
import commonjs from 'rollup-plugin-commonjs';

export default {
  entry: 'src/browser/index.js',
  moduleName: 'heimdalljs',
  plugins: [
    babel({
      exclude: 'node_modules/**'
    }),
    nodeResolve({ jsnext: true, main: true }),
    commonjs({ include: 'node_modules/**' }),
  ],
  targets: [
    { dest: 'dist/heimdalljs.umd.js', format: 'umd' },
    { dest: 'dist/heimdalljs.iife.js', format: 'iife' },
  ]
};

