import nodeResolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import replace from 'rollup-plugin-replace';
import typescript from 'rollup-plugin-typescript2';

export default {
  input: 'tests/index.ts',
  output: [{
      name: 'heimdall-js',
      file: 'dist/tests/bundle.cjs.js',
      format: 'cjs'
    }, {
      name: 'heimdall-js',
      file: 'dist/tests/bundle.umd.js',
      format: 'umd'
    }, {
      name: 'heimdall-js',
      file: 'dist/tests/bundle.es.js',
      format: 'es'  
  }],
  plugins: [
    typescript({
      include: [
        'src/**/*',
        'tests/**/*'
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
