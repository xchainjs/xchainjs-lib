import { FeeRates, TxHash, TxHistoryParams, TxType } from '@xchainjs/xchain-client'
import { Address, Asset, Chain, baseAmount } from '@xchainjs/xchain-util'

import { Balance, Tx, TxsPage, UTXO, UtxoOnlineDataProvider } from '../../types'

import * as nownodes from './nownodes-api'
import { AddressUTXO, Transaction } from './nownodes-api-types'

export class NownodesProvider implements UtxoOnlineDataProvider {
  private baseUrl: string
  private _apiKey: string
  private asset: Asset
  private assetDecimals: number

  constructor(
    baseUrl = 'https://zecbook.nownodes.io/api/v2',
    chain: Chain,
    asset: Asset,
    assetDecimals: number,
    apiKey: string,
  ) {
    this.baseUrl = baseUrl
    this._apiKey = apiKey
    this.asset = asset
    this.assetDecimals = assetDecimals
    if (chain !== 'ZEC' || asset.chain !== 'ZEC') {
      throw Error(`Now nodes provider does not support chain or asset ${chain} ${asset}`)
    }
  }
  public get apiKey(): string {
    return this._apiKey
  }
  public set apiKey(value: string) {
    this._apiKey = value
  }

  async broadcastTx(txHex: string): Promise<TxHash> {
    return await nownodes.broadcastTx({
      apiKey: this._apiKey,
      baseUrl: this.baseUrl,
      txHex,
    })
  }

  async getConfirmedUnspentTxs(address: string): Promise<UTXO[]> {
    const allUnspent = await nownodes.getUTXOs({
      apiKey: this._apiKey,
      baseUrl: this.baseUrl,
      address: address,
      isConfirmed: true
    })
    return this.mapUTXOs(
      allUnspent
    )
  }

  async getUnspentTxs(address: string): Promise<UTXO[]> {
    const allUnspent = await nownodes.getUTXOs({
      apiKey: this._apiKey,
      baseUrl: this.baseUrl,
      address: address,
      isConfirmed: false
    })
    return this.mapUTXOs(
      allUnspent
    )
  }

  async getBalance(address: Address, confirmedOnly?: boolean): Promise<Balance[]> {
    const amount = await nownodes.getBalance({
      apiKey: this._apiKey,
      baseUrl: this.baseUrl,
      address,
      confirmedOnly: confirmedOnly !== undefined ? confirmedOnly : true,
      assetDecimals: this.assetDecimals,
    })
    return [{ amount, asset: this.asset }]
  }

  async getTransactions(params?: TxHistoryParams): Promise<TxsPage> {
    const rawTxs = await this.getRawTransactions(params)
    const txs = rawTxs.map((i) => this.mapTransactionToTx(i))
    const result: TxsPage = {
      total: txs.length,
      txs,
    }
    return result
  }

  async getTransactionData(txId: string): Promise<Tx> {
    try {
      const rawTx = await nownodes.getTx({
        apiKey: this._apiKey,
        baseUrl: this.baseUrl,
        hash: txId,
      })
      return this.mapTransactionToTx(rawTx)
    } catch (error) {
      console.error(error)
      throw error
    }
  }

  async getFeeRates(): Promise<FeeRates> {
    throw Error('Zcash has flat fees. Fee rates not apply')
  }

  private mapTransactionToTx(rawTx: Transaction): Tx {
    return {
      asset: this.asset,
      from: rawTx.vin.map((i) => ({
        from: i.addresses[0],
        amount: baseAmount(i.value, this.assetDecimals),
      })),
      to: rawTx.vout
        .filter((i) => i.isAddress) //filter out op_return outputs
        .map((i) => ({ to: i.addresses[0], amount: baseAmount(i.value, this.assetDecimals) })),
      date: new Date(rawTx.blockTime * 1000),
      type: TxType.Transfer,
      hash: rawTx.txid,
    }
  }

  private async mapUTXOs(utxos: AddressUTXO[]): Promise<UTXO[]> {
    return utxos.flatMap((currentUtxo) => {
      return [{
        hash: currentUtxo.txid,
        index: currentUtxo.vout,
        value: Number(currentUtxo.value)
      }]
    })
  }

  private async getRawTransactions(params?: TxHistoryParams): Promise<Transaction[]> {

    if (params?.startTime) {
      throw Error('startTime not supported on nownodes provider')
    }

    const offset = params?.offset ?? 0
    const limit = params?.limit || 10
    if (offset + limit > 1000) throw Error('cannot fetch more than last 1000 txs') // note: Is possible increase the number if necessary
    if (offset < 0 || limit < 0) throw Error('ofset and limit must be equal or greater than 0')

    try {
      const transactions = await nownodes.getTxs({
        apiKey: this._apiKey,
        baseUrl: this.baseUrl,
        address: `${params?.address}`,
        limit: offset + limit || 1000, // fetch the maximum wihtout pagination
      })
      return transactions.slice(offset, offset + limit)
    } catch (error) {
      throw error
    }
  }
}
