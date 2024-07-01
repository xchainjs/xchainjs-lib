import {
  Balance as BaseBalance,
  FeeRates,
  Network,
  Tx as BaseTx,
  TxFrom as BaseTxFrom,
  TxHistoryParams,
  TxTo as BaseTxTo,
  TxsPage as BaseTxsPage,
} from '@xchainjs/xchain-client'
import { Address, Asset, TokenAsset } from '@xchainjs/xchain-util'

/**
 * Compatible tokens with EVM providers
 */
export type CompatibleAsset = Asset | TokenAsset

/**
 * Type definition for EVM balance.
 */
export type Balance = BaseBalance & {
  asset: CompatibleAsset
}

/**
 * Type definition for the sender of a EVM transaction.
 */
export type TxFrom = BaseTxFrom & {
  asset?: CompatibleAsset
}

/**
 * Type definition for the recipient of a EVM transaction.
 */
export type TxTo = BaseTxTo & {
  asset?: CompatibleAsset
}

/**
 * Type definition for a EVM transaction.
 */
export type Tx = BaseTx & {
  asset: CompatibleAsset
  from: TxFrom[]
  to: TxTo[]
}

/**
 * Type definition for a page of EVM transactions.
 */
export type TxsPage = BaseTxsPage & {
  txs: Tx[]
}

export interface EvmOnlineDataProvider {
  /**
   * Get the balance for a given address.
   * @param {Address} address The address to get the balance for.
   * @param {CompatibleAsset[]} assets (Optional) An array of assets to get the balance for.
   * @returns {Promise<Balance[]>} A promise that resolves to an array of balances.
   */
  getBalance(address: Address, assets?: CompatibleAsset[]): Promise<Balance[]>

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
}

export type EvmOnlineDataProviders = Record<Network, EvmOnlineDataProvider | undefined>
