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
  onwarn: (warning, warn) => {
    // Ignore circular dependency warnings
    if (warning.code === 'CIRCULAR_DEPENDENCY') return;
  },
  plugins: [
    json({}),
    external(),
    resolve({ preferBuiltins: true, browser: true }),
    typescript({
      exclude: '__tests__/**',
    }),
    commonjs({
      exclude: '**/*.json',
    }),

  ],
  external: ['readable-stream', 'axios', 'buffer', 'crypto', 'stream', 'string_decoder',]
}
