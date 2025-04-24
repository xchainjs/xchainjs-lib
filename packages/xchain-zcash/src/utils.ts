import { getPrefix as getLowLevelPrefix, isValidAddr } from '@hippocampus-web3/zcash-wallet-js' // Importing the Network type from xchain-client module
import { Network } from '@xchainjs/xchain-client' // Importing the Address type from xchain-util module
import { Address } from '@xchainjs/xchain-util'

/**
 * Function to get the Zcash prefix depending on network
 *
 * @param {Network} network - The network type (Mainnet, Testnet, or Stagenet).
 * @returns {utxolib.Network} The Zcash network.
 */
export const zecNetworkPrefix = (network: Network) => {
  switch (network) {
    case Network.Mainnet:
    case Network.Stagenet:
      return getLowLevelPrefix('mainnet')
    case Network.Testnet:
      return getLowLevelPrefix('testnet')
  }
}

/**
 * Function to validate a Zcash address.
 * @param {Address} address - The Zcash address to validate.
 * @param {Network} network - The network type (Mainnet, Testnet, or Stagenet).
 * @returns {boolean} `true` if the address is valid, `false` otherwise.
 */
export const validateAddress = (address: Address, network: Network): boolean => {
  return isValidAddr(address, Buffer.from(zecNetworkPrefix(network)))
}

/**
 * Function to get the address prefix based on the network.
 * @param {Network} network - The network type (Mainnet, Testnet, or Stagenet).
 * @returns {string} The address prefix based on the network.
 */
export const getPrefix = (network: Network): string => {
  switch (network) {
    case Network.Mainnet:
    case Network.Stagenet:
      return 't1'
    case Network.Testnet:
      return 'tm'
  }
}
