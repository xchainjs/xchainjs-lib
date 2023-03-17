import {
  Balance,
  Tx,
  TxHash,
  TxHistoryParams,
  TxType,
  TxsPage,
  UTXO,
  UtxoOnlineDataProvider,
} from '@xchainjs/xchain-client'
import { Address, Asset, Chain, assetAmount, assetToBase } from '@xchainjs/xchain-util'

import * as sochain from './sochain-api'
import { AddressUTXO, SochainNetwork } from './sochain-api-types'

export class SochainProvider implements UtxoOnlineDataProvider {
  private baseUrl: string
  private apiKey: string
  private chain: Chain
  private asset: Asset
  private assetDecimals: number
  private sochainNetwork: SochainNetwork

  constructor(
    baseUrl = 'https://sochain.com/api/v3',
    apiKey: string,
    chain: Chain,
    asset: Asset,
    assetDecimals: number,
    sochainNetwork: SochainNetwork,
  ) {
    this.baseUrl = baseUrl
    this.apiKey = apiKey
    this.chain = chain
    this.asset = asset
    this.assetDecimals = assetDecimals
    this.sochainNetwork = sochainNetwork
    this.asset
    this.chain
  }
  async broadcastTx(txHex: string): Promise<TxHash> {
    return await sochain.broadcastTx({
      apiKey: this.apiKey,
      sochainUrl: this.baseUrl,
      network: this.sochainNetwork,
      txHex,
    })
  }

  async getConfirmedUnspentTxs(address: string): Promise<UTXO[]> {
    const allUnspent = await sochain.getUnspentTxs({
      apiKey: this.apiKey,
      sochainUrl: this.baseUrl,
      network: this.sochainNetwork,
      address,
      page: 1,
    })
    const confirmedUnspent = allUnspent.filter((i) => i.block) //if it has a block noumber it's been confirmed
    return this.mapUTXOs(confirmedUnspent)
  }
  async getUnspentTxs(address: string): Promise<UTXO[]> {
    const allUnspent = await sochain.getUnspentTxs({
      apiKey: this.apiKey,
      sochainUrl: this.baseUrl,
      network: this.sochainNetwork,
      address,
      page: 1,
    })
    return this.mapUTXOs(allUnspent)
  }

  async getBalance(address: Address, assets?: Asset[] /*ignored*/, confirmedOnly?: boolean): Promise<Balance[]> {
    assets // TODO can we fix this?
    try {
      const amount = await sochain.getBalance({
        apiKey: this.apiKey,
        sochainUrl: this.baseUrl,
        network: this.sochainNetwork,
        address,
        confirmedOnly: !!confirmedOnly,
        assetDecimals: this.assetDecimals,
      })
      return [{ amount, asset: this.asset }]
    } catch (error) {
      throw new Error(`Could not get balances for address ${address}`)
    }
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
    if (offset < 0 || limit < 0) throw Error('ofset and limit must be equal or greater than 0')

    const firstPage = Math.floor(offset / 10) + 1
    const lastPage = limit > 10 ? firstPage + Math.floor(limit / 10) : firstPage
    const offsetOnFirstPage = offset % 10

    const txHashesToFetch: string[] = []
    let page = firstPage
    try {
      while (page <= lastPage) {
        const response = await sochain.getTxs({
          apiKey: this.apiKey,
          sochainUrl: this.baseUrl,
          network: this.sochainNetwork,
          address: `${params?.address}`,
          page,
        })
        if (response.transactions.length === 0) break
        if (page === firstPage && response.transactions.length > offsetOnFirstPage) {
          //start from offset
          const txsToGet = response.transactions.slice(offsetOnFirstPage)
          this.addArrayUpToLimit(
            txHashesToFetch,
            txsToGet.map((i) => i.hash),
            limit,
          )
        } else {
          this.addArrayUpToLimit(
            txHashesToFetch,
            response.transactions.map((i) => i.hash),
            limit,
          )
        }
        page++
      }
    } catch (error) {
      console.error(error)
      //an errors means no more results
    }

    const total = txHashesToFetch.length
    const transactions: Tx[] = await Promise.all(txHashesToFetch.map((hash) => this.getTransactionData(hash)))

    const result: TxsPage = {
      total,
      txs: transactions,
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
      const rawTx = await sochain.getTx({
        apiKey: this.apiKey,
        sochainUrl: this.baseUrl,
        network: this.sochainNetwork,
        hash: txId,
      })
      return {
        asset: this.asset,
        from: rawTx.inputs.map((i) => ({
          from: i.address,
          amount: assetToBase(assetAmount(i.value, this.assetDecimals)),
        })),
        to: rawTx.outputs
          .filter((i) => i.type !== 'nulldata') //filter out op_return outputs
          .map((i) => ({ to: i.address, amount: assetToBase(assetAmount(i.value, this.assetDecimals)) })),
        date: new Date(rawTx.time * 1000),
        type: TxType.Transfer,
        hash: rawTx.hash,
      }
    } catch (error) {
      console.error(error)
      throw error
    }
  }

  private mapUTXOs(utxos: AddressUTXO[]): UTXO[] {
    return utxos.map((utxo) => ({
      hash: utxo.hash,
      index: utxo.index,
      value: assetToBase(assetAmount(utxo.value, this.assetDecimals)).amount().toNumber(),
      witnessUtxo: {
        value: assetToBase(assetAmount(utxo.value, this.assetDecimals)).amount().toNumber(),
        script: Buffer.from(utxo.script, 'hex'),
      },
      txHex: utxo.tx_hex,
    }))
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
}
