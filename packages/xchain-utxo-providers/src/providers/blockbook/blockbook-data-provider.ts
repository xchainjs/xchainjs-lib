import { FeeOption, FeeRates, TxHash, TxHistoryParams, TxType } from '@xchainjs/xchain-client'
import { Address, Asset, baseAmount } from '@xchainjs/xchain-util'

import { Balance, Tx, TxsPage, UTXO, UtxoOnlineDataProvider } from '../../types'

import * as blockbook from './blockbook-api'
import { AddressUTXO, Transaction } from './blockbook-api-types'

export class BlockbookProvider implements UtxoOnlineDataProvider {
  private baseUrl: string
  private _apiKey?: string
  private asset: Asset
  private assetDecimals: number
  private readonly normalizeAddressForApi?: (address: string) => string

  constructor(
    baseUrl: string,
    asset: Asset,
    assetDecimals: number,
    options?: { apiKey?: string; normalizeAddressForApi?: (address: string) => string },
  ) {
    this.baseUrl = baseUrl
    this._apiKey = options?.apiKey
    this.asset = asset
    this.assetDecimals = assetDecimals
    this.normalizeAddressForApi = options?.normalizeAddressForApi
  }

  private toApiAddress(address: string): string {
    return this.normalizeAddressForApi ? this.normalizeAddressForApi(address) : address
  }

  public get apiKey(): string | undefined {
    return this._apiKey
  }

  public set apiKey(value: string | undefined) {
    this._apiKey = value
  }

  async broadcastTx(txHex: string): Promise<TxHash> {
    return await blockbook.broadcastTx({
      apiKey: this._apiKey,
      baseUrl: this.baseUrl,
      txHex,
    })
  }

  async getConfirmedUnspentTxs(address: string): Promise<UTXO[]> {
    const addr = this.toApiAddress(address)
    const utxos = await blockbook.getUTXOs({
      apiKey: this._apiKey,
      baseUrl: this.baseUrl,
      address: addr,
      isConfirmed: true,
    })
    return await this.mapUTXOs(utxos)
  }

  async getUnspentTxs(address: string): Promise<UTXO[]> {
    const addr = this.toApiAddress(address)
    const utxos = await blockbook.getUTXOs({
      apiKey: this._apiKey,
      baseUrl: this.baseUrl,
      address: addr,
      isConfirmed: false,
    })
    return await this.mapUTXOs(utxos)
  }

  async getBalance(address: Address, confirmedOnly?: boolean): Promise<Balance[]> {
    const addr = this.toApiAddress(address)
    const amount = await blockbook.getBalance({
      apiKey: this._apiKey,
      baseUrl: this.baseUrl,
      address: addr,
      confirmedOnly: confirmedOnly !== undefined ? confirmedOnly : true,
      assetDecimals: this.assetDecimals,
    })
    return [{ amount, asset: this.asset }]
  }

  async getTransactions(params?: TxHistoryParams): Promise<TxsPage> {
    const { transactions: rawTxs, total } = await this.getRawTransactions(params)
    const txs = rawTxs.map((tx) => this.mapTransactionToTx(tx))
    return { total, txs }
  }

  async getTransactionData(txId: string): Promise<Tx> {
    const rawTx = await blockbook.getTx({
      apiKey: this._apiKey,
      baseUrl: this.baseUrl,
      hash: txId,
    })
    return this.mapTransactionToTx(rawTx)
  }

  private static readonly BLOCK_TARGETS: Record<FeeOption, number> = {
    [FeeOption.Average]: 5,
    [FeeOption.Fast]: 3,
    [FeeOption.Fastest]: 1,
  }

  async getFeeRate(feeOption: FeeOption): Promise<number> {
    return blockbook.getFeeEstimate({
      apiKey: this._apiKey,
      baseUrl: this.baseUrl,
      numberOfBlocks: BlockbookProvider.BLOCK_TARGETS[feeOption],
    })
  }

  async getFeeRates(): Promise<FeeRates> {
    const [average, fast, fastest] = await Promise.all([
      this.getFeeRate(FeeOption.Average),
      this.getFeeRate(FeeOption.Fast),
      this.getFeeRate(FeeOption.Fastest),
    ])
    return {
      [FeeOption.Average]: average,
      [FeeOption.Fast]: fast,
      [FeeOption.Fastest]: fastest,
    }
  }

  private mapTransactionToTx(rawTx: Transaction): Tx {
    return {
      asset: this.asset,
      from: rawTx.vin
        .filter((i) => i.isAddress && i.addresses?.length > 0)
        .map((i) => ({
          from: i.addresses[0],
          amount: baseAmount(i.value, this.assetDecimals),
        })),
      to: rawTx.vout
        .filter((i) => i.isAddress && i.addresses?.length > 0)
        .map((i) => ({ to: i.addresses[0], amount: baseAmount(i.value, this.assetDecimals) })),
      date: rawTx.blockTime ? new Date(rawTx.blockTime * 1000) : new Date(0),
      type: TxType.Transfer,
      hash: rawTx.txid,
    }
  }

  private async mapUTXOs(utxos: AddressUTXO[]): Promise<UTXO[]> {
    const result: UTXO[] = []
    const txCache = new Map<string, Transaction>()
    for (const utxo of utxos) {
      let tx = txCache.get(utxo.txid)
      if (!tx) {
        // Rate-limit: pause between consecutive fetches to avoid overwhelming the node
        if (txCache.size > 0) await new Promise((resolve) => setTimeout(resolve, 50))

        tx = await blockbook.getTx({
          apiKey: this._apiKey,
          baseUrl: this.baseUrl,
          hash: utxo.txid,
        })
        txCache.set(utxo.txid, tx)
      }

      const output = tx.vout.find((vout) => vout.n === utxo.vout)
      if (!output?.hex) {
        throw Error(`BlockbookProvider: could not resolve scriptPubKey for UTXO ${utxo.txid}:${utxo.vout}`)
      }

      const value = Number(utxo.value)
      result.push({
        hash: utxo.txid,
        index: utxo.vout,
        value,
        witnessUtxo: {
          value,
          script: Buffer.from(output.hex, 'hex'),
        },
        txHex: tx.hex,
      })
    }
    return result
  }

  private async getRawTransactions(params?: TxHistoryParams): Promise<{ transactions: Transaction[]; total: number }> {
    if (params?.startTime) {
      throw Error('BlockbookProvider: startTime is not supported')
    }
    const offset = params?.offset ?? 0
    const limit = params?.limit || 10
    if (offset + limit > 1000) throw Error('BlockbookProvider: cannot fetch more than the last 1000 txs')
    if (offset < 0 || limit < 0) throw Error('BlockbookProvider: offset and limit must be >= 0')

    const address = params?.address
    if (!address) throw Error('BlockbookProvider: address is required')
    const addr = this.toApiAddress(address)

    const { transactions, total } = await blockbook.getTxs({
      apiKey: this._apiKey,
      baseUrl: this.baseUrl,
      address: addr,
      limit: offset + limit,
    })
    return { transactions: transactions.slice(offset, offset + limit), total }
  }
}
