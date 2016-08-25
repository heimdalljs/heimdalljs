import nodeResolve from 'rollup-plugin-node-resolve';
import babel from 'rollup-plugin-babel';
import commonjs from 'rollup-plugin-commonjs';

export default {
  entry: 'src/node/index.js',
  moduleName: 'heimdalljs',
  plugins: [
    babel({
      exclude: 'node_modules/**',
      include: 'node_modules/perf-primitives/**/**'
    }),
    nodeResolve({ jsnext: true, main: true }),
    commonjs({ include: 'node_modules/**' }),
  ],
  targets: [
    { dest: 'dist/heimdalljs.cjs.js', format: 'cjs' },
    { dest: 'dist/heimdalljs.es.js', format: 'es' },
  ]
};
