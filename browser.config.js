import nodeResolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import replace from 'rollup-plugin-replace';
import typescript from 'rollup-plugin-typescript';

export default {
  entry: 'src/runtime/browser/index.ts',
  // module name is really heimdalljs but this is the global name
  moduleName: 'heimdall',
  plugins: [
    typescript({
      include: [
        'src/**/*'
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
    { dest: 'dist/heimdalljs.umd.js', format: 'umd' },
    { dest: 'dist/heimdalljs.iife.js', format: 'iife' },
  ]
};

