# `@xchainjs/xchain-doge`

## Modules

- `client` - Custom client for communicating with Doge using [BIP39](https://github.com/bitcoinjs/bip39) [bitcoinjs-lib](https://github.com/bitcoinjs/bitcoinjs-lib) and [WIF](https://github.com/bitcoinjs/wif)

## Installation

```
yarn add @xchainjs/xchain-doge
```

Following peer dependencies have to be installed into your project. These are not included in `@xchainjs/xchain-doge`.

```
yarn add @xchainjs/xchain-client @xchainjs/xchain-crypto @xchainjs/xchain-util axios bitcoinjs-lib coininfo wif
```

## Documentation

### [`xchain doge`](http://docs.xchainjs.org/xchain-client/xchain-doge/)
[`How xchain-doge works`](http://docs.xchainjs.org/xchain-client/xchain-doge/how-it-works.html)\
[`How to use xchain-doge`](http://docs.xchainjs.org/xchain-client/xchain-doge/how-to-use.html)


## Service Providers

This package uses the following service providers:

| Function                    | Service     | Notes                                                                            |
| --------------------------- | ----------- | -------------------------------------------------------------------------------- |
| Balances                    | Sochain     | https://sochain.com/api#get-balance                                              |
| Transaction history         | Sochain     | https://sochain.com/api#get-display-data-address, https://sochain.com/api#get-tx |
| Transaction details by hash | Sochain     | https://sochain.com/api#get-tx                                                   |
| Transaction fees            | BlockCypher | https://api.blockcypher.com/v1/doge/main                                         |
| Transaction broadcast       | BlockCypher | https://api.blockcypher.com/v1/doge/main/txs/push                                |
| Explorer                    | Blockchair  | https://blockchair.com/dogecoin                                                  |

Sochain API rate limits: https://sochain.com/api#rate-limits (300 requests/minute)

BlockCypher API rate limits: https://api.blockcypher.com/v1/doge/main (5 requests/second)
