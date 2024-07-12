import babel from '@rollup/plugin-babel'
import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import external from 'rollup-plugin-peer-deps-external'
import globals from 'rollup-plugin-node-globals'
import json from 'rollup-plugin-json'
import nodePolyfills from 'rollup-plugin-node-polyfills'
import filesize from 'rollup-plugin-filesize'
import progress from 'rollup-plugin-progress'
import esbuild from 'rollup-plugin-esbuild'
import { typescriptPaths } from 'rollup-plugin-typescript-paths'
import { terser } from "rollup-plugin-terser";
import cleanup from 'rollup-plugin-cleanup';
import replace from 'rollup-plugin-replace'
const extensions = ['.js', '.ts']

export default [
  {
    input: 'src/index.ts',
    output: [
      {
        dir: './dist',
        format: 'umd',
        sourcemap: true,
        name: 'aitmedLvl2SDK',
        exports: 'named',
        globals: {
          '@aitmed/protorepo': 'EcosAPIClientV1Beta1',
          '@babel/runtime/helpers/asyncToGenerator': '_asyncToGenerator',
          '@babel/runtime/helpers/classCallCheck': '_classCallCheck',
          '@babel/runtime/helpers/createClass': '_createClass',
          '@babel/runtime/helpers/defineProperty': '_defineProperty',
          '@babel/runtime/regenerator': '_regeneratorRuntime',
          '@babel/runtime/helpers/slicedToArray': '_slicedToArray',
          '@babel/runtime/helpers/extends': '_extends',
          '@aitmed/protorepo/js/ecos/v1beta1/ecos_api_pb': 'ecos_api_pb',
          '@aitmed/protorepo/js/ecos/v1beta1/types_pb': 'types_pb',
          '@babel/runtime/helpers/assertThisInitialized':
            '_assertThisInitialized',
          '@babel/runtime/helpers/inherits': '_inherits',
          '@babel/runtime/helpers/possibleConstructorReturn':
            '_possibleConstructorReturn',
          '@babel/runtime/helpers/getPrototypeOf': '_getPrototypeOf',
          '@babel/runtime/helpers/wrapNativeSuper': '_wrapNativeSuper',
          axios: 'axios',
          buffer: 'buffer',
          'hash.js': 'hashjs',
          loglevel: 'loglevel',
          tweetnacl: 'tweetnacl',
          'tweetnacl-util': 'tweetnaclUtil',
          yaml: 'YAML',
        },
      },
      {
        file: './dist/index.es.js',
        format: 'esm',
        sourcemap: true,
        name: 'aitmedLvl2SDK',
        exports: 'named',
      }
    ],
    context: 'window',
    plugins: [
      terser(),
      typescriptPaths(),
      filesize(),
      progress(),
      external({
        includeDependencies: true,
      }),
      resolve({
        extensions,
        preferBuiltins: true,
        browser: true,
      }),
      commonjs(),
      globals(),
      nodePolyfills(),
      replace({
        'process.env.NODE_ENV_LVL2': `${JSON.stringify(process.env.NODE_ENV_LVL2)}`,
      }),
      json(),
      babel({
        extensions: ['.js'],
        babelHelpers: 'runtime',
        exclude: 'node_modules/**/*',
        include: ['src/**/*'],
        presets: ['@babel/preset-env'],
        plugins: ['@babel/plugin-transform-runtime'],
      }),
      esbuild({
        exclude: /node_modules/,
        include: /\.ts?$/,
        minify: process.env.NODE_ENV_LVL2 === 'production',
        minifyIdentifiers: false,
        target: 'es2015',
      }),
      cleanup(),
      // injectProcessEnv({ 
      //   NODE_ENV_LVL2: process.env.NODE_ENV_LVL2
      // }),
    ],
  },
  // {
  //   input: 'src/testingPlayground',
  //   output: {
  //     file: 'test_public/bundle.js',
  //     format: 'iife', // immediately-invoked function expression — suitable for <script> tags
  //     sourcemap: true,
  //     name: 'aitmedLvl2SDK',
  //     globals: { buffer: 'Buffer' },
  //   },
  //   plugins: [
  //     resolve({
  //       extensions,
  //       preferBuiltins: false,
  //       jsnext: true,
  //       browser: true,
  //     }), // so Rollup can find `ms`
  //     json(),
  //     commonjs({
  //       include: ['node_modules/**'],
  //     }), // so Rollup can convert `ms` to an ES module
  //     globals(Buffer),
  //     nodePolyfills(Buffer),
  //     babel({
  //       include: ['src/**/*'],
  //       exclude: 'node_modules/**',
  //       runtimeHelpers: true,
  //       extensions,
  //     }),
  //   ],
  // },
]
