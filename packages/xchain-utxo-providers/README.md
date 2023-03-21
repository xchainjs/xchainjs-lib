# XChainJS API UTXO providers Interface

A specification for a generalised interface for api providers, to be used by XChainJS implementations. The providers should not have any functionality to generate a key, instead, the `asgardex-crypto` library should be used to ensure cross-chain compatible keystores are handled. The providers is only ever passed a master BIP39 phrase, from which a temporary key and address is decoded.

## Documentation

### [`xchain providers`](http://docs.xchainjs.org/xchain-xchain-utxo-providers/)

[`Overview of xchain-utxo-providers`](http://docs.xchainjs.org/xchain-utxo-providers/overview.html)\
[`Interface of xchain-utxo-providers`](http://docs.xchainjs.org/xchain-utxo-providers/interface.html)

## Design

The UtxoOnlineDataProvider has the following signature:

```typescript
import { Address, Asset } from '@xchainjs/xchain-util'

import { ExplorerProvider } from './explorer-provider'
import { Balance, Network, Tx, TxHash, TxHistoryParams, TxsPage } from './types'

export type Witness = {
  value: number
  script: Buffer
}
export type UTXO = {
  hash: string
  index: number
  value: number
  witnessUtxo: Witness
  txHex?: string
}
export interface OnlineDataProvider {
  getBalance(address: Address, assets?: Asset[]): Promise<Balance[]>
  getTransactions(params: TxHistoryParams): Promise<TxsPage>
  getTransactionData(txId: string, assetAddress?: Address): Promise<Tx>
}
export interface UtxoOnlineDataProvider extends OnlineDataProvider {
  getConfirmedUnspentTxs(address: Address): Promise<UTXO[]>
  getUnspentTxs(address: Address): Promise<UTXO[]>
  broadcastTx(txHex: string): Promise<TxHash>
}
```

## Implementations

### sochain v3

```
Website:          https://sochain.com/api/
Status:           Complete
FreeTier:         No
Chains supported: BTC,BTC-Testnet,LTC,LTC-Testnet,DOGE,DOGE-Testnet
```

### blockcypher

```
Website:         https://www.blockcypher.com/
Status:           Complete
FreeTier:         Yes, rate limited 3 reqs/sec
Chains supported: BTC,BTC-Testnet,LTC,DOGE
```

### haskoin

```
Website:         https://www.haskoin.com/
Status:           Complete
FreeTier:         Yes, rate limit unknown
Chains supported:  BTC,BTC-Testnet,BCH,BCH-Testnet
```
