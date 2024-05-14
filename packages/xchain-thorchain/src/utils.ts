/**
 * Import necessary modules and types for client URL configuration and utility functions.
 */
import { Network, RootDerivationPaths, TxHash } from '@xchainjs/xchain-client'
import { Address, Asset, assetToString, isSynthAsset } from '@xchainjs/xchain-util'
import axios from 'axios' // Import axios for making HTTP requests

//Import necessary constants for default client URLs
import { AssetRuneNative as AssetRUNE, DEFAULT_EXPLORER_URL, RUNE_DENOM } from './const'

/**
 * Function to retrieve default client URLs based on network configuration.
 */
export const getDefaultClientUrls = (): Record<Network, string[]> => {
  return {
    [Network.Testnet]: ['deprecated'],
    [Network.Stagenet]: ['https://stagenet-rpc.ninerealms.com'],
    [Network.Mainnet]: ['https://rpc-v1.ninerealms.com'],
  }
}
/**
 * Function to retrieve default root derivation paths based on network configuration.
 */
export const getDefaultRootDerivationPaths = (): RootDerivationPaths => ({
  [Network.Mainnet]: `m/44'/931'/0'/0/`,
  [Network.Stagenet]: `m/44'/931'/0'/0/`,
  [Network.Testnet]: `m/44'/931'/0'/0/`,
})
/**
 * Function to retrieve default explorers URLs based on network configuration.
 */
export const getDefaultExplorers = (): Record<Network, string> => ({
  [Network.Mainnet]: DEFAULT_EXPLORER_URL,
  [Network.Testnet]: 'deprecated',
  [Network.Stagenet]: `${DEFAULT_EXPLORER_URL}/?network=stagenet`,
})
/**
 * Function to generate explorer URLs for addresses based on the network.
 */
export const getExplorerAddressUrl = (address: Address): Record<Network, string> => ({
  [Network.Mainnet]: `${DEFAULT_EXPLORER_URL}/address/${address}`,
  [Network.Testnet]: 'deprecated',
  [Network.Stagenet]: `${DEFAULT_EXPLORER_URL}/address/${address}?network=stagenet`,
})
/**
 * Function to generate explorer URLs for transactions based on the network.
 */
export const getExplorerTxUrl = (tx: TxHash): Record<Network, string> => ({
  [Network.Mainnet]: `${DEFAULT_EXPLORER_URL}/tx/${tx}`,
  [Network.Testnet]: 'deprecated',
  [Network.Stagenet]: `${DEFAULT_EXPLORER_URL}/tx/${tx}?network=stagenet`,
})

/**
 * Checks whether an asset is the native RUNE asset
 *
 * @param {Asset} asset
 * @returns {boolean} `true` or `false`
 */
export const isAssetRuneNative = (asset: Asset): boolean => assetToString(asset) === assetToString(AssetRUNE)

/**
 * Get denomination from Asset
 *
 * @param {Asset} asset
 * @returns {string} The denomination of the given asset
 */
export const getDenom = (asset: Asset) => {
  if (isAssetRuneNative(asset)) return RUNE_DENOM
  if (isSynthAsset(asset)) return assetToString(asset).toLowerCase()
  return asset.symbol.toLowerCase()
}

/**
 * Get chain id from node url
 *
 * @param {string} nodeUrl
 * @returns {Promise<string>} the chainId
 */
export const getChainId = async (nodeUrl: string): Promise<string> => {
  // Axios is used to make an HTTP GET request to retrieve the chain ID.
  const { data } = await axios.get<{ default_node_info?: { network?: string } }>(
    `${nodeUrl}/cosmos/base/tendermint/v1beta1/node_info`,
  )
  // Parse the chain ID from the response data.
  return data?.default_node_info?.network || Promise.reject('Could not parse chain id')
}

/**
 * Get address prefix by network
 * @param {Network} network The network of which return the prefix
 * @returns The address prefix
 */
export const getPrefix = (network: Network): string => {
  // Return the appropriate prefix based on the network.
  switch (network) {
    case Network.Mainnet:
      return 'thor'
    case Network.Stagenet:
      return 'sthor'
    case Network.Testnet:
      return 'tthor'
  }
}
