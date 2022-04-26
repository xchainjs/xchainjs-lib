import {
  BaseXChainClient,
  Fees,
  Tx,
  TxHash,
  TxHistoryParams,
  TxParams,
  TxsPage,
  XChainClient,
} from '@xchainjs/xchain-client'
import { TxFrom, TxTo, TxType } from '@xchainjs/xchain-client/src'
import { baseAmount } from '@xchainjs/xchain-util/src'

import { getAsset } from './assets'

import { HavenCoreClient } from './haven-core-client'

import { HavenClient } from './types/client-types'

class Client extends BaseXChainClient implements XChainClient, HavenClient {
  protected havenCoreClient = new HavenCoreClient()
  getFees(): Promise<Fees> {
    throw new Error('Method not implemented.')
  }
  getAddress(walletIndex?: number): string {
    throw new Error('Method not implemented.')
  }
  getExplorerUrl(): string {
    throw new Error('Method not implemented.')
  }
  getExplorerAddressUrl(address: string): string {
    throw new Error('Method not implemented.')
  }
  getExplorerTxUrl(txID: string): string {
    throw new Error('Method not implemented.')
  }
  validateAddress(address: string): boolean {
    throw new Error('Method not implemented.')
  }
  async getTransactions(params?: TxHistoryParams): Promise<TxsPage> {
    let transactions = await this.havenCoreClient.getTransactions()

    // filter if we either send or received coins for requested asset
    transactions = params?.asset
      ? transactions.filter((tx, _) => {
          if (tx.from_asset_type == params.asset && baseAmount(tx.fromAmount).gte('0')) {
            return true
          }

          if (tx.to_asset_type == params.asset && baseAmount(tx.toAmount).gte('0')) {
            return true
          }

          return false
        })
      : transactions

    //filter by date
    transactions = params?.startTime
      ? transactions.filter((tx, _) => new Date(tx.timestamp) >= params.startTime!)
      : transactions

    const offset = params?.offset ? params.offset : 0
    const limit = params?.limit ? params.limit + offset : undefined

    // filter by offset/limit
    transactions = limit ? transactions.filter((_, index) => index >= offset && index <= limit) : transactions

    const txs: Tx[] = transactions.map((havenTx, _) => {
      // if we exchanged to ourself in the past with Havens own exchange mechanics, we have an out and incoming tx
      // if request is limited by an asset, we will only take by the one which matches it
      const isOut: boolean =
        baseAmount(havenTx.fromAmount).gte('0') &&
        (params?.asset === undefined || (params?.asset !== undefined && havenTx.from_asset_type == params.asset))

      const isIn: boolean =
        baseAmount(havenTx.toAmount).gte('0') &&
        (params?.asset === undefined || (params?.asset !== undefined && havenTx.to_asset_type == params.asset))

      const from: Array<TxFrom> = isOut
        ? [{ amount: baseAmount(havenTx.fromAmount), asset: getAsset(havenTx.from_asset_type), from: havenTx.hash }]
        : []
      const to: Array<TxTo> = isIn
        ? [{ amount: baseAmount(havenTx.toAmount), asset: getAsset(havenTx.to_asset_type), to: havenTx.hash }]
        : []

      const tx: Tx = {
        hash: havenTx.hash,
        date: new Date(havenTx.timestamp),
        type: isIn && isOut ? TxType.Unknown : TxType.Transfer,
        from,
        to,
        asset: getAsset(havenTx.from_asset_type),
      }

      return tx
    })

    const txPages: TxsPage = {
      txs,
      total: txs.length,
    }
    return txPages
  }
  getTransactionData(txId: string, assetAddress?: string): Promise<Tx> {
    throw new Error('Method not implemented.')
  }
  transfer(params: TxParams): Promise<TxHash> {
    const { amount, asset, recipient, memo } = params
    if (asset === undefined) throw 'please specify asset it in Client.transfer() for Haven'
    const amountString = amount.amount.toString()
    return this.havenCoreClient.transfer(amountString, asset.ticker, recipient, memo)
  }
  isSyncing(): boolean {
    return true
  }
  syncHeight(): number {
    return 0
  }
  blockHeight(): number {
    return 0
  }
}
