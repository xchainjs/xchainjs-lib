import commonjs from '@rollup/plugin-commonjs'
import json from '@rollup/plugin-json'
import resolve from '@rollup/plugin-node-resolve'
import external from 'rollup-plugin-peer-deps-external'
import typescript from 'rollup-plugin-typescript2'

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
    json({}),
    external(),
    resolve({ preferBuiltins: true, browser: true }),
    typescript({
      exclude: '__tests__/**',
    }),
    commonjs(),
  ],
  external: [
    // specify external dependencies that should not be bundled
    '@binance-chain/javascript-sdk',
    '@cosmos-client/core',
    '@psf/bitcoincashjs-lib',
    '@xchainjs/xchain-avax',
    '@xchainjs/xchain-bsc',
    '@xchainjs/xchain-binance',
    '@xchainjs/xchain-bitcoin',
    '@xchainjs/xchain-bitcoincash',
    '@xchainjs/xchain-client',
    '@xchainjs/xchain-cosmos',
    '@xchainjs/xchain-crypto',
    '@xchainjs/xchain-doge',
    '@xchainjs/xchain-ethereum',
    '@xchainjs/xchain-evm',
    '@xchainjs/xchain-litecoin',
    '@xchainjs/xchain-midgard',
    '@xchainjs/xchain-thorchain',
    '@xchainjs/xchain-thorchain-query',
    '@xchainjs/xchain-thornode',
    '@xchainjs/xchain-util',
    '@xchainjs/xchain-utxo-providers',
    'axios',
    'axios-retry',
    'bchaddrjs',
    'bech32',
    'bech32-buffer',
    'bignumber.js',
    'bitcoinjs-lib',
    'dotenv',
    'coininfo',
    'coinselect',
    'ethers',
    'wif',
  ],
}
