/* eslint-disable ordered-imports/ordered-imports */
import { Chain } from '@xchainjs/xchain-util/lib'

import { BaseExplorer } from '../Explorer'

import { Network } from '../types'

export class BlockstreamExplorer extends BaseExplorer {
  constructor(chain: Chain) {
    if (chain !== Chain.Bitcoin) throw new Error('Blockstream explorer only supports bitcoin')
    super(chain)
  }
  /**
   * Get the explorer url for the given address.
   *
   * @param {Address} address
   * @returns {string} The explorer url for the given address based on the network.
   */
  getExplorerAddressUrl(network: Network, address: string): string {
    return `${this.getExplorerUrl(network)}/address/${address}`
  }
  /**
   * Get the explorer url for the given transaction id.
   *
   * @param {string} txID The transaction id
   * @returns {string} The explorer url for the given transaction id based on the network.
   */
  getExplorerTxUrl(network: Network, txID: string): string {
    return `${this.getExplorerUrl(network)}/tx/${txID}`
  }
  /**
   * Get the explorer url.
   *
   * @returns {string} The explorer url based on the network.
   */
  private getExplorerUrl(network: Network): string {
    switch (network) {
      case Network.Mainnet:
        return 'https://blockstream.info'
      case Network.Testnet:
        return 'https://blockstream.info/testnet'
    }
  }
}
