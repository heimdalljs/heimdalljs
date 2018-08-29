import nodeResolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import replace from 'rollup-plugin-replace';
import typescript from 'rollup-plugin-typescript';

export default {
  input: 'src/runtime/node/index.ts',
  output: [{
      name: 'heimdalljs',
      file: 'dist/heimdalljs.cjs.js',
      format: 'cjs'
    }, {
      name: 'heimdalljs',
      file: 'dist/heimdalljs.es.js',
      format: 'es'
  }],
  plugins: [
    typescript({
      include: [
        'src/**/*'
      ],
      exclude: [
        '../../node_modules/**'
      ]
    }),
    nodeResolve({ jsnext: true, main: true }),
    commonjs({ include: '../../node_modules/**', ignoreGlobal: true }),
    replace({
      VERSION_STRING_PLACEHOLDER: require('./package').version
    }),
  ]
};
