import commonjs from 'rollup-plugin-commonjs'
import json from 'rollup-plugin-json'
import resolve from 'rollup-plugin-node-resolve'
import external from 'rollup-plugin-peer-deps-external'
import typescript from 'rollup-plugin-typescript2'
import { readFile } from 'fs/promises'

const pkg = JSON.parse(
  await readFile(
    new URL('./package.json', import.meta.url)
  )
)

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
    external(),
    resolve({ preferBuiltins: true, browser: true }),
    typescript({
      exclude: '__tests__/**',
      clean: true,
    }),
    commonjs(),
  ],
  external: ['readable-stream', 'buffer', 'crypto', 'stream', 'string_decoder', 'axios'],
}
