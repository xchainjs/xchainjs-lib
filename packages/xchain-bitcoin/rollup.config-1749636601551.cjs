'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var commonjs = require('@rollup/plugin-commonjs');
var json = require('@rollup/plugin-json');
var resolve = require('@rollup/plugin-node-resolve');
var typescript = require('rollup-plugin-typescript2');
var rollupPluginVisualizer = require('rollup-plugin-visualizer');
var pkg = require('./package.json');

const external = (id) => {
  const deps = Object.keys(pkg.dependencies || {}).concat(Object.keys(pkg.peerDependencies || {}));
  return deps.some(dep => id === dep || id.startsWith(`${dep}/`));
};

var rollup_config = {
  input: 'src/index.ts',
  output: [
    {
      file: pkg.main,
      format: 'cjs',
      interop: 'auto',
      exports: 'named',
      sourcemap: false,
    },
    {
      file: pkg.module,
      format: 'es',
      exports: 'named',
      sourcemap: false,
    },
  ],
  plugins: [
    json({}),
    resolve({ preferBuiltins: true, browser: true }),
    typescript({
      exclude: '__tests__/**',
    }),
    commonjs(),
    rollupPluginVisualizer.visualizer({
      filename: 'stats.html',
      gzipSize: true,
      brotliSize: true,
      open: false,
    })
  ],
  external
};

exports.default = rollup_config;
