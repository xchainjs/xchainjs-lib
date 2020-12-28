import { Fees, Network as XChainNetwork } from '@xchainjs/xchain-client'
import { baseAmount } from '@xchainjs/xchain-util/lib'
import { Network as EthNetwork } from './types'

export const ETH_DECIMAL = 18

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

/**
 * Get the default gas price.
 *
 * @returns (Fees) The default gas price.
 */
export const getDefaultFees = (): Fees => {
  return {
    type: 'base',
    average: baseAmount(30, ETH_DECIMAL),
    fast: baseAmount(35, ETH_DECIMAL),
    fastest: baseAmount(39, ETH_DECIMAL),
  }
}
