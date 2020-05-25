import typescript from 'rollup-plugin-typescript2'
import commonjs from 'rollup-plugin-commonjs'
import external from 'rollup-plugin-peer-deps-external'
import resolve from 'rollup-plugin-node-resolve'
import json from 'rollup-plugin-json'

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
    json({}),
    external(),
    resolve({ preferBuiltins: true, browser: true }),
    typescript({
      rollupCommonJSResolveHack: true,
      exclude: '__tests__/**',
      clean: true,
    }),
    commonjs({
      namedExports: {
        // API of `u2f-api` is defined in `node_modules/u2f-api/lib/u2f-api.js`
        // and re-imported in `node_modules/u2f-api/index.js`
        'node_modules/u2f-api/index.js': [
          'isSupported',
          'ensureSupport',
          'register',
          'sign',
          'ErrorCodes',
          'ErrorNames',
        ],
      },
    }),
  ],
}
