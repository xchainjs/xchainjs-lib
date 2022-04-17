import { Chain } from '@xchainjs/xchain-util/lib'

import { Network } from '../types'

export interface Explorer {
  getExplorerAddressUrl(network: Network, address: string): string
  getExplorerTxUrl(network: Network, txID: string): string
}
export abstract class BaseExplorer implements Explorer {
  protected chain: Chain
  constructor(chain: Chain) {
    this.chain = chain
  }
  abstract getExplorerAddressUrl(network: Network, address: string): string
  abstract getExplorerTxUrl(network: Network, txID: string): string
}
