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
    // ignore(["@ethersproject/providers", "@ethersproject/abstract-provider", "@ethersproject/strings"]),
    external(),
    resolve({ preferBuiltins: true, browser: true }),
    typescript({
      tsconfig: "tsconfig.json",
      exclude: '__tests__/**',
    }),
    commonjs(),
    json(),
  ],
  external: [
    'buffer',
    'http',
    'https',
    'url',
    'stream',
    'string_decoder',
    // Avoid to bundle following libraries which are already part of `ethers`.
    // Also it avoids get Rollup warnings based on these libraries (something like this):
    // ```
    // (!) `this` has been rewritten to `undefined`
    // https://rollupjs.org/guide/en/#error-this-is-undefined
    // node_modules/@ethersproject/providers/lib.esm/base-provider.js
    // ...
    // ...and 8 other files
    // ```
    '@ethersproject/providers',
    '@ethersproject/abstract-provider',
    '@ethersproject/strings',
  ],
}
