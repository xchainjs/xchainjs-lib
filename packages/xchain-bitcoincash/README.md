# `@xchainjs/xchain-bitcoincash`

## Modules

- `client` - Custom client for communicating with Bitcoin Cash by using [@psf/bitcoincashjs-lib](https://www.npmjs.com/package/@psf/bitcoincashjs-lib)

## Installation

```
yarn add @xchainjs/xchain-bitcoincash
```

Following peer dependencies have to be installed into your project. These are not included in `@xchainjs/xchain-bitcoincash`.

```
yarn add @xchainjs/xchain-client @xchainjs/xchain-crypto @xchainjs/xchain-util axios @psf/bitcoincashjs-lib bchaddrjs
```

## Documentation

### [`xchain bitcoincash`](http://docs.xchainjs.org/xchain-client/xchain-bitcoincash/)
[`How xchain-bitcoincash works`](http://docs.xchainjs.org/xchain-client/xchain-bitcoincash/how-it-works.html)\
[`How to use xchain-bitcoincash`](http://docs.xchainjs.org/xchain-client/xchain-bitcoincash/how-to-use.html)


## Service Providers

This package uses the following service providers:

| Function                    | Service           | Notes                                                               |
| --------------------------- | ----------------- | ------------------------------------------------------------------- |
| Balances                    | Haskoin           | https://api.haskoin.com/#/Address/getBalance                        |
| Transaction history         | Haskoin           | https://api.haskoin.com/#/Address/getAddressTxsFull                 |
| Transaction details by hash | Haskoin           | https://api.haskoin.com/#/Transaction/getTransaction                |
| Transaction fees            | Bitgo             | https://app.bitgo.com/docs/#operation/v2.tx.getfeeestimate          |
| Transaction broadcast       | Bitcoin Cash Node | https://developer.bitcoin.org/reference/rpc/sendrawtransaction.html |
| Explorer                    | Blockchain.com    | https://www.blockchain.com/explorer?view=bch                                          |

Haskoin API rate limits: No

Bitgo API rate limits: https://app.bitgo.com/docs/#section/Rate-Limiting (10 requests/second)


## Extras
