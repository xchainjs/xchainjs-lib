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
    external(),
    resolve({ preferBuiltins: true, browser: true }),
    typescript({
      rollupCommonJSResolveHack: true,
      exclude: '__tests__/**',
      clean: true,
    }),
    commonjs({
      // see: https://github.com/ethers-io/ethers.js/issues/839#issuecomment-630320675
      namedExports: {
        "node_modules/bn.js/lib/bn.js" : ["BN"],
        "node_modules/elliptic/lib/elliptic.js": ["ec"],
        'node_modules/ethers/dist/ethers.esm.js': ['ethers'],
      }
    }),
    json(),
  ],
  external: ['buffer', 'http', 'https', 'url', 'stream', 'string_decoder'],
}
