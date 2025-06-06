# `@xchainjs/xchain-xrp`

XRP module for XChainJS clients

## Modules

- `client` - Custom client for communicating with the XRP Ledger using the [rippled API](https://xrpl.org/rippled-api.html)
- `types` - TypeScript type definitions used by the client, extending types from `@xchainjs/xchain-client` and `@xchainjs/xchain-util`

## Installation

```
yarn add @xchainjs/xchain-xrp
```

## Create a new account

```
import { generateMnemonic } from 'bip39'
import { Client, defaultXRPParams } from '@xchainjs/xchain-xrp'

const mnemonic = generateMnemonic()
const params = {
  ...defaultXRPParams,
  phrase: mnemonic,
}
const client = new Client(params)
const address = client.getAddress()
```

## Fund an account in testnet

```
yarn fund account_address
```

## Examples

### Creating an XRP client

```
import { Network, XChainClientParams } from '@xchainjs/xchain-client'
import { Client } from '@xchainjs/xchain-xrp'

const phrase = 'rural bright ball negative already grass good grant nation screen model pizza'
const params: XChainClientParams = {
  network: Network.Testnet,
  phrase: phrase,
  feeBounds: { lower: 10, upper: 1000000 },
}
const client = new Client(params)
console.log(client.getAssetInfo())
```

### Creating a transaction

Two methods for transactions: `prepareTx` and `transfer`. The first creates a raw unsigned transaction; the second submits it to the ledger.

#### prepareTx

```
import { Network, TxParams, XChainClientParams } from '@xchainjs/xchain-client'
import { Client, AssetXRP } from '@xchainjs/xchain-xrp'
import { baseAmount } from '@xchainjs/xchain-util'

const phrase = 'rural bright ball negative already grass good grant nation screen model pizza'
const params: XChainClientParams = {
  network: Network.Testnet,
  phrase: phrase,
  feeBounds: { lower: 10, upper: 1000000 },
}

async function main() {
  const client = new Client(params)

  const txParams: TxParams = {
    asset: AssetXRP,
    amount: baseAmount(1000000), // 1 XRP in drops
    recipient: 'r4bM9Yyz6JHH3oG4qM33Zq2H4kNA5x5X5X',
    memo: 'test',
  }
  const preparedTx = await client.prepareTx(txParams)
  console.log(preparedTx)
}

main().catch(console.error)
```

#### transfer

```
import { Network, TxParams, XChainClientParams } from '@xchainjs/xchain-client'
import { Client, AssetXRP } from '@xchainjs/xchain-xrp'
import { baseAmount } from '@xchainjs/xchain-util'

const phrase = 'rural bright ball negative already grass good grant nation screen model pizza'
const params: XChainClientParams = {
  network: Network.Testnet,
  phrase: phrase,
  feeBounds: { lower: 10, upper: 1000000 },
}

async function main() {
  const client = new Client(params)

  const txParams: TxParams = {
    asset: AssetXRP,
    amount: baseAmount(1000000), // 1 XRP in drops
    recipient: 'r4bM9Yyz6JHH3oG4qM33Zq2H4kNA5x5X5X',
    memo: 'test',
  }
  const transactionId = await client.transfer(txParams)
  console.log(transactionId)
}

main().catch(console.error)
```

### Getting transaction data

```
import { Network, Tx, TxParams, XChainClientParams } from '@xchainjs/xchain-client'
import { Client, AssetXRP } from '@xchainjs/xchain-xrp'
import { baseAmount } from '@xchainjs/xchain-util'

const phrase = 'rural bright ball negative already grass good grant nation screen model pizza'
const params: XChainClientParams = {
  network: Network.Mainnet,
  phrase: phrase,
}
const client = new Client(params)

const txParams: TxParams = {
  asset: AssetXRP,
  amount: baseAmount(1000000), // 1 XRP in drops
  recipient: 'r4bM9Yyz6JHH3oG4qM33Zq2H4kNA5x5X5X',
}
const transferTransaction = await client.transfer(txParams)
const transaction: Tx = await client.getTransactionData(transferTransaction)
console.log(transaction)
```

### Getting balances

```
import { Balance, Network, XChainClientParams } from '@xchainjs/xchain-client'
import { Client, AssetXRP } from '@xchainjs/xchain-xrp'
import { Asset } from '@xchainjs/xchain-util'

const phrase = 'rural bright ball negative already grass good grant nation screen model pizza'
const params: XChainClientParams = {
  network: Network.Testnet,
  phrase: phrase,
  feeBounds: { lower: 10, upper: 1000000 },
}
const client = new Client(params)
const assets: Asset[] = [AssetXRP]
const balances: Balance[] = await client.getBalance('r4bM9Yyz6JHH3oG4qM33Zq2H4kNA5x5X5X', assets)
console.log(balances)
```

### Getting fees

```
import { Fees, Network, XChainClientParams } from '@xchainjs/xchain-client'
import { Client } from '@xchainjs/xchain-xrp'

const phrase = 'rural bright ball negative already grass good grant nation screen model pizza'
const params: XChainClientParams = {
  network: Network.Testnet,
  phrase: phrase,
  feeBounds: { lower: 10, upper: 1000000 },
}
const client = new Client(params)
const fees: Fees = await client.getFeeRates()
console.log(fees)
```

### Getting transaction history

```
import { Network, XChainClientParams } from '@xchainjs/xchain-client'
import { Client } from '@xchainjs/xchain-xrp'

const phrase = 'rural bright ball negative already grass good grant nation screen model pizza'
const params: XChainClientParams = {
  network: Network.Testnet,
  phrase: phrase,
  feeBounds: { lower: 10, upper: 1000000 },
}
const client = new Client(params)

const transactionsHistoryParams = {
  address: 'r4bM9Yyz6JHH3oG4qM33Zq2H4kNA5x5X5X',
  offset: 0,
  limit: 200,
  asset: 'XRP',
}
const txs = await client.getTransactions(transactionsHistoryParams)
console.log(txs)
```

## Service Providers

| Function                    | Service       | Notes                                                                      | Rate Limits             |
| --------------------------- | ------------- | -------------------------------------------------------------------------- | ----------------------- |
| Balances                    | XRPL Node     | https://xrpl.org/account_info.html                                         | Varies by node provider |
| Transaction history         | XRPL Node     | https://xrpl.org/account_tx.html                                           | Varies by node provider |
| Transaction details by hash | XRPL Node     | https://xrpl.org/tx.html                                                   | Varies by node provider |
| Fees                        | XRPL Node     | https://xrpl.org/fee.html                                                  | Varies by node provider |
| Transaction broadcast       | XRPL Node     | https://xrpl.org/submit.html                                               | Varies by node provider |
| Transfer                    | XRPL Node     | https://xrpl.org/submit.html                                               | Varies by node provider |
| Explorer                    | XRPL Explorer | https://livenet.xrpl.org/ (Mainnet) or https://testnet.xrpl.org/ (Testnet) | None                    |
