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

### UtxoOnlineDataProviders

## default providers

Creating a no-arg DOGE Client will default to the following settings:

```typescript
const defaultDogeParams: UtxoClientParams = {
  network: Network.Mainnet,
  phrase: '',
  explorerProviders: blockstreamExplorerProviders,
  dataProviders: [blockcypherDataProviders],
  rootDerivationPaths: {
    [Network.Mainnet]: `m/44'/3'/0'/0/`,
    [Network.Stagenet]: `m/44'/3'/0'/0/`,
    [Network.Testnet]: `m/44'/1'/0'/0/`,
  },
  feeBounds: {
    lower: LOWER_FEE_BOUND,
    upper: UPPER_FEE_BOUND,
  },
}
```

Note: BlockCypher is the default online data provider (to fetch realtime utxos, balances, etc)

## Overriding providers

You can specify own array of providers, whoch will be executed in array-order, to provide automated failover to the subsequent providers if calls to the first providers fail

### example sochain v3, blockcypher backup

```typescript
import { Client, defaultDogeParams, AssetDOGE, SochainDataProviders, blockcypherDataProviders } from '@xchainjs/xchain-doge'
import { SochainNetwork,  SochainProvider } from '@xchainjs/xchain-utxo-providers'
import { Network, UtxoClientParams } from '@xchainjs/xchain-client'

// override with your API key
SochainDataProviders[Network.Mainnet].apiKey = 'YOUR_SOCHAIN_API_KEY'

// or set in env variables so default config can access.
`SOCHAIN_API_KEY={YOUR_BLOCKCYPHER_API_KEY}`
`BLOCKCYPHER_API_KEY={YOUR_SOCHAIN_API_KEY}`
//Default config can access.
process.env.BLOCKCYPHER_API_KEY
process.env.SOCHAIN_API_KEY

//overridde the default init params with your onfig
const initParams: UtxoClientParams = {
  ...defaultDogeParams,
  dataProviders: [SochainDataProviders, BlockcypherDataProviders]// use sochain first and blockcypher as fallback
  phrase: process.env.PHRASE,
}
const DOGEClient = new Client(sochainParams)

```
