import nodeResolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import replace from 'rollup-plugin-replace';
import typescript from 'rollup-plugin-typescript';

export default {
  entry: 'tests/index.ts',
  moduleName: 'heimdall-js',
  plugins: [
    typescript({
      include: [
        'src/**/*',
        'tests/**/*'
      ],
      exclude: [
        'node_modules/**'
      ]
    }),
    nodeResolve({ jsnext: true, main: true }),
    commonjs({ include: 'node_modules/**', ignoreGlobal: true }),
    replace({
      VERSION_STRING_PLACEHOLDER: require('./package').version
    }),
  ],
  targets: [
    { dest: 'dist/tests/bundle.cjs.js', format: 'cjs' },
    { dest: 'dist/tests/bundle.umd.js', format: 'umd' },
    { dest: 'dist/tests/bundle.es.js', format: 'es' },
  ]
};
