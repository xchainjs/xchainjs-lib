# `@xchainjs/xchain-dash`

## Modules

- `client` - Custom client for communicating with Dash using [BIP39](https://github.com/bitcoinjs/bip39), [bitcoinjs-lib](https://github.com/bitcoinjs/bitcoinjs-lib), and [@dashevo/dashcore-lib](https://github.com/dashpay/dashcore-lib)
- `clientKeystore` - Keystore-based client (`Client` default export alias)
- `clientLedger` - Ledger hardware wallet client

## Installation

```
yarn add @xchainjs/xchain-dash
```

Following peer dependencies have to be installed into your project. These are not included in `@xchainjs/xchain-dash`.

```
yarn add @xchainjs/xchain-client @xchainjs/xchain-crypto @xchainjs/xchain-util @xchainjs/xchain-utxo @xchainjs/xchain-utxo-providers axios bitcoinjs-lib
```

## Usage

```typescript
import { Client, defaultDashParams, AssetDASH } from '@xchainjs/xchain-dash'
import { Network } from '@xchainjs/xchain-client'
import { assetToBase, assetAmount } from '@xchainjs/xchain-util'

const client = new Client({
  ...defaultDashParams,
  network: Network.Mainnet,
  phrase: 'your mnemonic phrase',
})

const address = await client.getAddressAsync()
const balances = await client.getBalance(address)

const txHash = await client.transfer({
  asset: AssetDASH,
  recipient: 'X...',
  amount: assetToBase(assetAmount('1', 8)),
})
```

## Service Providers

This package uses the following service providers:

| Function                    | Service     | Notes                                              |
| --------------------------- | ----------- | -------------------------------------------------- |
| Balances / UTXOs            | BlockCypher | https://api.blockcypher.com/v1                     |
| Transaction fees            | BitGo       | https://app.bitgo.com                              |
| Transaction broadcast       | Insight API | https://insight.dash.org/insight-api               |
| Explorer                    | Blockchair  | https://blockchair.com/dash                        |

## Default providers

Creating a no-arg DASH Client will default to the following settings:

```typescript
const defaultDashParams: UtxoClientParams = {
  network: Network.Mainnet,
  phrase: '',
  explorerProviders: explorerProviders,
  dataProviders: [BlockcypherDataProviders, BitgoProviders],
  rootDerivationPaths: {
    [Network.Mainnet]: `m/44'/5'/0'/0/`,
    [Network.Stagenet]: `m/44'/5'/0'/0/`,
    [Network.Testnet]: `m/44'/1'/0'/0/`,
  },
  feeBounds: {
    lower: LOWER_FEE_BOUND,
    upper: UPPER_FEE_BOUND,
  },
  nodeUrls: {
    [Network.Mainnet]: 'https://insight.dash.org/insight-api',
    [Network.Stagenet]: 'https://insight.dash.org/insight-api',
    [Network.Testnet]: 'http://insight.testnet.networks.dash.org:3001/insight-api',
  },
}
```

Note: BlockCypher is the default online data provider (to fetch realtime UTXOs, balances, etc), with BitGo as a secondary provider.

## Overriding providers

You can specify your own array of providers, which will be executed in array order, to provide automated failover to subsequent providers if calls to the first providers fail.

```typescript
import { Client, defaultDashParams, BlockcypherDataProviders, BitgoProviders } from '@xchainjs/xchain-dash'
import { Network, UtxoClientParams } from '@xchainjs/xchain-client'

// or set in env variables so default config can access.
// `BLOCKCYPHER_API_KEY={YOUR_BLOCKCYPHER_API_KEY}`
// process.env.BLOCKCYPHER_API_KEY

const initParams: UtxoClientParams = {
  ...defaultDashParams,
  dataProviders: [BlockcypherDataProviders, BitgoProviders],
  phrase: process.env.PHRASE,
}
const dashClient = new Client(initParams)
```

## Documentation

More information about XChainJS clients can be found on [documentation](https://xchainjs.gitbook.io/xchainjs)
