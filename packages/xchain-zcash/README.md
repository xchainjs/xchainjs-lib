# `@xchainjs/xchain-zcash`

# **ATTENTION: SUPPORT FOR T-ADDRESSES ONLY**

## Modules

- `client` - Custom client for communicating with Zcash using [BIP39](https://github.com/bitcoinjs/bip39) [zcash wallet js](https://gitlab.com/mayachain/chains/zcash/-/tree/main/js?ref_type=heads) and [WIF](https://github.com/bitcoinjs/wif)

## Installation

```
yarn add @xchainjs/xchain-zcash
```

Following peer dependencies have to be installed into your project. These are not included in `@xchainjs/xchain-doge`.

```
yarn add @xchainjs/xchain-client @xchainjs/xchain-crypto @xchainjs/xchain-util
```

## Service Providers

This package uses the following service providers:

| Function                    | Service     | Notes                                                                            |
| --------------------------- | ----------- | -------------------------------------------------------------------------------- |
| Balances                    | Nownodes    | https://nownodes.gitbook.io/documentation/zec-zcash/blockbook                    |
| Transaction history         | Nownodes    | https://nownodes.gitbook.io/documentation/zec-zcash/blockbook                    |
| Transaction details by hash | Nownodes    | https://nownodes.gitbook.io/documentation/zec-zcash/blockbook                    |
| Transaction fees            | Nownodes    | https://nownodes.gitbook.io/documentation/zec-zcash/blockbook                    |
| Transaction broadcast       | Nownodes    | https://nownodes.gitbook.io/documentation/zec-zcash/blockbook                    |
| Explorer                    | Nownodes    | https://nownodes.gitbook.io/documentation/zec-zcash/blockbook                    |

Nownodes rate limits: https://nownodes.io/pricing

## Overriding providers

You can specify own array of providers, whoch will be executed in array-order, to provide automated failover to the subsequent providers if calls to the first providers fail