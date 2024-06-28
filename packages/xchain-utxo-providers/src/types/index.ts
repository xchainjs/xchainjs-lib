import {
  Balance as BaseBalance,
  FeeRates,
  Network,
  Tx as BaseTx,
  TxFrom as BaseTxFrom,
  TxHash,
  TxHistoryParams,
  TxTo as BaseTxTo,
  TxsPage as BaseTxsPage,
} from '@xchainjs/xchain-client'
import { Address, Asset } from '@xchainjs/xchain-util'

export type Witness = {
  value: number
  script: Buffer
}

export type UTXO = {
  hash: string
  index: number
  value: number
  witnessUtxo?: Witness
  txHex?: string
  scriptPubKey?: string
}

/**
 * Type definition for UTXO balance.
 */
export type Balance = BaseBalance & {
  asset: Asset
}

/**
 * Type definition for the sender of a UTXO transaction.
 */
export type TxFrom = BaseTxFrom & {
  asset?: Asset
}

/**
 * Type definition for the recipient of a UTXO transaction.
 */
export type TxTo = BaseTxTo & {
  asset?: Asset
}

/**
 * Type definition for a UTXO transaction.
 */
export type Tx = BaseTx & {
  asset: Asset
  from: TxFrom[]
  to: TxTo[]
}

/**
 * Type definition for a page of UTXO transactions.
 */
export type TxsPage = BaseTxsPage & {
  txs: Tx[]
}

export interface UtxoOnlineDataProvider {
  /**
   * Get the balance for a given address.
   * @param {Address} address The address to get the balance for.
   * @param {Asset[]} assets (Optional) An array of assets to get the balance for.
   * @returns {Promise<Balance[]>} A promise that resolves to an array of balances.
   */
  getBalance(address: Address, confirmedOnly?: boolean): Promise<Balance[]>

  /**
   * Get transactions based on provided parameters.
   * @param {TxHistoryParams} params The parameters for fetching transactions.
   * @returns {Promise<TxsPage>} A promise that resolves to a page of transactions.
   */
  getTransactions(params: TxHistoryParams): Promise<TxsPage>

  /**
   * Get transaction data based on its ID.
   * @param {string} txId The ID of the transaction.
   * @param {Address} assetAddress (Optional) The address of the asset.
   * @returns {Promise<Tx>} A promise that resolves to the transaction data.
   */
  getTransactionData(txId: string, assetAddress?: Address): Promise<Tx>

  /**
   * Get the fee rates.
   * @returns {Promise<FeeRates>} A promise that resolves to the fee rates.
   */
  getFeeRates(): Promise<FeeRates>

  /**
   * Get confirmed unspent transaction outputs
   * @param {Address} address Address of which return the confirmed unspent transaction outputs
   * @returns {Promise<UTXO[]>} List of the confirmed unspent transaction outputs the address has
   */
  getConfirmedUnspentTxs(address: Address): Promise<UTXO[]>

  /**
   * Get unspent transaction outputs
   * @param {Address} address Address of which return the unspent transaction outputs
   * @returns {Promise<UTXO[]>} List of the unspent transaction outputs the address has
   */
  getUnspentTxs(address: Address): Promise<UTXO[]>

  /**
   * Broadcast a signed raw transaction
   * @param {string} txHex Signed raw transaction
   * @returns {Promise<UTXO[]>} Hash of the transaction broadcasted
   */
  broadcastTx(txHex: string): Promise<TxHash>
}

export type UtxoOnlineDataProviders = Record<Network, UtxoOnlineDataProvider | undefined>
