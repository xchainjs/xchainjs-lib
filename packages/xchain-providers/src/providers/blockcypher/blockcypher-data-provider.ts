import { PromisePool } from '@supercharge/promise-pool'
import { Balance, Tx, TxHash, TxHistoryParams, TxType, TxsPage } from '@xchainjs/xchain-client'
import { Address, Asset, Chain, assetAmount, assetToBase, baseAmount } from '@xchainjs/xchain-util'

import { UTXO, UtxoOnlineDataProvider } from '../../provider-types'

import * as blockcypher from './blockcypher-api'
import { BlockcypherNetwork, Transaction } from './blockcypher-api-types'

export class BlockcypherProvider implements UtxoOnlineDataProvider {
  private baseUrl: string
  private apiKey?: string
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
    this.apiKey = apiKey
    this.chain = chain
    this.asset = asset
    this.assetDecimals = assetDecimals
    this.blockcypherNetwork = blockcypherNetwork
    this.asset
    this.chain
  }

  async broadcastTx(txHex: string): Promise<TxHash> {
    return await blockcypher.broadcastTx({
      apiKey: this.apiKey,
      baseUrl: this.baseUrl,
      network: this.blockcypherNetwork,
      txHex,
    })
  }

  async getConfirmedUnspentTxs(address: string): Promise<UTXO[]> {
    const allUnspent = await this.getRawTransactions({ address, offset: 0, limit: 2000 }, true)
    return this.mapUTXOs(allUnspent.filter((i) => i.confirmed))
  }
  async getUnspentTxs(address: string): Promise<UTXO[]> {
    const allUnspent = await this.getRawTransactions({ address, offset: 0, limit: 2000 }, true)
    return this.mapUTXOs(allUnspent)
  }

  async getBalance(address: Address, assets?: Asset[] /*ignored*/, confirmedOnly?: boolean): Promise<Balance[]> {
    assets // TODO can we fix this?
    const amount = await blockcypher.getBalance({
      apiKey: this.apiKey,
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
        apiKey: this.apiKey,
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

  private mapUTXOs(utxos: Transaction[]): UTXO[] {
    utxos[0].outputs
    // const hex =
    // // utxos.map((utxo) => (return utxo))
    // return utxos.map((utxo) => ({
    //   hash: utxo.hash,
    //   index: utxo.index,
    //   value: assetToBase(assetAmount(utxo.value, this.assetDecimals)).amount().toNumber(),
    //   witnessUtxo: {
    //     value: assetToBase(assetAmount(utxo.value, this.assetDecimals)).amount().toNumber(),
    //     script: Buffer.from(utxo.script, 'hex'),
    //   },
    //   txHex: utxo.hex,
    // }))
    return []
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

    const txHashesToFetch: string[] = []
    try {
      const response = await blockcypher.getTxs({
        apiKey: this.apiKey,
        baseUrl: this.baseUrl,
        network: this.blockcypherNetwork,
        address: `${params?.address}`,
        limit: 2000, // fetch the maximum
        unspentOnly,
      })
      // console.log(JSON.stringify(response, null, 2))

      //remove duplicates
      const txs = response.txrefs.map((i) => i.tx_hash)
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
          apiKey: this.apiKey,
          baseUrl: this.baseUrl,
          network: this.blockcypherNetwork,
          hash,
        })
        return rawTx
      })

    return batchResult.results as Transaction[]
  }
}
