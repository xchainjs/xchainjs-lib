import commonjs from '@rollup/plugin-commonjs'
import json from '@rollup/plugin-json'
import resolve from '@rollup/plugin-node-resolve'
import typescript from 'rollup-plugin-typescript2'
import { visualizer } from 'rollup-plugin-visualizer'

import pkg from './package.json'

const external = (id) => {
  const deps = Object.keys(pkg.dependencies || {}).concat(Object.keys(pkg.peerDependencies || {}));
  return deps.some(dep => id === dep || id.startsWith(`${dep}/`));
};

export default {
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
      file: pkg.exports,
      format: 'es',
      exports: 'named',
      sourcemap: false,
    },
  ],
  plugins: [
    json(),
    typescript({
      exclude: '__tests__/**',
    }),
    resolve({ extensions: ['.js', '.ts'], preferBuiltins: true, browser: true }),
    commonjs({
      browser: true,
    }),
    visualizer({
      filename: 'stats.html',
      gzipSize: true,
      brotliSize: true,
      open: false,
    })
  ],
  external
}
