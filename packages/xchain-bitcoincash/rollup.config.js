import commonjs from 'rollup-plugin-commonjs'
import json from 'rollup-plugin-json'
import resolve from 'rollup-plugin-node-resolve'
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
    json(),
    typescript({
      exclude: '__tests__/**',
      clean: true,
      browser: true,
    }),
    resolve({ extensions: ['.js', '.ts'], preferBuiltins: true, browser: true }),
    commonjs({
      browser: true,
    }),
  ],
  external: [
    'readable-stream',
    '@psf/bitcoincashjs-lib',
    'bchaddrjs',
    'buffer',
    'stream',
    'string_decoder',
    '@xchainjs/xchain-client',
    'axios',
  ],
}
