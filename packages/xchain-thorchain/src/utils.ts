import { Network, RootDerivationPaths, TxHash } from '@xchainjs/xchain-client'
import { Address, Asset, assetToString, isSynthAsset } from '@xchainjs/xchain-util'
import axios from 'axios'

import { AssetRuneNative as AssetRUNE, DEFAULT_EXPLORER_URL, RUNE_DENOM } from './const'

export const getDefaultClientUrls = (): Record<Network, string> => {
  return {
    [Network.Testnet]: 'deprecated',
    [Network.Stagenet]: 'https://stagenet-rpc.ninerealms.com',
    [Network.Mainnet]: 'https://rpc-v1.ninerealms.com',
  }
}

export const getDefaultRootDerivationPaths = (): RootDerivationPaths => ({
  [Network.Mainnet]: `m/44'/931'/0'/0/`,
  [Network.Stagenet]: `m/44'/931'/0'/0/`,
  [Network.Testnet]: `m/44'/931'/0'/0/`,
})

export const getDefaultExplorers = (): Record<Network, string> => ({
  [Network.Mainnet]: DEFAULT_EXPLORER_URL,
  [Network.Testnet]: 'deprecated',
  [Network.Stagenet]: `${DEFAULT_EXPLORER_URL}/?network=stagenet`,
})

export const getExplorerAddressUrl = (address: Address): Record<Network, string> => ({
  [Network.Mainnet]: `${DEFAULT_EXPLORER_URL}/address/${address}`,
  [Network.Testnet]: 'deprecated',
  [Network.Stagenet]: `${DEFAULT_EXPLORER_URL}/address/${address}?network=stagenet`,
})

export const getExplorerTxUrl = (tx: TxHash): Record<Network, string> => ({
  [Network.Mainnet]: `${DEFAULT_EXPLORER_URL}/tx/${tx}`,
  [Network.Testnet]: 'deprecated',
  [Network.Stagenet]: `${DEFAULT_EXPLORER_URL}/tx/${tx}?network=stagenet`,
})

/**
 * Checks whether an asset is `AssetRUNE`
 * @param {Asset} asset
 * @returns {boolean} `true` or `false`
 */
export const isAssetRuneNative = (asset: Asset): boolean => assetToString(asset) === assetToString(AssetRUNE)

/**
 * Get denomination from Asset
 *
 * @param {Asset} asset
 * @returns {string} The denomination of the given asset.
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
 * @returns the chainId
 */
export const getChainId = async (nodeUrl: string): Promise<string> => {
  /**
   * TODO: To avoid axios dependency. ChainId can be retrieved from the Stargate client, to achieve this,
   * getChainId has to work with JSON-RPC endpoint instead of REST endpoints
   */
  const { data } = await axios.get<{ default_node_info?: { network?: string } }>(
    `${nodeUrl}/cosmos/base/tendermint/v1beta1/node_info`,
  )
  return data?.default_node_info?.network || Promise.reject('Could not parse chain id')
}

/**
 * Get address prefix by network
 * @param {Network} network The network of which return the prefix
 * @returns the address prefix
 */
export const getPrefix = (network: Network): string => {
  switch (network) {
    case Network.Mainnet:
      return 'thor'
    case Network.Stagenet:
      return 'sthor'
    case Network.Testnet:
      return 'tthor'
  }
}
