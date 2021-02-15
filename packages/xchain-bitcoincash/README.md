# `@xchainjs/xchain-bitcoincash`

## Modules

- `client` - Custom client for communicating with Bitcoin Cash by using [bitcore-lib-cash](https://github.com/bitpay/bitcore/tree/master/packages/bitcore-lib-cash)

## Installation

```
yarn add @xchainjs/xchain-bitcoincash
```

## Service Providers

This package uses the following service providers:

| Function                    | Service        | Notes                                                      |
| --------------------------- | -------------- | ---------------------------------------------------------- |
| Balances                    | Haskoin        | https://api.haskoin.com/#/Address/getBalance               |
| Transaction history         | Haskoin        | https://api.haskoin.com/#/Address/getAddressTxsFull        |
| Transaction details by hash | Haskoin        | https://api.haskoin.com/#/Transaction/getTransaction       |
| Transaction fees            | Bitgo          | https://app.bitgo.com/docs/#operation/v2.tx.getfeeestimate |
| Transaction broadcast       | Haskoin        | https://api.haskoin.com/#/Transaction/postTransaction      |
| Explorer                    | Blockchain.com | https://www.blockchain.com                                 |

Haskoin API rate limits: No
Bitgo API rate limits: https://app.bitgo.com/docs/#section/Rate-Limiting (10 requests/second)
