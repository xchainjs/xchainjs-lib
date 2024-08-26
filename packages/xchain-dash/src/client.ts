import * as dashcore from '@dashevo/dashcore-lib'
import { AssetInfo, FeeRate, Network, TxHistoryParams, TxType } from '@xchainjs/xchain-client'
import { Address, assetAmount, assetToBase, baseAmount } from '@xchainjs/xchain-util'
import { Balance, Client as UTXOClient, Tx, TxParams, TxsPage, UTXO, UtxoClientParams } from '@xchainjs/xchain-utxo'

import {
  AssetDASH,
  BitgoProviders,
  BlockcypherDataProviders,
  DASHChain,
  DASH_DECIMAL,
  LOWER_FEE_BOUND,
  UPPER_FEE_BOUND,
  explorerProviders,
} from './const'
import * as insight from './insight-api'
import { InsightTxResponse } from './insight-api'
import { DashPreparedTx, NodeAuth, NodeUrls } from './types'
import * as Utils from './utils'

/**
 * Default parameters for the DASH client.
 */
export const defaultDashParams: UtxoClientParams & {
  nodeUrls: NodeUrls
  nodeAuth?: NodeAuth
} = {
  network: Network.Mainnet,
  phrase: '',
  explorerProviders: explorerProviders,
  dataProviders: [BitgoProviders, BlockcypherDataProviders],
  rootDerivationPaths: {
    [Network.Mainnet]: `m/44'/5'/0'/0/`,
    [Network.Stagenet]: `m/44'/5'/0'/0/`,
    [Network.Testnet]: `m/44'/1'/0'/0/`,
  },
  feeBounds: {
    lower: LOWER_FEE_BOUND,
    upper: UPPER_FEE_BOUND,
  },
  nodeUrls: {
    [Network.Mainnet]: 'https://insight.dash.org/insight-api',
    [Network.Stagenet]: 'https://insight.dash.org/insight-api',
    [Network.Testnet]: 'http://insight.testnet.networks.dash.org:3001/insight-api',
  },
}
/**
 * DASH client class extending UTXOClient.
 */
abstract class Client extends UTXOClient {
  protected readonly nodeUrls: NodeUrls
  protected readonly nodeAuth?: NodeAuth

  constructor(params = defaultDashParams) {
    super(DASHChain, {
      network: params.network,
      rootDerivationPaths: params.rootDerivationPaths,
      phrase: params.phrase,
      feeBounds: params.feeBounds,
      explorerProviders: params.explorerProviders,
      dataProviders: params.dataProviders,
    })
    this.nodeUrls = params.nodeUrls
    this.nodeAuth = params.nodeAuth
  }

  /**
   * Get the asset info for DASH.
   * @returns {AssetInfo} The asset info for DASH.
   */
  getAssetInfo(): AssetInfo {
    const assetInfo: AssetInfo = {
      asset: AssetDASH,
      decimal: DASH_DECIMAL,
    }
    return assetInfo
  }

  /**
   * Validate a DASH address.
   * @param {string} address The DASH address to validate.
   * @returns {boolean} True if the address is valid, false otherwise.
   */
  validateAddress(address: string): boolean {
    return Utils.validateAddress(address, this.network)
  }
  /**
   * Asynchronously get the balance for a DASH address.
   * @param {string} address The DASH address.
   * @returns {Promise<Balance[]>} A promise resolving to an array of balances.
   */
  async getBalance(address: string): Promise<Balance[]> {
    const addressResponse = await insight.getAddress({ network: this.network, address })
    const confirmed = baseAmount(addressResponse.balanceSat)
    const unconfirmed = baseAmount(addressResponse.unconfirmedBalanceSat)
    return [
      {
        asset: AssetDASH,
        amount: confirmed.plus(unconfirmed),
      },
    ]
  }
  /**
   * Asynchronously retrieves transactions for a given address.
   * @param {TxHistoryParams} params - Parameters for transaction retrieval.
   * @returns {Promise<TxsPage>} A promise resolving to a page of transactions.
   */
  async getTransactions(params?: TxHistoryParams): Promise<TxsPage> {
    // Extract offset and limit from parameters or set default values
    const offset = params?.offset ?? 0
    const limit = params?.limit || 10

    // Insight uses pages rather than offset/limit indexes, so we have to
    // iterate through each page within the offset/limit range.
    const perPage = 10
    const startPage = Math.floor(offset / perPage)
    const endPage = Math.floor((offset + limit - 1) / perPage)
    const firstPageOffset = offset % perPage
    const lastPageLimit = (firstPageOffset + (limit - 1)) % perPage

    let totalPages = -1
    let lastPageTotal = -1

    let insightTxs: InsightTxResponse[] = []
    // Iterate through each page within the offset/limit range
    for (let pageNum = startPage; pageNum <= endPage; pageNum++) {
      const response = await insight.getAddressTxs({
        network: this.network,
        address: `${params?.address}`,
        pageNum,
      })
      let startIndex = 0
      let endIndex = perPage - 1
      if (pageNum == startPage) {
        startIndex = firstPageOffset
      }
      if (pageNum === endPage) {
        endIndex = lastPageLimit
      }
      insightTxs = [...insightTxs, ...response.txs.slice(startIndex, endIndex + 1)]

      // Insight only returns the number of pages not the total number of
      // transactions. If the last page is within the offset/limit range then we
      // can set the lastPageTotal here and avoid having to send another request,
      // otherwise we can fetch the last page later to determine the total
      // transaction count
      totalPages = response.pagesTotal
      if (pageNum === totalPages - 1) {
        lastPageTotal = response.txs.length
      }
    }
    // Map insight transactions to XChain transactions
    const txs: Tx[] = insightTxs.map(this.insightTxToXChainTx)
    // Fetch transactions count for last page if not obtained
    if (lastPageTotal < 0) {
      const lastPageResponse = await insight.getAddressTxs({
        network: this.network,
        address: `${params?.address}`,
        pageNum: totalPages - 1,
      })
      lastPageTotal = lastPageResponse.txs.length
    }
    // Calculate total transactions count and return the page of transactions
    return {
      total: (totalPages - 1) * perPage + lastPageTotal,
      txs,
    }
  }
  /**
   * Asynchronously retrieves transaction data for a given transaction ID.
   * @param {string} txid - The transaction ID.
   * @returns {Promise<Tx>} A promise resolving to the transaction data.
   */
  async getTransactionData(txid: string): Promise<Tx> {
    const tx = await insight.getTx({ network: this.network, txid })
    return this.insightTxToXChainTx(tx)
  }
  /**
   * Converts an Insight transaction response to XChain transaction.
   * @param {InsightTxResponse} tx - The Insight transaction response.
   * @returns {Tx} The XChain transaction.
   */
  private insightTxToXChainTx(tx: InsightTxResponse): Tx {
    return {
      asset: AssetDASH,
      from: tx.vin.map((i) => ({
        from: i.addr,
        amount: assetToBase(assetAmount(i.value)),
      })),
      to: tx.vout
        .filter((i) => i.scriptPubKey.type !== 'nulldata')
        .map((i) => ({ to: i.scriptPubKey.addresses?.[0], amount: assetToBase(assetAmount(i.value)) })),
      date: new Date(tx.time * 1000),
      type: TxType.Transfer,
      hash: tx.txid,
    }
  }

  /**
   * Asynchronously prepares a transaction for sending assets.
   * @param {TxParams&Address&FeeRate} params - Parameters for the transaction preparation.
   * @returns {string} A promise resolving to the prepared transaction data.
   */
  async prepareTx({
    sender,
    memo,
    amount,
    recipient,
    feeRate,
  }: TxParams & {
    sender: Address
    feeRate: FeeRate
  }): Promise<DashPreparedTx> {
    // Build the transaction using provided parameters
    const { tx, utxos } = await Utils.buildTx({
      sender,
      recipient,
      memo,
      amount,
      feeRate,
      network: this.network,
    })
    // Return the raw unsigned transaction and UTXOs
    return { rawUnsignedTx: tx.toString(), utxos }
  }
  /**
   * Compiles a memo into a buffer.
   * @param {string} memo - The memo to be compiled.
   * @returns {Buffer} The compiled memo as a buffer.
   */
  protected compileMemo(memo: string): Buffer {
    return dashcore.Script.buildDataOut(memo)
  }

  /**
   * Calculates the transaction fee based on the provided UTXOs, fee rate, and optional compiled memo.
   * @param {UTXO[]} inputs - The UTXOs used as inputs for the transaction.
   * @param {FeeRate} feeRate - The fee rate for the transaction.
   * @param {Buffer | null} data - The compiled memo as a buffer (optional).
   * @returns {number} The calculated transaction fee amount.
   */
  protected getFeeFromUtxos(inputs: UTXO[], feeRate: FeeRate, data: Buffer | null = null): number {
    // Calculate the size of the transaction in bytes
    let sum =
      Utils.TransactionBytes.Version +
      Utils.TransactionBytes.Type +
      Utils.TransactionBytes.InputCount +
      inputs.length *
        (Utils.TransactionBytes.InputPrevOutputHash +
          Utils.TransactionBytes.InputPrevOutputIndex +
          Utils.TransactionBytes.InputScriptLength +
          Utils.TransactionBytes.InputPubkeyHash +
          Utils.TransactionBytes.InputSequence) +
      Utils.TransactionBytes.OutputCount +
      2 *
        (Utils.TransactionBytes.OutputValue +
          Utils.TransactionBytes.OutputScriptLength +
          Utils.TransactionBytes.OutputPubkeyHash) +
      Utils.TransactionBytes.LockTime
    // Add size of the memo data if provided
    if (data) {
      sum +=
        Utils.TransactionBytes.OutputValue +
        Utils.TransactionBytes.OutputScriptLength +
        Utils.TransactionBytes.OutputOpReturn +
        data.length
    }
    // Calculate fee based on transaction size and fee rate
    const fee = sum * feeRate
    // Ensure fee meets minimum requirement
    return fee > Utils.TX_MIN_FEE ? fee : Utils.TX_MIN_FEE
  }
}

export { Client }
