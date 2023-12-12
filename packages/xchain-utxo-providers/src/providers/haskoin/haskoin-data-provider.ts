import { Balance, FeeRates, Tx, TxHash, TxHistoryParams, TxType, TxsPage } from '@xchainjs/xchain-client'
import { Address, Asset, Chain, baseAmount } from '@xchainjs/xchain-util'

import { UTXO, UtxoOnlineDataProvider } from '../types'

import * as haskoin from './haskoin-api'
import { HaskoinNetwork, Transaction, TxUnspent } from './haskoin-api-types'

export class HaskoinProvider implements UtxoOnlineDataProvider {
  private baseUrl: string
  private chain: Chain
  private asset: Asset
  private assetDecimals: number
  private haskoinNetwork: HaskoinNetwork

  constructor(
    baseUrl = 'https://api.haskoin.com/',
    chain: Chain,
    asset: Asset,
    assetDecimals: number,
    haskoinNetwork: HaskoinNetwork,
  ) {
    this.baseUrl = baseUrl
    this.chain = chain
    this.asset = asset
    this.assetDecimals = assetDecimals
    this.haskoinNetwork = haskoinNetwork
    this.asset
    this.chain
  }
  async broadcastTx(txHex: string): Promise<TxHash> {
    return await haskoin.broadcastTx({
      haskoinUrl: this.baseUrl,
      haskoinNetwork: this.haskoinNetwork,
      txHex,
    })
  }

  async getConfirmedUnspentTxs(address: string): Promise<UTXO[]> {
    const allUnspent = await haskoin.getUnspentTransactions({
      haskoinUrl: this.baseUrl,
      network: this.haskoinNetwork,
      address,
    })
    const confirmedUnspent = allUnspent.filter((i) => i.block && !i.block.mempool)
    return this.mapUTXOs(confirmedUnspent)
  }
  async getUnspentTxs(address: string): Promise<UTXO[]> {
    const allUnspent = await haskoin.getUnspentTxs({
      haskoinUrl: this.baseUrl,
      network: this.haskoinNetwork,
      address,
    })

    return await this.mapUTXOs(allUnspent)
  }

  async getBalance(address: Address, assets?: Asset[] /*ignored*/, confirmedOnly?: boolean): Promise<Balance[]> {
    assets // TODO can we fix this?
    const amount = await haskoin.getBalance({
      haskoinUrl: this.baseUrl,
      haskoinNetwork: this.haskoinNetwork,
      address,
      confirmedOnly: !!confirmedOnly,
      assetDecimals: this.assetDecimals,
    })
    return [{ amount, asset: this.asset }]
  }

  /**
   * Get transaction history of a given address with pagination options.
   * By default it will return the transaction history of the current wallet.
   *
   * @param {TxHistoryParams} params The options to get transaction history. (optional)
   * @returns {TxsPage} The transaction history.
   */
  async getTransactions(params?: TxHistoryParams): Promise<TxsPage> {
    const offset = params?.offset ?? 0
    const limit = params?.limit || 10
    if (offset + limit > 2000) throw Error('cannot fetch more than last 2000 txs')
    if (offset < 0 || limit < 0) throw Error('ofset and limit must be equal or greater than 0')
    const response = await haskoin.getTxs({
      address: `${params?.address}`,
      haskoinUrl: this.baseUrl,
      network: this.haskoinNetwork,
      limit: limit,
      offset,
    })
    const txs = response.map((i) => this.mapTransactionToTx(i))
    const result: TxsPage = {
      total: txs.length,
      txs: txs,
    }

    return result
  }

  private mapTransactionToTx(rawTx: Transaction): Tx {
    return {
      asset: this.asset,
      from: rawTx.inputs.map((i) => ({
        from: i.address,
        amount: baseAmount(i.value, this.assetDecimals),
      })),
      to: rawTx.outputs
        .filter((i) => i.script !== 'null-data') //filter out op_return outputs
        .map((i) => ({ to: i.address, amount: baseAmount(i.value, this.assetDecimals) })),
      date: new Date(rawTx.time),
      type: TxType.Transfer,
      hash: rawTx.txid,
    }
  }

  /**
   * Get the transaction details of a given transaction id.
   *
   * @param {string} txId The transaction id.
   * @returns {Tx} The transaction details of the given transaction id.
   */
  async getTransactionData(txId: string): Promise<Tx> {
    try {
      const rawTx = await haskoin.getTx({
        haskoinUrl: this.baseUrl,
        network: this.haskoinNetwork,
        txId: txId,
      })
      return this.mapTransactionToTx(rawTx)
    } catch (error) {
      console.error(error)
      throw error
    }
  }

  /**
   *  @throws {Error} Method not implemented.
   */
  getFeeRates(): Promise<FeeRates> {
    throw new Error('Method not implemented.')
  }

  /**
   *
   * @param utxos
   * @returns utxo array
   */
  private async mapUTXOs(utxos: TxUnspent[]): Promise<UTXO[]> {
    return await Promise.all(
      utxos.map(async (utxo) => ({
        hash: utxo.txid,
        index: utxo.index,
        value: baseAmount(utxo.value, this.assetDecimals).amount().toNumber(),
        witnessUtxo: {
          value: baseAmount(utxo.value, this.assetDecimals).amount().toNumber(),
          script: Buffer.from(utxo.pkscript, 'hex'),
        },
        txHex: await haskoin.getTxHex({ haskoinUrl: this.baseUrl, txId: utxo.txid, network: this.haskoinNetwork }),
      })),
    )
  }
}
