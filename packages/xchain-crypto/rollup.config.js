import commonjs from '@rollup/plugin-commonjs'
import json from '@rollup/plugin-json'
import resolve from '@rollup/plugin-node-resolve'
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
    resolve({ preferBuiltins: true, browser: true }),
    json(),
    typescript({
      tsconfig: './tsconfig.json',
      exclude: '__tests__/**',
    }),
    commonjs({
      include: /node_modules/,
      exclude: '**/*.json',
    }),
  ],
  external: Object.keys(pkg.dependencies || {}).concat(Object.keys(pkg.peerDependencies || {})),
}
