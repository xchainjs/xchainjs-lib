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
    // ignore(["@ethersproject/providers", "@ethersproject/abstract-provider", "@ethersproject/strings"]),
    external(),
    resolve({ preferBuiltins: true, browser: true }),
    typescript({
      tsconfig: './tsconfig.json',
      exclude: '__tests__/**',
    }),
    commonjs(),
    json(),
  ],
  external: ['buffer', 'http', 'https', 'url', 'stream', 'string_decoder'],
}
