import { Network as XChainNetwork } from '@xchainjs/xchain-client'
import { Network as EthNetwork } from './types'

export const ETH_DECIMAL = 18

/**
 * XChainNetwork -> EthNetwork
 * 
 * @param {XChainNetwork} network
 * @returns {EthNetwork}
 */
export const xchainNetworkToEths = (network: XChainNetwork): EthNetwork => {
  switch (network) {
    case 'mainnet':
      return EthNetwork.MAIN
    case 'testnet':
      return EthNetwork.TEST
  }
}

/**
 * EthNetwork -> XChainNetwork
 * 
 * @param {EthNetwork} network
 * @returns {XChainNetwork}
 */
export const ethNetworkToXchains = (network: EthNetwork): XChainNetwork => {
  switch (network) {
    case EthNetwork.MAIN:
      return 'mainnet'
    case EthNetwork.TEST:
      return 'testnet'
  }
}
