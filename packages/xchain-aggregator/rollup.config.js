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
      inlineDynamicImports: true,
    },
    {
      file: pkg.module,
      format: 'es',
      exports: 'named',
      sourcemap: true,
      inlineDynamicImports: true,
    },
  ],
  plugins: [
    json(),
    resolve({ preferBuiltins: true, browser: true }),
    typescript({
      exclude: '__tests__/**',
      declarationDir: '.',
    }),
    commonjs(),
  ],
  external: Object.keys(pkg.dependencies || {}).concat(Object.keys(pkg.peerDependencies || {})),
}
