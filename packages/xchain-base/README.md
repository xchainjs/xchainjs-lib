# `@xchainjs/xchain-base`

## Modules

- `client` - Custom client for communicating with Base by using [`ethers`](https://github.com/ethers-io/ethers.js)

## Installation

```sh
yarn add @xchainjs/xchain-base
```

Following peer dependencies have to be installed into your project. These are not included in `@xchainjs/xchain-base`.

```sh
yarn add @xchainjs/xchain-evm @xchainjs/xchain-client @xchainjs/xchain-crypto @xchainjs/xchain-util axios ethers
```

## Documentation

### [`xchain base`](http://docs.xchainjs.org/xchain-client/xchain-base/)

[`How xchain-base works`](http://docs.xchainjs.org/xchain-client/xchain-base/how-it-works.html)\
[`How to use xchain-base`](http://docs.xchainjs.org/xchain-client/xchain-base/how-to-use.html)

## Service Providers

This package uses the following service providers:

| Function                  | Service   | Notes                                                                              |
| ------------------------- | --------- | ---------------------------------------------------------------------------------- |
| ETH balances              | Basescan | https://api.basescan.org/apis#accounts (module=`account`, action=`balance`)        |
| Token balances            | Basescan | https://api.basescan.org/apis#tokens (module=`account`, action=`tokenbalance`)     |
| ETH transaction history   | Basescan | https://api.basescan.org/apis#accounts (module=`account`, action=`txlistinternal`) |
| Token transaction history | Basescan | https://api.basescan.org/apis#accounts (module=`account`, action=`tokentx`)        |
| Explorer                  | Basescan | https://basescan.org/                                                              |

Etherscan API rate limits: https://docs.basescan.org/support/rate-limits

- This package uses `etherjs` library, by default it uses several providers. (`https://docs.ethers.io/v5/api-keys/`)

// set in env variables so default config can access.
`BASESCAN_API_KEY={YOUR_BASESCAN_API_KEY}`

//Default config can access.
`process.env.BASESCAN_API_KEY`
