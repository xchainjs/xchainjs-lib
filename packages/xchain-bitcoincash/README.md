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

## Service Providers

This package uses the following service providers:

| Function                    | Service           | Notes                                                               |
| --------------------------- | ----------------- | ------------------------------------------------------------------- |
| Balances                    | Haskoin           | https://api.haskoin.com/#/Address/getBalance                        |
| Transaction history         | Haskoin           | https://api.haskoin.com/#/Address/getAddressTxsFull                 |
| Transaction details by hash | Haskoin           | https://api.haskoin.com/#/Transaction/getTransaction                |
| Transaction fees            | Bitgo             | https://app.bitgo.com/docs/#operation/v2.tx.getfeeestimate          |
| Transaction broadcast       | Bitcoin Cash Node | https://developer.bitcoin.org/reference/rpc/sendrawtransaction.html |
| Explorer                    | Blockchain.com    | https://www.blockchain.com                                          |

Haskoin API rate limits: No

Bitgo API rate limits: https://app.bitgo.com/docs/#section/Rate-Limiting (10 requests/second)

## Usage

Initialize client and use class methods:

```
import { Client, Network } from '../src/client'

// Create a new client interface
const bchClient = new Client({ network: 'mainnet' })

// Set phrase
bchClient.setPhrase('phrase here')

// Get address
const address = bchClient.getAddress()

// Get balance
const balance = await bchClient.getBalance()

// Transfer with feeRate
const txid = await bchClient.transfer({ asset: AssetBCH, recipient: 'recipient address here', amount: baseAmount(100, BCH_DECIMAL), feeRate: 1 })

// Transfer with default feeRate (default is `fast`)
const txid = await bchClient.transfer({ asset: AssetBCH, recipient: 'recipient address here', amount: baseAmount(100, BCH_DECIMAL) })

// Get fee estimations
const { fast, fastest, average } = await bchClient.getFees()

// Get feeRate estimations
const { fast, fastest, average } = await bchClient.getFeeRates()

// Search transactions
const transactions = await bchClient.getTransactions({ address: 'address here', limit: 4 })

// Get a transaction with a given txId/hash
const txData = await bchClient.getTransactionData('b660ee07167cfa32681e2623f3a29dc64a089cabd9a3a07dd17f9028ac956eb8')

```
