# `@xchainjs/xchain-avax`

## Modules

- `client` - Custom client for communicating with avax by using [`ethers`](https://github.com/ethers-io/ethers.js)

## Installation

```sh
yarn add @xchainjs/xchain-avax
```

or

```sh
npm install @xchainjs/xchain-avax
```

Following peer dependencies have to be installed into your project. These are not included in `@xchainjs/xchain-avax`.

```sh
yarn add @xchainjs/xchain-evm @xchainjs/xchain-client @xchainjs/xchain-crypto @xchainjs/xchain-util axios ethers
```

## Documentation

### [`xchain avax`](http://docs.xchainjs.org/xchain-client/xchain-avax/)

[`How xchain-avax works`](http://docs.xchainjs.org/xchain-client/xchain-avax/how-it-works.html)\
[`How to use xchain-avax`](http://docs.xchainjs.org/xchain-client/xchain-avax/how-to-use.html)

## Service Providers

This package uses the following service providers:

| Function                  | Service   | Notes                                                                          |
| ------------------------- | --------- | ------------------------------------------------------------------------------ |
| AVAX balances             | Public RPC, or Ankr | https://api.avax.network/ext/bc/C/rpc, or https://rpc.ankr.com/avalanche when `ANKR_API_KEY` is set |
| Token balances            | Etherscan | https://docs.etherscan.io/api-reference/endpoint/tokenbalance (chainid `43114`) |
| AVAX transaction history  | Etherscan | https://docs.etherscan.io/api-reference/endpoint/txlist (chainid `43114`)      |
| Token transaction history | Etherscan | https://docs.etherscan.io/api-reference/endpoint/tokentx (chainid `43114`)     |
| Explorer                  | Snowtrace | https://snowtrace.dev/                                                         |

History and token balances use Etherscan API v2 (`https://api.etherscan.io/v2`). Routescan is also registered. Etherscan API rate limits: https://docs.etherscan.io/resources/rate-limits

- This package uses `etherjs` library, by default it uses several providers. (`https://docs.ethers.io/v5/api-keys/`)

### Environment Variables


```sh
ETHERSCAN_API_KEY={YOUR_ETHERSCAN_API_KEY}
ANKR_API_KEY={YOUR_ANKR_API_KEY}
```

Default config can access.

```sh
process.env.ETHERSCAN_API_KEY
process.env.ANKR_API_KEY
```

