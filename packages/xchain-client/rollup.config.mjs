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
    json(),
    external(),
    typescript({
      tsconfig: './tsconfig.json',
      exclude: '__tests__/**',
    }),
    resolve({ preferBuiltins: true, browser: true }),
    commonjs({
      include: /node_modules/,
      exclude: '**/*.json',
    }),
  ],
  external: ['buffer', 'crypto',],
}
