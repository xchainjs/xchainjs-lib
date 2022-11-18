# `@xchainjs/xchain-thorchain-amm`

## Modules

Thorchain AMM module

## Installation

```
yarn add @xchainjs/xchain-thorchain-amm
```

Following peer dependencies have to be installed into your project. These are not included in `@xchainjs/xchain-thorchain-amm`.

```bash
  "dependencies": {
    "@binance-chain/javascript-sdk": "^4.2.0",
    "@cosmos-client/core": "0.45.13",
    "@psf/bitcoincashjs-lib": "^4.0.2",
    "@terra-money/terra.js": "^3.0.2",
    "@xchainjs/xchain-binance": "^5.6.0",
    "@xchainjs/xchain-bitcoin": "^0.20.0",
    "@xchainjs/xchain-bitcoincash": "^0.15.0",
    "@xchainjs/xchain-client": "^0.13.2",
    "@xchainjs/xchain-cosmos": "^0.20.0",
    "@xchainjs/xchain-crypto": "^0.2.6",
    "@xchainjs/xchain-doge": "^0.5.0",
    "@xchainjs/xchain-ethereum": "^0.27.0",
    "@xchainjs/xchain-evm": "^0.1.0",
    "@xchainjs/xchain-avax": "^0.1.0",
    "@xchainjs/xchain-litecoin": "^0.10.5",
    "@xchainjs/xchain-midgard": "0.3.0",
    "@xchainjs/xchain-thorchain": "^0.27.2",
    "@xchainjs/xchain-thorchain-query": "^0.1.8",
    "@xchainjs/xchain-thornode": "^0.1.2",
    "@xchainjs/xchain-util": "^0.11.0",
    "axios": "^0.25.0",
    "axios-retry": "^3.2.5",
    "bchaddrjs": "^0.5.2",
    "bech32": "^2.0.0",
    "bech32-buffer": "^0.2.0",
    "bignumber.js": "^9.0.0",
    "bitcoinjs-lib": "^5.2.0",
    "dotenv": "^16.0.0",
    "coininfo": "^5.1.0",
    "coinselect": "^3.1.12",
    "ethers": "^5.6.6",
    "wif": "^2.0.6"
  }

```

## For live examples

Do Swap: https://replit.com/@thorchain/doSwap-Single \
Add Liquidity: https://replit.com/@thorchain/addLiquidity \
Withdraw liquidity: https://replit.com/@thorchain/removeLiquidity \
Add Savers & withdraw Savers: https://replit.com/@thorchain/saversTs#index.ts

## Documentation

[xchain-thorchain-amm](http://docs.xchainjs.org/xchain-thorchain-amm/) \
[How thorchain-amm works](http://docs.xchainjs.org/xchain-thorchain-amm/how-it-works.html)\
[How to use thorchain-amm](http://docs.xchainjs.org/xchain-thorchain-amm/how-to-use.html)

## Compiler options

tsconfig compiler options

```ts
{
    "compilerOptions": {
        "module":"commonjs",
        "target": "es5",
        "noEmitOnError": true,
        "resolveJsonModule": true,
        "esModuleInterop": true,
        "lib": ["es6", "dom", "es2016", "es2017"]
    }
}
```
