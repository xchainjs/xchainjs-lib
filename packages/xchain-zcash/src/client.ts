import {
  Address,
  Balance,
  Fee,
  FeeRate,
  Network,
  Tx,
  TxHash,
  TxHistoryParams,
  TxParams,
  TxsPage,
  UTXOClient,
} from '@xchainjs/xchain-client'
import { Chain } from '@xchainjs/xchain-util'

import { ZcashClientParams } from './types'
import * as Utils from './utils'

/**
 * Custom Zcash client
 */
class Client extends UTXOClient {
  private nodeUrl = ''
  private sochainUrl = ''

  /**
   * Constructor
   * Client is initialised with network type
   *
   * @param {ZcashClientParams} params
   */
  constructor({
    network = Network.Testnet,
    phrase,
    nodeUrl,
    sochainUrl = 'https://sochain.com/api/v2',
  }: ZcashClientParams) {
    super(Chain.Zcash, { network, phrase })
    this.nodeUrl =
      nodeUrl ??
      (() => {
        switch (network) {
          case Network.Mainnet:
            return 'https://zec.thorchain.info'
          case Network.Testnet:
            return 'https://testnet.zec.thorchain.info'
        }
      })()

    // TODO: Remove it, needed to get rid of tsc warning
    // "'nodeUrl' is declared but its value is never read."
    console.log('nodeUrl', this.nodeUrl)
    this.sochainUrl = sochainUrl
  }

  /**
   * Set/Update the sochain url.
   *
   * @param {string} url The new sochain url.
   * @returns {void}
   */
  setSochainUrl(url: string): void {
    this.sochainUrl = url
  }

  /**
   * Get the explorer url.
   *
   * @returns {string} The explorer url based on the network.
   */
  getExplorerUrl(): string {
    switch (this.network) {
      // TODO: Add urls
      case Network.Mainnet:
        return 'https://zcashblockexplorer.com/'
      case Network.Testnet:
        return 'https://www.sochain.com/testnet/zcash'
    }
  }

  /**
   * Get the explorer url for the given address.
   *
   * @param {Address} address
   * @returns {string} The explorer url for the given address based on the network.
   */
  getExplorerAddressUrl(address: Address): string {
    // TODO: Check/Update URL
    return `${this.getExplorerUrl()}/address/${address}`
  }

  /**
   * Get the explorer url for the given transaction id.
   *
   * @param {string} txID The transaction id
   * @returns {string} The explorer url for the given transaction id based on the network.
   */
  getExplorerTxUrl(txID: string): string {
    // TODO: Check/Update URL
    return `${this.getExplorerUrl()}/transactions/${txID}`
  }

  /**
   * Get the current address.
   */
  getAddress(index = 0): Address {
    throw new Error(`getAddress needs to be implemented ${index}`)
  }

  /**
   * Validate the given address.
   *
   * @param {Address} address
   * @returns {boolean} `true` or `false`
   */
  validateAddress(address: string): boolean {
    throw new Error(`validateAddress needs to be implemented ${address}`)
  }

  protected getSuggestedFeeRate(): Promise<FeeRate> {
    return Promise.reject(`getSuggestedFeeRate needs to be implemented`)
  }

  protected calcFee(feeRate: FeeRate, memo?: string): Promise<Fee> {
    return Promise.reject(`calcFee needs to be implemented ${JSON.stringify({ feeRate, memo }, null, 2)}`)
  }

  /**
   * Get the LTC balance of a given address.
   *
   * @param {Address} address By default, it will return the balance of the current wallet. (optional)
   * @returns {Balance[]} The LTC balance of the address.
   */
  async getBalance(address: Address): Promise<Balance[]> {
    return Utils.getBalance({
      sochainUrl: this.sochainUrl,
      network: this.network,
      address,
    })
  }

  /**
   * Get transaction history of a given address with pagination options.
   * By default it will return the transaction history of the current wallet.
   *
   * @param {TxHistoryParams} params The options to get transaction history. (optional)
   * @returns {TxsPage} The transaction history.
   */
  async getTransactions(params?: TxHistoryParams): Promise<TxsPage> {
    return Promise.reject(`getTransactions needs to be implemented ${JSON.stringify(params, null, 2)}`)
  }

  /**
   * Get the transaction details of a given transaction id.
   *
   * @param {string} txId The transaction id.
   * @returns {Tx} The transaction details of the given transaction id.
   */
  async getTransactionData(txId: string): Promise<Tx> {
    return Promise.reject(`getTransactionData needs to be implemented ${txId}`)
  }

  /**
   * Transfer LTC.
   *
   * @param {TxParams&FeeRate} params The transfer options.
   * @returns {TxHash} The transaction hash.
   */
  async transfer(params: TxParams & { feeRate?: FeeRate }): Promise<TxHash> {
    return Promise.reject(`transfer needs to be implemented ${JSON.stringify({ params }, null, 2)}`)
  }
}

export { Client }
