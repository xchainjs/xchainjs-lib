# `@xchainjs/xchain-bsc`

## Modules

- `client` - Custom client for communicating with binance smart chain by using [`ethers`](https://github.com/ethers-io/ethers.js)

## Installation

```
yarn add @xchainjs/xchain-bsc
```

Following peer dependencies have to be installed into your project. These are not included in `@xchainjs/xchain-bsc`.

```
yarn add @xchainjs/xchain-evm @xchainjs/xchain-client @xchainjs/xchain-crypto @xchainjs/xchain-util axios ethers
```

## Documentation

### [`xchain bsc`](http://docs.xchainjs.org/xchain-client/xchain-bsc/)

[`How xchain-bsc works`](http://docs.xchainjs.org/xchain-client/xchain-bsc/how-it-works.html)\
[`How to use xchain-bsc`](http://docs.xchainjs.org/xchain-client/xchain-bsc/how-to-use.html)

## Service Providers

This package uses the following service providers:

| Function                  | Service   | Notes                                                                       |
| ------------------------- | --------- | --------------------------------------------------------------------------- |
| BNB balances              | Ankr RPC  | https://rpc.ankr.com/bsc (`ANKR_API_KEY`)                                   |
| Token balances            | Etherscan | https://docs.etherscan.io/api-reference/endpoint/tokenbalance (chainid `56`) |
| BNB transaction history   | Etherscan | https://docs.etherscan.io/api-reference/endpoint/txlist (chainid `56`)      |
| Token transaction history | Etherscan | https://docs.etherscan.io/api-reference/endpoint/tokentx (chainid `56`)     |
| Explorer                  | BscScan   | https://bscscan.com/                                                        |

History and token balances use Etherscan API v2 (`https://api.etherscan.io/v2`). Etherscan API rate limits: https://docs.etherscan.io/resources/rate-limits

- This package uses `etherjs` library, by default it uses several providers. (`https://docs.ethers.io/v5/api-keys/`)

### Environment variables

```sh
ETHERSCAN_API_KEY={YOUR_ETHERSCAN_API_KEY}
ANKR_API_KEY={YOUR_ANKR_API_KEY}
```

Default config can access.

```sh
process.env.ETHERSCAN_API_KEY
process.env.ANKR_API_KEY
```
