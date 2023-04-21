import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import json from '@rollup/plugin-json'
import typescript from 'rollup-plugin-typescript2'
import external from 'rollup-plugin-peer-deps-external'

import pkg from './package.json'

export default {
  input: 'src/index.ts',
  output: [
    {
      file: pkg.main,
      format: 'cjs',
      exports: 'named',
      sourcemap: true,
    },
    {
      file: pkg.module,
      format: 'es',
      exports: 'named',
      sourcemap: true,
    },
  ],
  plugins: [
    external(),
    json({}),
    resolve({ preferBuiltins: true, browser: true }),
    typescript({
      // Remove or update options here
      exclude: '__tests__/**',
    }),
    commonjs(),
  ],
  external: ['readable-stream', 'buffer', 'crypto', 'stream', 'string_decoder', 'axios'],
}
