# `@xchainjs/xchain-client`

## Modules

- `client` - Custom client for communicating with Litecoin using [BIP39](https://github.com/bitcoinjs/bip39) [bitcoinjs-lib](https://github.com/bitcoinjs/bitcoinjs-lib) and [WIF](https://github.com/bitcoinjs/wif)

## Installation

```
yarn add @xchainjs/xchain-client
```

Following peer dependencies have to be installed into your project. These are not included in `@xchainjs/xchain-litecoin`.

```
yarn add @xchainjs/xchain-client @xchainjs/xchain-crypto @xchainjs/xchain-util axios bitcoinjs-lib coininfo wif
```

## Service Providers

This package uses the following service providers:

| Function                    | Service     | Notes                                                                            |
| --------------------------- | ----------- | -------------------------------------------------------------------------------- |
| Balances                    | Sochain     | https://sochain.com/api#get-balance                                              |
| Transaction history         | Sochain     | https://sochain.com/api#get-display-data-address, https://sochain.com/api#get-tx |
| Transaction details by hash | Sochain     | https://sochain.com/api#get-tx                                                   |
| Transaction fees            | Bitgo       | https://app.bitgo.com/docs/#operation/v2.tx.getfeeestimate                       |
| Transaction broadcast       | Bitaps      | https://ltc.bitaps.com/broadcast                                                 |
| Explorer                    | Blockstream | https://blockstream.info                                                         |

Sochain API rate limits: https://sochain.com/api#rate-limits (300 requests/minute)

Bitgo API rate limits: https://app.bitgo.com/docs/#section/Rate-Limiting (10 requests/second)

Bitaps API rate limits: Standard limit 15 requests within 5 seconds for a single IP address.

## Usage

Initialize client and use class methods:

```
import { Client, Network } from '../src/client'

// Create a new client interface
const ltcClient = new Client({ network: 'testnet' })

// Set phrase
ltcClient.setPhrase('phrase here')

// Get address
const address = ltcClient.getAddress()

// Get balance
const balance = await ltcClient.getBalance()

// Transfer with feeRate
const txid = await ltcClient.transfer({ asset: AssetLTC, recipient: 'recipient address here', amount: baseAmount(100, LTC_DECIMAL), feeRate: 1 })

// Transfer with default feeRate (default is `fast`)
const txid = await ltcClient.transfer({ asset: AssetLTC, recipient: 'recipient address here', amount: baseAmount(100, LTC_DECIMAL) })

// Get fee estimations
const { fast, fastest, average } = await ltcClient.getFees()

// Get feeRate estimations
const { fast, fastest, average } = await ltcClient.getFeeRates()

// Search transactions
const transactions = await ltcClient.getTransactions({ address: 'address here', limit: 4 })

// Get a transaction with a given txId/hash
const txData = await ltcClient.getTransactionData('b660ee07167cfa32681e2623f3a29dc64a089cabd9a3a07dd17f9028ac956eb8')

```
