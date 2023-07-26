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

| Function                  | Service | Notes                                                                            |
| ------------------------- | ------- | -------------------------------------------------------------------------------- |
| ETH balances              | BscScan | https://api.bscscan.com/api#accounts (module=`account`, action=`balance`)        |
| Token balances            | BscScan | https://api.bscscan.com/api#tokens (module=`account`, action=`tokenbalance`)     |
| ETH transaction history   | BscScan | https://api.bscscan.com/api#accounts (module=`account`, action=`txlistinternal`) |
| Token transaction history | BscScan | https://api.bscscan.com/api#accounts (module=`account`, action=`tokentx`)        |
| Explorer                  | BscScan | https://bscscan.com/                                                             |

BscScan API rate limits: https://bscscan.com/apis

- This package uses `etherjs` library, by default it uses several providers. (`https://docs.ethers.io/v5/api-keys/`)

// set in env variables so default config can access.
`BSCCHAIN_API_KEY={YOURKEY}`

//Default config can access.
process.env["BSCCHAIN_API_KEY"]
