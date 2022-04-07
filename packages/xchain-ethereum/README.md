# `@xchainjs/xchain-ethereum`

## Modules

- `client` - Custom client for communicating with Ethereum by using [`ethers`](https://github.com/ethers-io/ethers.js)

## Installation

```
yarn add @xchainjs/xchain-ethereum
```

Following peer dependencies have to be installed into your project. These are not included in `@xchainjs/xchain-ethereum`.

```
yarn add @xchainjs/xchain-client @xchainjs/xchain-crypto @xchainjs/xchain-util axios ethers
```
## Documentation

[`How it works`](http://docs.xchainjs.org/xchain-client/xchain-ethereum/how-it-works.html)
[`How to use`](http://docs.xchainjs.org/xchain-client/xchain-ethereum/how-to-use.html)


## Service Providers

This package uses the following service providers:

| Function                  | Service   | Notes                                                                          |
| ------------------------- | --------- | ------------------------------------------------------------------------------ |
| ETH balances              | Etherscan | https://etherscan.io/apis#accounts (module=`account`, action=`balance`)        |
| Token balances            | Etherscan | https://etherscan.io/apis#tokens (module=`account`, action=`tokenbalance`)     |
| ETH transaction history   | Etherscan | https://etherscan.io/apis#accounts (module=`account`, action=`txlistinternal`) |
| Token transaction history | Etherscan | https://etherscan.io/apis#accounts (module=`account`, action=`tokentx`)        |
| Transaction fees          | Etherscan | https://etherscan.io/apis#gastracker (module=`gastracker`, action=`gasoracle`) |
| Transaction broadcast     | Etherscan | https://sebs.github.io/etherscan-api/#eth_sendrawtransaction                   |
| Explorer                  | Etherscan | https://etherscan.io/                                                          |

Etherscan API rate limits: https://info.etherscan.com/api-return-errors/

- This package uses `etherjs` library, by default it uses several providers. (`https://docs.ethers.io/v5/api-keys/`)
