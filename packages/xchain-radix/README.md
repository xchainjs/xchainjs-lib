# `@xchainjs/xchain-radix`

Radix module for XChainJS clients

## Modules

- `client` - Custom client for communicating with the Radix Chain by using the [radix-engine-toolkit](https://github.com/radixdlt/typescript-radix-engine-toolkit/tree/main) and the [radix gateway api](https://radix-babylon-gateway-api.redoc.ly/)

- `types` - Typescript type defintions used by the client on top of the types defined by the [Typescript Gateway API SDK](https://www.npmjs.com/package/@radixdlt/babylon-gateway-api-sdk)

## Installation

```
yarn add @xchainjs/xchain-radix
```

## Fund an account in testnet

```
yarn fund account_address
```

## Examples

### Creating a radix client

```
import { Network, XChainClientParams } from '@xchainjs/xchain-client'
import { Client } from '@xchainjs/xchain-radix'

const phrase = 'rural bright ball negative already grass good grant nation screen model pizza'
const params: XChainClientParams = {
  network: Network.Testnet,
  phrase: phrase,
  feeBounds: { lower: 1, upper: 5 },
}
const client = new Client(params, 'Ed25519')
console.log(client.getAssetInfo())
```

### Creating a transaction

There are two methods related to creating transactions: prepareTx and transfer
The first one creates a raw unsigned transaction (it doesn't submit the transaction). The
second one submits the transaction to the ledger

#### prepareTx

```
import { Network, TxParams, XChainClientParams } from '@xchainjs/xchain-client'
import { Client, XrdAssetStokenet } from '@xchainjs/xchain-radix'
import { baseAmount } from '@xchainjs/xchain-util/lib'

const phrase = 'rural bright ball negative already grass good grant nation screen model pizza'
const params: XChainClientParams = {
  network: Network.Testnet,
  phrase: phrase,
  feeBounds: { lower: 1, upper: 5 },
}

async function main() {
  const client = new Client(params, 'Ed25519')

  const txParams: TxParams = {
    asset: XrdAssetStokenet,
    amount: baseAmount(1),
    recipient: 'account_tdx_2_129wjagjzxltd0clr3q4z7hqpw5cc7weh9trs4e9k3zfwqpj636e5zf',
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
import { Client, XrdAssetStokenet } from '@xchainjs/xchain-radix'
import { baseAmount } from '@xchainjs/xchain-util/lib'

const phrase = 'rural bright ball negative already grass good grant nation screen model pizza'
const params: XChainClientParams = {
  network: Network.Testnet,
  phrase: phrase,
  feeBounds: { lower: 1, upper: 5 },
}

async function main() {
  const client = new Client(params, 'Ed25519')

  const txParams: TxParams = {
    asset: XrdAssetStokenet,
    amount: baseAmount(1),
    recipient: 'account_tdx_2_129wjagjzxltd0clr3q4z7hqpw5cc7weh9trs4e9k3zfwqpj636e5zf',
    memo: 'test',
  }
  const transactionId = await client.transfer(txParams)
  console.log(transactionId)
}

main().catch(console.error)
```

### Getting a transaction data

```
import { Network, Tx, TxParams, XChainClientParams } from '@xchainjs/xchain-client/lib'
import { Client } from '@xchainjs/xchain-radix'
import { XrdAsset } from '@xchainjs/xchain-radix/src/const'
import { baseAmount } from '@xchainjs/xchain-util'

const phrase = 'rural bright ball negative already grass good grant nation screen model pizza'
const params: XChainClientParams = {
  network: Network.Mainnet,
  phrase: phrase,
}
const client = new Client(params, 'Ed25519')

const txParams: TxParams = {
  asset: XrdAsset,
  amount: baseAmount(1000),
  recipient: 'account_rdx169yt0y36etavnnxp4du5ekn7qq8thuls750q6frq5xw8gfq52dhxhg',
}
const transferTransaction = await radixClient.transfer(txParams)
const transaction: Tx = await radixClient.getTransactionData(transferTransaction)
console.log(transaction)
```

### Getting balances

```
import { Balance, Network, XChainClientParams } from '@xchainjs/xchain-client/lib'
import { Client } from '@xchainjs/xchain-radix'
import { Asset } from '@xchainjs/xchain-util/lib'

const phrase = 'rural bright ball negative already grass good grant nation screen model pizza'
const params: XChainClientParams = {
  network: Network.Testnet,
  phrase: phrase,
  feeBounds: { lower: 1, upper: 5 },
}
const assets: Asset[] = [
  {
    symbol: 'resource_rdx1tknxxxxxxxxxradxrdxxxxxxxxx009923554798xxxxxxxxxradxrd',
    ticker: 'resource_rdx1tknxxxxxxxxxradxrdxxxxxxxxx009923554798xxxxxxxxxradxrd',
    chain: 'radix',
    synth: false,
  },
]
const balances: Balance[] = await radixClient.getBalance(
  'account_rdx16x47guzq44lmplg0ykfn2eltwt5wweylpuupstsxnfm8lgva7tdg2w',
  assets,
)
console.log(balances)
```

### Getting fees

```
import { Fees, Network, XChainClientParams } from '@xchainjs/xchain-client/lib'
import { Client } from '@xchainjs/xchain-radix'

const phrase = 'rural bright ball negative already grass good grant nation screen model pizza'
const params: XChainClientParams = {
  network: Network.Testnet,
  phrase: phrase,
  feeBounds: { lower: 1, upper: 5 },
}
const client = new Client(params, 'Ed25519')
const fees: Fees = await radixClient.getFees()
console.log(fees)
```

### Getting transactions history

```
import { Network, XChainClientParams } from '@xchainjs/xchain-client/lib'
import { Client } from '@xchainjs/xchain-radix'

const phrase = 'rural bright ball negative already grass good grant nation screen model pizza'
const params: XChainClientParams = {
  network: Network.Testnet,
  phrase: phrase,
  feeBounds: { lower: 1, upper: 5 },
}
const client = new Client(params, 'Ed25519')

const transactionsHistoryParams = {
  address: 'account_rdx169yt0y36etavnnxp4du5ekn7qq8thuls750q6frq5xw8gfq52dhxhg',
  offset: 72533720,
  limit: 200,
  asset: 'resource_rdx1tknxxxxxxxxxradxrdxxxxxxxxx009923554798xxxxxxxxxradxrd',
}
const txs = await (await radixClient.getTransactions(transactionsHistoryParams)).txs
console.log(txs)
```

## Service providers

This package uses the following service providers

| Function                    | Service               | Notes                                                                             | Rate limits              |
| --------------------------- | --------------------- | --------------------------------------------------------------------------------- | ------------------------ |
| Balances                    | Radix Network Gateway | https://radix-babylon-gateway-api.redoc.ly/#operation/StateEntityDetails          | 1550 requests per minute |
| Transaction history         | Radix Network Gateway | https://radix-babylon-gateway-api.redoc.ly/#operation/StreamTransactions          | 1550 requests per minute |
| Transaction details by hash | Radix Network Gateway | https://radix-babylon-gateway-api.redoc.ly/#operation/TransactionCommittedDetails | 1550 requests per minute |
| Fees                        | Radix Network Gateway | https://radix-babylon-gateway-api.redoc.ly/#operation/TransactionPreview          | 1550 requests per minute |
| Transaction broadcast       | Radix Network Gateway | https://radix-babylon-gateway-api.redoc.ly/#operation/TransactionSubmit           | 1550 requests per minute |
| Transfer                    | Radix Network Gateway | https://radix-babylon-gateway-api.redoc.ly/#operation/TransactionSubmit           | 1550 requests per minute |
| Explorer                    | Dashboard             | https://dashboard.radixdlt.com/                                                   |                          |
