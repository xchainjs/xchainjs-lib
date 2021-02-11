# `@xchainjs/xchain-bitcoincash`

## Modules

- `client` - Custom client for communicating with Bitcoin Cash by using [bitcore-lib-cash](https://github.com/bitpay/bitcore/tree/master/packages/bitcore-lib-cash)

## Installation

```
yarn add @xchainjs/xchain-bitcoincash
```

## Service Providers

This package uses the following service providers:

| Function                    | Service        | Notes                                                 |
| --------------------------- | -------------- | ----------------------------------------------------- |
| Balances                    | Haskoin        | https://api.haskoin.com/#/Address/getBalance          |
| Transaction history         | Haskoin        | https://api.haskoin.com/#/Address/getAddressTxsFull   |
| Transaction details by hash | Haskoin        | https://api.haskoin.com/#/Transaction/getTransaction  |
| Transaction broadcast       | Haskoin        | https://api.haskoin.com/#/Transaction/postTransaction |
| Explorer                    | Blockchain.com | https://www.blockchain.com                            |
