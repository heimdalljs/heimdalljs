import nodeResolve from 'rollup-plugin-node-resolve';
import babel from 'rollup-plugin-babel';
import commonjs from 'rollup-plugin-commonjs';

export default {
  entry: 'src/runtime/node/index.js',
  moduleName: 'heimdalljs',
  plugins: [
    babel({
      exclude: 'node_modules/**'
    }),
    nodeResolve({ jsnext: true, main: true }),
    commonjs({ include: 'node_modules/**', ignoreGlobal: true }),
  ],
  targets: [
    { dest: 'dist/heimdalljs.cjs.js', format: 'cjs' },
    { dest: 'dist/heimdalljs.es.js', format: 'es' },
  ]
};
