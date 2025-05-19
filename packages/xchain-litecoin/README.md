# `@xchainjs/xchain-client`

## Modules

- `client` - Custom client for communicating with Litecoin using [BIP39](https://github.com/bitcoinjs/bip39) [bitcoinjs-lib](https://github.com/bitcoinjs/bitcoinjs-lib) and [WIF](https://github.com/bitcoinjs/wif)

## Installation

```
yarn add @xchainjs/xchain-litecoin
```

Following peer dependencies have to be installed into your project. These are not included in `@xchainjs/xchain-litecoin`.

```
yarn add @xchainjs/xchain-client @xchainjs/xchain-crypto @xchainjs/xchain-util axios bitcoinjs-lib wif
```

## Documentation

### [`xchain litecoin`](http://docs.xchainjs.org/xchain-client/xchain-litecoin/)

[`How xchain-litecoin works`](http://docs.xchainjs.org/xchain-client/xchain-litecoin/how-it-works.html)\
[`How to use xchain-litecoin`](http://docs.xchainjs.org/xchain-client/xchain-litecoin/how-to-use.html)

## Service Providers

This package uses the following service providers:

| Function                    | Service     | Notes                                                                            |
| --------------------------- | ----------- | -------------------------------------------------------------------------------- |
| Balances                    | Sochain     | https://sochain.com/api#get-balance                                              |
| Transaction history         | Sochain     | https://sochain.com/api#get-display-data-address, https://sochain.com/api#get-tx |
| Transaction details by hash | Sochain     | https://sochain.com/api#get-tx                                                   |
| Transaction fees            | Bitgo       | https://app.bitgo.com/docs/#operation/v2.tx.getfeeestimate                       |
| Transaction broadcast       | Bitaps      | https://ltc.bitaps.com/broadcast                                                 |
| Explorer                    | Blockstream | https://litecoinblockexplorer.net/                                               |

Sochain API rate limits: https://sochain.com/api#rate-limits (300 requests/minute)

Bitgo API rate limits: https://app.bitgo.com/docs/#section/Rate-Limiting (10 requests/second)

Bitaps API rate limits: Standard limit 15 requests within 5 seconds for a single IP address.

### Setting Headers for Nine Realms endpoints

If you plan on using the publically accessible endpoints provided by Nine Realms(listed below), ensure that you add a valid 'x-client-id' to all requests

- https://midgard.ninerealms.com
- https://haskoin.ninerealms.com (LTC/BCH/LTC)
- https://thornode.ninerealms.com

Example

```typescript
import cosmosclient from '@cosmos-client/core'
import axios from 'axios'
import { register9Rheader } from '@xchainjs/xchain-util'

register9Rheader(axios)
register9Rheader(cosmosclient.config.globalAxios)
```

For a complete example please see this [test](https://github.com/xchainjs/xchainjs-lib/blob/master/packages/xchain-thorchain-amm/__e2e__/wallet.e2e.ts)

### UtxoOnlineDataProviders

## default providers

Creating a no-arg LTC Client will default to the following settings:

```typescript
const defaultLTCParams: UtxoClientParams & {
  nodeUrls: NodeUrls
  nodeAuth?: NodeAuth
} = {
  network: Network.Mainnet,
  phrase: '',
  explorerProviders: explorerProviders,
  dataProviders: [BlockcypherDataProviders],
  rootDerivationPaths: {
    [Network.Mainnet]: `m/84'/2'/0'/0/`,
    [Network.Testnet]: `m/84'/1'/0'/0/`,
    [Network.Stagenet]: `m/84'/2'/0'/0/`,
  },
  feeBounds: {
    lower: LOWER_FEE_BOUND,
    upper: UPPER_FEE_BOUND,
  },
  nodeUrls: {
    [Network.Mainnet]: 'https://litecoin.ninerealms.com',
    [Network.Stagenet]: 'https://litecoin.ninerealms.com',
    [Network.Testnet]: 'https://testnet.ltc.thorchain.info',
  },
}
```

Note: BlockCypher is the default online data provider (to fetch realtime utxos, balances, etc)

## Overriding providers

You can specify own array of providers, whoch will be executed in array-order, to provide automated failover to the subsequent providers if calls to the first providers fail

### example sochain v3, blockcypher backup

```typescript
import { Client, defaultLTCParams, AssetLTC, SochainDataProviders, BlockcypherDataProviders } from '@xchainjs/xchain-litecoin'
import { SochainNetwork,  SochainProvider } from '@xchainjs/xchain-utxo-providers'
import { Network, UtxoClientParams } from '@xchainjs/xchain-client'

// override with your API key
SochainDataProviders[Network.Mainnet].apiKey = 'YOUR_SOCHAIN_API_KEY'

// or set in env variables so default config can access.
`SOCHAIN_API_KEY={YOUR_SOCHAIN_API_KEY}`
`BLOCKCYPHER_API_KEY={YOUR_BLOCKCYPHER_API_KEY}`
//so default config can access.
process.env.BLOCKCYPHER_API_KEY
process.env.SOCHAIN_API_KEY
//overridde the default init params with your onfig
const initParams: UtxoClientParams = {
  ...defaultLTCParams,
  dataProviders: [SochainDataProviders, BlockcypherDataProviders]// use sochain first and blockcypher as fallback
  phrase: process.env.PHRASE,
}
const LTCClient = new Client(sochainParams)

```
