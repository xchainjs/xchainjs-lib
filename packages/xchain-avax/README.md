# `@xchainjs/xchain-avax`

## Modules

- `client` - Custom client for communicating with avax by using [`ethers`](https://github.com/ethers-io/ethers.js)

## Installation

```
yarn add @xchainjs/xchain-avax
```

Following peer dependencies have to be installed into your project. These are not included in `@xchainjs/xchain-avax`.

```
yarn add @xchainjs/xchain-evm @xchainjs/xchain-client @xchainjs/xchain-crypto @xchainjs/xchain-util axios ethers
```

## Documentation

### [`xchain avax`](http://docs.xchainjs.org/xchain-client/xchain-avax/)

[`How xchain-avax works`](http://docs.xchainjs.org/xchain-client/xchain-avax/how-it-works.html)\
[`How to use xchain-avax`](http://docs.xchainjs.org/xchain-client/xchain-avax/how-to-use.html)

## Service Providers

This package uses the following service providers:

| Function                  | Service   | Notes                                                                              |
| ------------------------- | --------- | ---------------------------------------------------------------------------------- |
| ETH balances              | Etherscan | https://api.snowtrace.io/apis#accounts (module=`account`, action=`balance`)        |
| Token balances            | Etherscan | https://api.snowtrace.io/apis#tokens (module=`account`, action=`tokenbalance`)     |
| ETH transaction history   | Etherscan | https://api.snowtrace.io/apis#accounts (module=`account`, action=`txlistinternal`) |
| Token transaction history | Etherscan | https://api.snowtrace.io/apis#accounts (module=`account`, action=`tokentx`)        |
| Explorer                  | Etherscan | https://snowtrace.io/                                                              |

Etherscan API rate limits: https://snowtrace.io/apis

- This package uses `etherjs` library, by default it uses several providers. (`https://docs.ethers.io/v5/api-keys/`)

// set in env variables so default config can access.
`SNOWTRACE_API_KEY={YOURKEY}`

//Default config can access.
process.env["SNOWTRACE_API_KEY"]
