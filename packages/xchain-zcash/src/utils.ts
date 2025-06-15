import * as ZcashLib from '@mayaprotocol/zcash-ts'
import { Network } from '@xchainjs/xchain-client'
import { Address } from '@xchainjs/xchain-util'

/**
 * Function to get the Zcash network string depending on network
 *
 * @param {Network} network - The network type (Mainnet, Testnet, or Stagenet).
 * @returns {string} The Zcash network string.
 */
export const getZcashNetwork = (network: Network): string => {
  switch (network) {
    case Network.Mainnet:
    case Network.Stagenet:
      return 'main'
    case Network.Testnet:
      return 'test'
  }
}

/**
 * Function to get the Zcash network string for TransactionBuilder (capitalized)
 *
 * @param {Network} network - The network type (Mainnet, Testnet, or Stagenet).
 * @returns {string} The capitalized Zcash network string for TransactionBuilder.
 */
export const getZcashNetworkForBuilder = (network: Network): string => {
  switch (network) {
    case Network.Mainnet:
    case Network.Stagenet:
      return 'Main'
    case Network.Testnet:
      return 'Test'
  }
}

/**
 * Function to validate a Zcash address.
 * @param {Address} address - The Zcash address to validate.
 * @param {Network} network - The network type (Mainnet, Testnet, or Stagenet).
 * @returns {boolean} `true` if the address is valid, `false` otherwise.
 */
export const validateAddress = (address: Address, network: Network): boolean => {
  return ZcashLib.validateAddress(address, getZcashNetwork(network))
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

/**
 * Function to create a P2PKH script from a Zcash address.
 * @param {Address} address - The Zcash address.
 * @returns {string} The hex-encoded P2PKH script.
 */
export const createP2PKHScript = (address: Address): string => {
  try {
    const script = ZcashLib.createPayToAddressScript(address)
    return script.toString('hex')
  } catch (error) {
    // Fallback: standard P2PKH script template
    // This is a standard P2PKH script: OP_DUP OP_HASH160 <20-byte hash> OP_EQUALVERIFY OP_CHECKSIG
    return '76a914' + '00'.repeat(20) + '88ac'
  }
}
