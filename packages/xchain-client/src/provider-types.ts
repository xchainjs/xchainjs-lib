import { Address, Asset } from '@xchainjs/xchain-util'

import { ExplorerProvider } from './explorer-provider'
import { Balance, FeeRates, Network, Tx, TxHistoryParams, TxsPage } from './types'
/**
 * Interface for online data providers.
 */
export interface OnlineDataProvider {
  /**
   * Get the balance for a given address.
   * @param {Address} address The address to get the balance for.
   * @param {Asset[]} assets (Optional) An array of assets to get the balance for.
   * @returns {Promise<Balance[]>} A promise that resolves to an array of balances.
   */
  getBalance(address: Address, assets?: Asset[]): Promise<Balance[]>

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

/**
 * Type alias for Ethereum Virtual Machine (EVM) online data provider.
 */
export type EvmOnlineDataProvider = OnlineDataProvider

/**
 * Type alias for explorer providers.
 */
export type ExplorerProviders = Record<Network, ExplorerProvider>

/**
 * Type alias for online data providers.
 */
export type OnlineDataProviders = Record<Network, OnlineDataProvider | undefined>

/**
 * Type alias for EVM online data providers.
 */
export type EvmOnlineDataProviders = Record<Network, EvmOnlineDataProvider | undefined>
