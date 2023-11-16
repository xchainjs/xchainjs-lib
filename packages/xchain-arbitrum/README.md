# `@xchainjs/xchain-arbitrum`

## Modules

- `client` - Custom client for communicating with Arbitrum by using [`ethers`](https://github.com/ethers-io/ethers.js)

## Installation

```sh
yarn add @xchainjs/xchain-arbitrum
```

Following peer dependencies have to be installed into your project. These are not included in `@xchainjs/xchain-arbitrum`.

```sh
yarn add @xchainjs/xchain-evm @xchainjs/xchain-client @xchainjs/xchain-crypto @xchainjs/xchain-util axios ethers
```

## Documentation

### [`xchain arbitrum`](http://docs.xchainjs.org/xchain-client/xchain-arbitrum/)

[`How xchain-arbitrum works`](http://docs.xchainjs.org/xchain-client/xchain-arbitrum/how-it-works.html)\
[`How to use xchain-arbitrum`](http://docs.xchainjs.org/xchain-client/xchain-arbitrum/how-to-use.html)

## Service Providers

This package uses the following service providers:

| Function                  | Service   | Notes                                                                              |
| ------------------------- | --------- | ---------------------------------------------------------------------------------- |
| ETH balances              | Arbirscan | https://api.arbiscan.io/apis#accounts (module=`account`, action=`balance`)        |
| Token balances            | Arbiscan | https://api.arbiscan.io/apis#tokens (module=`account`, action=`tokenbalance`)     |
| ETH transaction history   | Arbiscan | https://api.arbiscan.io/apis#accounts (module=`account`, action=`txlistinternal`) |
| Token transaction history | Arbiscan | https://api.arbiscan.io/apis#accounts (module=`account`, action=`tokentx`)        |
| Explorer                  | Arbiscan | https://arbiscan.io/                                                              |

Etherscan API rate limits: https://arbiscan.io/apis

- This package uses `etherjs` library, by default it uses several providers. (`https://docs.ethers.io/v5/api-keys/`)

// set in env variables so default config can access.
`ARBISCAN_API_KEY={YOUR_ARBISCAN_API_KEY}`

//Default config can access.
process.env.ARBISCAN_API_KEY