# `@xchainjs/xchain-bitcoin`

## Modules

- `client` - Custom client for communicating with Bitcoin using [BIP39](https://github.com/bitcoinjs/bip39) [bitcoinjs-lib](https://github.com/bitcoinjs/bitcoinjs-lib) and [WIF](https://github.com/bitcoinjs/wif)

## Installation

```
yarn add @xchainjs/xchain-bitcoin
```

Following peer dependencies have to be installed into your project. These are not included in `@xchainjs/xchain-bitcoin`.

```
yarn add @xchainjs/xchain-client @xchainjs/xchain-crypto @xchainjs/xchain-util axios bitcoinjs-lib wif
```

## Documentation

### [`xchain bitcoin`](http://docs.xchainjs.org/xchain-client/xchain-bitcoin/)

[`How xchain-bitcoin works`](http://docs.xchainjs.org/xchain-client/xchain-bitcoin/how-it-works.html)\
[`How to use xchain-bitcoin`](http://docs.xchainjs.org/xchain-client/xchain-bitcoin/how-to-use.html)

## Service Providers

This package uses the following service providers:

| Function                    | Service     | Notes                                                                            |
| --------------------------- | ----------- | -------------------------------------------------------------------------------- |
| Balances                    | Sochain     | https://sochain.com/api#get-balance                                              |
| Transaction history         | Sochain     | https://sochain.com/api#get-display-data-address, https://sochain.com/api#get-tx |
| Transaction details by hash | Sochain     | https://sochain.com/api#get-tx                                                   |
| Transaction fees            | Bitgo       | https://app.bitgo.com/docs/#operation/v2.tx.getfeeestimate                       |
| Transaction broadcast       | Sochain     | https://sochain.com/api#send-transaction                                         |
| Explorer                    | Blockstream | https://blockstream.info                                                         |

Sochain API rate limits: https://sochain.com/api#rate-limits (300 requests/minute)

Bitgo API rate limits: https://app.bitgo.com/docs/#section/Rate-Limiting (10 requests/second)

### Setting Headers for Nine Realms endpoints

If you plan on using the publically accessible endpoints provided by Nine Realms(listed below), ensure that you add a valid 'x-client-id' to all requests

- https://midgard.ninerealms.com
- https://haskoin.ninerealms.com (BTC/BCH/LTC)
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

Creating a no-arg BTC Client will default to the following settings:

```typescript
const defaultBTCParams: UtxoClientParams = {
  network: Network.Mainnet,
  phrase: '',
  explorerProviders: blockstreamExplorerProviders,
  dataProviders: [BlockcypherDataProviders],
  rootDerivationPaths: {
    [Network.Mainnet]: `84'/0'/0'/0/`,
    [Network.Testnet]: `84'/1'/0'/0/`,
    [Network.Stagenet]: `84'/0'/0'/0/`,
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
import { Client, defaultBTCParams, AssetBTC, SochainDataProviders, BlockcypherDataProviders } from '@xchainjs/xchain-bitcoin'
import { SochainNetwork,  SochainProvider } from '@xchainjs/xchain-utxo-providers'
import { Network, UtxoClientParams } from '@xchainjs/xchain-client'

// override with your API key
SochainDataProviders[Network.Mainnet].apiKey = 'YOU_SOCHAIN_API_KEY'

//overridde the default init params with your onfig
const initParams: UtxoClientParams = {
  ...defaultBTCParams,
  dataProviders: [SochainDataProviders, BlockcypherDataProviders]// use sochain first and blockcypher as fallback
  phrase: process.env.YOURPHRASE,
}
const btcClient = new Client(sochainParams)

```
