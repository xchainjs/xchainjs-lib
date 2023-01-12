import commonjs from '@rollup/plugin-commonjs'
import json from '@rollup/plugin-json'
import resolve from '@rollup/plugin-node-resolve'
import typescript from '@rollup/plugin-typescript'
import { readFileSync } from 'fs'
import peerDepsExternal from 'rollup-plugin-peer-deps-external'

const pkg = JSON.parse(readFileSync(new URL('./package.json', import.meta.url)))

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
    json({}),
    peerDepsExternal(),
    resolve({ preferBuiltins: true, browser: true }),
    typescript({
      exclude: '__tests__/**',
    }),
    commonjs(),
  ],
  external: ['readable-stream', 'buffer', 'crypto', 'stream', 'string_decoder', 'axios'],
}
