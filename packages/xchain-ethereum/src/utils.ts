import { Network as XChainNetwork } from '@xchainjs/xchain-client'
import { Network as EthNetwork } from './types'

export const xchainNetworkToEths = (network: XChainNetwork): EthNetwork => {
  switch (network) {
    /**
     * DO NOT use switch/case's default branch
     * to be sure that ALL possible cases are
     * processed in a similar way to reverted ethNetworkToXchains
     */
    case 'mainnet':
      return EthNetwork.MAIN
    case 'testnet':
      return EthNetwork.TEST
  }
}

export const ethNetworkToXchains = (network: EthNetwork): XChainNetwork => {
  switch (network) {
    /**
     * DO NOT use switch/case's default branch
     * to be sure that ALL possible cases are
     * processed in a similar way to reverted ethNetworkToXchains
     */
    case EthNetwork.MAIN:
      return 'mainnet'
    case EthNetwork.TEST:
      return 'testnet'
  }
}
