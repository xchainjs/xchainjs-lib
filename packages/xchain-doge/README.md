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

## Usage

Initialize client and use class methods:

```
import { Client, Network } from '../src/client'

// Create a new client interface
const dogeClient = new Client({ network: Network.Testnet })

// Set phrase
dogeClient.setPhrase('phrase here')

// Get address
const address = dogeClient.getAddress()

// Get balance
const balance = await dogeClient.getBalance()

// Transfer with feeRate
const txid = await dogeClient.transfer({ asset: AssetDoge, recipient: 'recipient address here', amount: baseAmount(100, DOGE_DECIMAL), feeRate: 1 })

// Transfer with default feeRate (default is `fast`)
const txid = await dogeClient.transfer({ asset: AssetDoge, recipient: 'recipient address here', amount: baseAmount(100, DOGE_DECIMAL) })

// Get fee estimations
const { fast, fastest, average } = await dogeClient.getFees()

// Get feeRate estimations
const { fast, fastest, average } = await dogeClient.getFeeRates()

// Search transactions
const transactions = await dogeClient.getTransactions({ address: 'address here', limit: 4 })

// Get a transaction with a given txId/hash
const txData = await dogeClient.getTransactionData('b660ee07167cfa32681e2623f3a29dc64a089cabd9a3a07dd17f9028ac956eb8')

```
