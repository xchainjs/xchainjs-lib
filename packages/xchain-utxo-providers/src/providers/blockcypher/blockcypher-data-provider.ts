import PromisePool from '@supercharge/promise-pool'
import {
  Balance,
  FeeOption,
  FeeRates,
  Tx,
  TxHash,
  TxHistoryParams,
  TxType,
  TxsPage,
  UTXO,
  UtxoOnlineDataProvider,
} from '@xchainjs/xchain-client'
import { Address, Asset, Chain, baseAmount } from '@xchainjs/xchain-util'

import * as blockcypher from './blockcypher-api'
import { BlockcypherNetwork, Transaction } from './blockcypher-api-types'

export class BlockcypherProvider implements UtxoOnlineDataProvider {
  private baseUrl: string
  private _apiKey?: string
  private chain: Chain
  private asset: Asset
  private assetDecimals: number
  private blockcypherNetwork: BlockcypherNetwork

  constructor(
    baseUrl = 'https://api.blockcypher.com/v1/',
    chain: Chain,
    asset: Asset,
    assetDecimals: number,
    blockcypherNetwork: BlockcypherNetwork,
    apiKey?: string,
  ) {
    this.baseUrl = baseUrl
    this._apiKey = apiKey
    this.chain = chain
    this.asset = asset
    this.assetDecimals = assetDecimals
    this.blockcypherNetwork = blockcypherNetwork
    this.asset
    this.chain
  }
  public get apiKey(): string | undefined {
    return this._apiKey
  }
  public set apiKey(value: string | undefined) {
    this._apiKey = value
  }
  async broadcastTx(txHex: string): Promise<TxHash> {
    return await blockcypher.broadcastTx({
      apiKey: this._apiKey,
      baseUrl: this.baseUrl,
      network: this.blockcypherNetwork,
      txHex,
    })
  }

  async getConfirmedUnspentTxs(address: string): Promise<UTXO[]> {
    const allUnspent = await this.getRawTransactions({ address, offset: 0, limit: 2000 }, true)
    return this.mapUTXOs(
      address,
      allUnspent.filter((i) => i.confirmed),
    )
  }
  async getUnspentTxs(address: string): Promise<UTXO[]> {
    const allUnspent = await this.getRawTransactions({ address, offset: 0, limit: 2000 }, true)
    return this.mapUTXOs(address, allUnspent)
  }

  async getBalance(address: Address, assets?: Asset[] /*ignored*/, confirmedOnly?: boolean): Promise<Balance[]> {
    assets // TODO can we fix this?
    const amount = await blockcypher.getBalance({
      apiKey: this._apiKey,
      baseUrl: this.baseUrl,
      network: this.blockcypherNetwork,
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
  async getTransactions(params?: TxHistoryParams, unspentOnly = false): Promise<TxsPage> {
    const rawTxs = await this.getRawTransactions(params, unspentOnly)
    const txs = rawTxs.map((i) => this.mapTransactionToTx(i))
    const result: TxsPage = {
      total: txs.length,
      txs,
    }
    return result
  }

  /**
   * Get the transaction details of a given transaction id.
   *
   * @param {string} txId The transaction id.
   * @returns {Tx} The transaction details of the given transaction id.
   */
  async getTransactionData(txId: string): Promise<Tx> {
    try {
      const rawTx = await blockcypher.getTx({
        apiKey: this._apiKey,
        baseUrl: this.baseUrl,
        network: this.blockcypherNetwork,
        hash: txId,
      })
      return this.mapTransactionToTx(rawTx)
    } catch (error) {
      console.error(error)
      throw error
    }
  }

  async getFeeRates(): Promise<FeeRates> {
    const chainResponse = await blockcypher.getBlockchainData({
      baseUrl: `${this.baseUrl}/${this.blockcypherNetwork}`,
      apiKey: this._apiKey,
    })

    return {
      [FeeOption.Average]: chainResponse.low_fee_per_kb / 1000,
      [FeeOption.Fast]: chainResponse.medium_fee_per_kb / 1000,
      [FeeOption.Fastest]: chainResponse.high_fee_per_kb / 1000,
    }
  }

  private mapTransactionToTx(rawTx: Transaction): Tx {
    return {
      asset: this.asset,
      from: rawTx.inputs.map((i) => ({
        from: i.addresses[0],
        amount: baseAmount(i.output_value, this.assetDecimals),
      })),
      to: rawTx.outputs
        .filter((i) => i.script_type !== 'null-data') //filter out op_return outputs
        .map((i) => ({ to: i.addresses[0], amount: baseAmount(i.value, this.assetDecimals) })),
      date: new Date(rawTx.confirmed),
      type: TxType.Transfer,
      hash: rawTx.hash,
    }
  }

  private mapUTXOs(address: string, utxos: Transaction[]): UTXO[] {
    const utxosOut: UTXO[] = []
    for (let index = 0; index < utxos.length; index++) {
      const utxo = utxos[index]
      for (let index2 = 0; index2 < utxo.outputs.length; index2++) {
        const output = utxo.outputs[index2]
        if (output.addresses && output.addresses[0] === address) {
          const utxoOut = {
            hash: utxo.hash,
            index: index2,
            value: baseAmount(output.value, this.assetDecimals).amount().toNumber(),
            witnessUtxo: {
              value: baseAmount(output.value, this.assetDecimals).amount().toNumber(),
              script: Buffer.from(output.script, 'hex'),
            },
            txHex: utxo.hex,
          }
          utxosOut.push(utxoOut)
        }
      }
    }

    return utxosOut
  }

  /**
   * helper function tto limit adding to an array
   *
   * @param arr array to be added to
   * @param toAdd elements to add
   * @param limit do not add more than this limit
   */
  private addArrayUpToLimit(arr: string[], toAdd: string[], limit: number) {
    for (let index = 0; index < toAdd.length; index++) {
      const element = toAdd[index]
      if (arr.length < limit) {
        arr.push(element)
      }
    }
  }
  private delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  /**
   * Get transaction history of a given address with pagination options.
   * By default it will return the transaction history of the current wallet.
   *
   * @param {TxHistoryParams} params The options to get transaction history. (optional)
   * @returns {TxsPage} The transaction history.
   */
  private async getRawTransactions(params?: TxHistoryParams, unspentOnly = false): Promise<Transaction[]> {
    const offset = params?.offset ?? 0
    const limit = params?.limit || 10
    if (offset + limit > 2000) throw Error('cannot fetch more than last 2000 txs')
    if (offset < 0 || limit < 0) throw Error('ofset and limit must be equal or greater than 0')

    const txHashesToFetch: string[] = []
    try {
      const response = await blockcypher.getTxs({
        apiKey: this._apiKey,
        baseUrl: this.baseUrl,
        network: this.blockcypherNetwork,
        address: `${params?.address}`,
        limit: 2000, // fetch the maximum
        unspentOnly,
      })

      //remove duplicates
      const txs: string[] = []
      response.txrefs && txs.push(...response.txrefs.map((i) => i.tx_hash))
      response.unconfirmed_txrefs && txs.push(...response.unconfirmed_txrefs.map((i) => i.tx_hash))
      const uniqTxs = [...new Set(txs)]
      const start = offset >= uniqTxs.length ? uniqTxs.length : offset
      const end = offset + limit >= uniqTxs.length ? uniqTxs.length : offset + limit
      const txsToFetch = uniqTxs.slice(start, end)
      // console.log(JSON.stringify(txsToFetch, null, 2))

      this.addArrayUpToLimit(txHashesToFetch, txsToFetch, limit)
    } catch (error) {
      console.error(error)
      //an errors means no more results
    }

    //note: blockcypher has rate of 3 req/sec --> https://www.blockcypher.com/dev/bitcoin/#rate-limits-and-tokens
    const batchResult = await PromisePool.for(txHashesToFetch)
      .withConcurrency(3)
      .useCorrespondingResults()
      .process(async (hash) => {
        await this.delay(1000)
        const rawTx = await blockcypher.getTx({
          apiKey: this._apiKey,
          baseUrl: this.baseUrl,
          network: this.blockcypherNetwork,
          hash,
          limit: 50, // Temporal approach
        })
        return rawTx
      })

    return batchResult.results as Transaction[]
  }
}
