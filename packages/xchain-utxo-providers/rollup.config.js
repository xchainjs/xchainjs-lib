import commonjs from '@rollup/plugin-commonjs'
import json from '@rollup/plugin-json'
import resolve from '@rollup/plugin-node-resolve'
import external from 'rollup-plugin-peer-deps-external'
import typescript from 'rollup-plugin-typescript2'

import pkg from './package.json'

export default {
  input: 'src/index.ts',
  output: [
    {
      file: pkg.main,
      format: 'cjs',
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
    external(),
    json({}),
    resolve({ preferBuiltins: true, browser: true }),
    typescript({
      tsconfig: 'tsconfig.json',
      exclude: '__tests__/**',
    }),
    commonjs({
      include: /node_modules/,
      exclude: '**/*.json',
    }),
  ],
  external: [
    'readable-stream',
    'axios',
    'buffer',
    'crypto',
    'stream',
    'string_decoder',
    'axios',
    '@supercharge/promise-pool',
    '@xchainjs/xchain-client',
  ],
}
