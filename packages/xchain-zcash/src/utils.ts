import { isValidAddr, mainnetPrefix, testnetPrefix } from '@xchainjs/zcash-js'
import { Network } from '@xchainjs/xchain-client'
import { Address } from '@xchainjs/xchain-util'

export const zecNetworkPrefix = (network: Network): number[] => {
  switch (network) {
    case Network.Mainnet:
    case Network.Stagenet:
      return mainnetPrefix
    case Network.Testnet:
      return testnetPrefix
    default:
      return mainnetPrefix
  }
}

export const validateAddress = (address: Address, network: Network): boolean => {
  const prefix = zecNetworkPrefix(network)
  return isValidAddr(address, new Uint8Array(prefix))
}

export const getPrefix = (network: Network): string => {
  switch (network) {
    case Network.Mainnet:
    case Network.Stagenet:
      return 't1'
    case Network.Testnet:
      return 'tm'
  }
}
