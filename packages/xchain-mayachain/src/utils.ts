import { Network, RootDerivationPaths, TxHash } from '@xchainjs/xchain-client'
import { Address, Asset, assetToString, eqAsset, isSynthAsset } from '@xchainjs/xchain-util'
import axios from 'axios'

import { AssetCacao, AssetMaya, CACAO_DENOM, MAYA_DENOM } from './const'

/**
 * Default explorer URL for the mainnet.
 */
const MAINNET_EXPLORER_URL = 'https://mayascan.org'

/**
 * Default explorer URL for the stagenet.
 */
const STAGENET_EXPLORER_URL = 'https://stagenet.mayascan.org'

/**
 * Get default client URLs based on the network.
 *
 * @returns {Record<Network, string>} Object containing default client URLs for each network.
 */
export const getDefaultClientUrls = (): Record<Network, string> => {
  return {
    [Network.Testnet]: 'deprecated',
    [Network.Stagenet]: 'https://stagenet.tendermint.mayachain.info',
    [Network.Mainnet]: 'https://tendermint.mayachain.info',
  }
}

/**
 * Get default root derivation paths based on the network.
 *
 * @returns {RootDerivationPaths} Object containing default root derivation paths for each network.
 */
export const getDefaultRootDerivationPaths = (): RootDerivationPaths => ({
  [Network.Mainnet]: `m/44'/931'/0'/0/`,
  [Network.Stagenet]: `m/44'/931'/0'/0/`,
  [Network.Testnet]: `m/44'/931'/0'/0/`,
})

/**
 * Get default explorers based on the network.
 *
 * @returns {Record<Network, string>} Object containing default explorer URLs for each network.
 */
export const getDefaultExplorers = (): Record<Network, string> => ({
  [Network.Mainnet]: MAINNET_EXPLORER_URL,
  [Network.Testnet]: 'deprecated',
  [Network.Stagenet]: STAGENET_EXPLORER_URL,
})

/**
 * Get explorer URL for the given address based on the network.
 *
 * @param {Address} address The address to generate the URL for.
 * @returns {Record<Network, string>} Object containing explorer URLs for the given address on each network.
 */
export const getExplorerAddressUrl = (address: Address): Record<Network, string> => ({
  [Network.Mainnet]: `${MAINNET_EXPLORER_URL}/address/${address}`,
  [Network.Testnet]: 'deprecated',
  [Network.Stagenet]: `${STAGENET_EXPLORER_URL}/address/${address}`,
})

/**
 * Get explorer URL for the given transaction based on the network.
 *
 * @param {TxHash} tx The transaction hash to generate the URL for.
 * @returns {Record<Network, string>} Object containing explorer URLs for the given transaction on each network.
 */
export const getExplorerTxUrl = (tx: TxHash): Record<Network, string> => ({
  [Network.Mainnet]: `${MAINNET_EXPLORER_URL}/tx/${tx}`,
  [Network.Testnet]: 'deprecated',
  [Network.Stagenet]: `${STAGENET_EXPLORER_URL}/tx/${tx}`,
})

/**
 * Get denomination from Asset.
 *
 * @param {Asset} asset The asset to get the denomination for.
 * @returns {string} The denomination of the given asset.
 */
export const getDenom = (asset: Asset) => {
  if (eqAsset(asset, AssetCacao)) return CACAO_DENOM
  if (eqAsset(asset, AssetMaya)) return MAYA_DENOM
  if (isSynthAsset(asset)) return assetToString(asset).toLowerCase()
  return asset.symbol.toLowerCase()
}

/**
 * Helper function to get MayaChain's chain ID.
 *
 * @param {string} nodeUrl The MAYAnode URL.
 * @returns {Promise<string>} The chain ID.
 */
export const getChainId = async (nodeUrl: string): Promise<string> => {
  const { data } = await axios.get<{ default_node_info?: { network?: string } }>(
    `${nodeUrl}/cosmos/base/tendermint/v1beta1/node_info`,
  )
  return data?.default_node_info?.network || Promise.reject('Could not parse chain ID')
}

/**
 * Get address prefix by network.
 *
 * @param {Network} network The network to get the prefix for.
 * @returns {string} The address prefix.
 */
export const getPrefix = (network: Network) => {
  switch (network) {
    case Network.Mainnet:
      return 'maya'
    case Network.Stagenet:
      return 'smaya'
    case Network.Testnet:
      return 'tmaya'
  }
}
