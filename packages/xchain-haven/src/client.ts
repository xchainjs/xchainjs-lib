import {
  Balance,
  BaseXChainClient,
  Fees,
  Network,
  Tx,
  TxFrom,
  TxHash,
  TxHistoryParams,
  TxParams,
  TxTo,
  TxType,
  TxsPage,
  XChainClient,
  XChainClientParams,
} from '@xchainjs/xchain-client'
import { Asset, AssetBTC, Chain, assetFromString, baseAmount } from '@xchainjs/xchain-util'

import { HavenCoreClient } from './haven/haven-core-client'
import { HavenBalance, HavenTicker } from './haven/types'
import { HavenClient } from './types/client-types'

class Client extends BaseXChainClient implements XChainClient, HavenClient {
  protected havenCoreClient: HavenCoreClient
  constructor(chain: Chain, params: XChainClientParams) {
    super(chain, params)
    this.havenCoreClient = new HavenCoreClient()
    this.havenCoreClient.init(params.phrase!, params.network!)
  }

  getFees(): Promise<Fees> {
    throw new Error('Method not implemented.')
  }
  getAddress(_walletIndex?: number): string {
    throw new Error('please use getAddressAsync')
  }
  async getAddressAsync(_walletIndex?: number): Promise<string> {
    throw new Error('please use getAddressAsync')
  }
  getExplorerUrl(): string {
    const explorerLink = `https://explorer${
      this.network === Network.Mainnet ? '' : '-' + this.network
    }.havenprotocol.org`
    return explorerLink
  }
  getExplorerAddressUrl(_address: string): string {
    throw new Error('cannot lookup addresses in explorer for haven')
  }
  getExplorerTxUrl(txID: string): string {
    return this.getExplorerUrl() + `/tx/${txID}`
  }
  async getBalance(_address: string, assets?: Asset[]): Promise<Balance[]> {
    const havenBalance: HavenBalance = await this.havenCoreClient.getBalance()

    //TODO return all asset balances when no assets param provided?
    const balances: Balance[] = []

    if (assets) {
      assets.forEach((asset) => {
        const assetBalance: Balance = {
          asset,
          amount: baseAmount(havenBalance[asset.ticker as HavenTicker].balance, 12),
        }
        balances.push(assetBalance)
      })
    }

    return balances
  }

  validateAddress(_address: string): boolean {
    throw new Error('Method not implemented.')
  }
  async getTransactions(params?: TxHistoryParams): Promise<TxsPage> {
    const asset: Asset = params?.asset ? assetFromString(params.asset)! : AssetBTC
    const ticker = asset.ticker
    let transactions = await this.havenCoreClient.getTransactions()
    // filter if we either send or received coins for requested asset
    transactions = ticker
      ? transactions.filter((tx, _) => {
          if (tx.from_asset_type == ticker && baseAmount(tx.fromAmount, 12).gte('0')) {
            return true
          }

          if (tx.to_asset_type == ticker && baseAmount(tx.toAmount, 12).gte('0')) {
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
        baseAmount(havenTx.fromAmount, 12).gte('0') &&
        (params?.asset === undefined || (params?.asset !== undefined && havenTx.from_asset_type == params.asset))

      const isIn: boolean =
        baseAmount(havenTx.toAmount, 12).gte('0') &&
        (params?.asset === undefined || (params?.asset !== undefined && havenTx.to_asset_type == params.asset))

      const from: Array<TxFrom> = isOut
        ? [{ amount: baseAmount(havenTx.fromAmount, 12), asset: undefined, from: havenTx.hash }]
        : []
      const to: Array<TxTo> = isIn
        ? [{ amount: baseAmount(havenTx.toAmount, 12), asset: undefined, to: havenTx.hash }]
        : []

      const tx: Tx = {
        hash: havenTx.hash,
        date: new Date(havenTx.timestamp),
        type: isIn && isOut ? TxType.Unknown : TxType.Transfer,
        from,
        to,
        asset: asset,
      }

      return tx
    })

    const txPages: TxsPage = {
      txs,
      total: txs.length,
    }
    return txPages
  }
  getTransactionData(_txId: string, _assetAddress?: string): Promise<Tx> {
    throw new Error('Method not implemented.')
  }
  transfer(params: TxParams): Promise<TxHash> {
    const { amount, asset, recipient, memo } = params
    if (asset === undefined) throw 'please specify asset it in Client.transfer() for Haven'
    const amountString = amount.amount.toString()
    return this.havenCoreClient.transfer(amountString, asset.ticker as HavenTicker, recipient, memo)
  }
  isSyncing(): boolean {
    throw new Error('Method not implemented.')
  }
  syncHeight(): number {
    throw new Error('Method not implemented.')
  }
  blockHeight(): number {
    throw new Error('Method not implemented.')
  }
}
export { Client }
