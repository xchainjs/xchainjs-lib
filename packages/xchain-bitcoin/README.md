# `@xchainjs/xchain-client`

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

## Usage

Initialize client and use class methods:

```

import { Client, Network } from '../src/client'

// Create a new client interface
const btcClient = await Client.create({ network: 'mainnet', nodeUrl: 'https://sochain.com/api/v2' })

// Set phrase
await btcClient.setPhrase('phrase here')

// Get address
const address = await btcClient.getAddress()

// Get balance
const balance = await btcClient.getBalance()

// Transfer with feeRate
const txid = await btcClient.transfer({ asset: AssetBTC, recipient: 'recipient address here', amount: baseAmount(100, BTC_DECIMAL), feeRate: 1 })

// Transfer with default feeRate (default is `fast`)
const txid = await btcClient.transfer({ asset: AssetBTC, recipient: 'recipient address here', amount: baseAmount(100, BTC_DECIMAL) })

// Get fee estimations
const { fast, fastest, average } = await btcClient.getFees()

// Get feeRate estimations
const { fast, fastest, average } = await btcClient.getFeeRates()

// Search transactions
const transactions = await btcClient.getTransactions({ address: 'address here', limit: 4 })

// Get a transaction with a given txId/hash
const txData = await btcClient.getTransactionData('b660ee07167cfa32681e2623f3a29dc64a089cabd9a3a07dd17f9028ac956eb8')

```

```

```
