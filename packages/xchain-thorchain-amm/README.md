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
    "@xchainjs/xchain-client": "^0.13.0",
    "@xchainjs/xchain-cosmos": "^0.20.0",
    "@xchainjs/xchain-crypto": "^0.2.6",
    "@xchainjs/xchain-doge": "^0.5.0",
    "@xchainjs/xchain-ethereum": "^0.27.0",
    "@xchainjs/xchain-evm": "^0.1.0-alpha2",
    "@xchainjs/xchain-avax": "^0.1.0-alpha3",
    "@xchainjs/xchain-litecoin": "^0.10.3",
    "@xchainjs/xchain-midgard": "^0.1.0",
    "@xchainjs/xchain-terra": "^0.3.0",
    "@xchainjs/xchain-thorchain": "^0.26.0",
    "@xchainjs/xchain-thorchain-query": "^0.1.2",
    "@xchainjs/xchain-thornode": "^0.1.0",
    "@xchainjs/xchain-util": "^0.9.0",
    "axios": "^0.27.2",
    "axios-retry": "^3.3.1",
    "bchaddrjs": "^0.5.2",
    "bech32-buffer": "^0.2.0",
    "bitcoinjs-lib": "^6.0.1",
    "dotenv": "^16.0.0",
    "ethers": "^5.6.2"
  }

```

## Examples

## Documentation

[xchain thorchain-amm](http://docs.xchainjs.org/xchain-thorchain-amm/)
[How thorchain-amm works](http://docs.xchainjs.org/xchain-thorchain-amm/how-it-works.html)\
[How to use thorchain-amm](http://docs.xchainjs.org/xchain-thorchain-amm/how-to-use.html)

For live examples
[Do Swap](https://replit.com/@thorchain/doSwap-Single)
[Add Liquidity](https://replit.com/@thorchain/addLiquidity)
[Withdraw liquidity](https://replit.com/@thorchain/removeLiquidity)

##

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
