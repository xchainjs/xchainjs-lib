import commonjs from 'rollup-plugin-commonjs'
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
    resolve({ preferBuiltins: true, browser: true }),
    typescript({
      exclude: '__tests__/**',
      clean: true,
    }),
    commonjs(),
  ],
}
