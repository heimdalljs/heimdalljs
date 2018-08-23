import nodeResolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import replace from 'rollup-plugin-replace';
import typescript from 'rollup-plugin-typescript';

export default {
  input: 'src/runtime/browser/index.ts',
  output: [{
      name: 'heimdall',
      file: 'dist/heimdalljs.umd.js',
      format: 'umd'
    }, {
      name: 'heimdall',
      file: 'dist/heimdalljs.iife.js',
      format: 'iife'
  }],
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
  ]
};

