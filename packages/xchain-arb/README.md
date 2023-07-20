# `@xchainjs/xchain-arb`

## Modules

- `client` - Custom client for communicating with avax by using [`ethers`](https://github.com/ethers-io/ethers.js)

## Installation

```
yarn add @xchainjs/xchain-arb
```

Following peer dependencies have to be installed into your project. These are not included in `@xchainjs/xchain-arb`.

```
yarn add @xchainjs/xchain-evm @xchainjs/xchain-client @xchainjs/xchain-crypto @xchainjs/xchain-util axios ethers
```

## Documentation

### [`xchain arb`](http://docs.xchainjs.org/xchain-client/xchain-arb/)

[`How xchain-arb works`](http://docs.xchainjs.org/xchain-client/xchain-arb/how-it-works.html)\
[`How to use xchain-arb`](http://docs.xchainjs.org/xchain-client/xchain-arb/how-to-use.html)

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
`ARBISCAN_API_KEY={YOURKEY}`

//Default config can access.
process.env["ARBISCAN_API_KEY"]
