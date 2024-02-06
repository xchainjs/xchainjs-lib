import { Network, RootDerivationPaths, TxHash } from '@xchainjs/xchain-client'
import { Address, Asset, assetToString, eqAsset, isSynthAsset } from '@xchainjs/xchain-util'
import axios from 'axios'

import { AssetCacao, AssetMaya, CACAO_DENOM, MAYA_DENOM } from './const'

const MAINNET_EXPLORER_URL = 'https://mayascan.org'

const STAGENET_EXPLORER_URL = 'https://stagenet.mayascan.org'

export const getDefaultClientUrls = (): Record<Network, string> => {
  return {
    [Network.Testnet]: 'deprecated',
    [Network.Stagenet]: 'https://stagenet.tendermint.mayachain.info',
    [Network.Mainnet]: 'https://tendermint.mayachain.info',
  }
}

export const getDefaultRootDerivationPaths = (): RootDerivationPaths => ({
  [Network.Mainnet]: `m/44'/931'/0'/0/`,
  [Network.Stagenet]: `m/44'/931'/0'/0/`,
  [Network.Testnet]: `m/44'/931'/0'/0/`,
})

export const getDefaultExplorers = (): Record<Network, string> => ({
  [Network.Mainnet]: MAINNET_EXPLORER_URL,
  [Network.Testnet]: 'deprecated',
  [Network.Stagenet]: STAGENET_EXPLORER_URL,
})

export const getExplorerAddressUrl = (address: Address): Record<Network, string> => ({
  [Network.Mainnet]: `${MAINNET_EXPLORER_URL}/address/${address}`,
  [Network.Testnet]: 'deprecated',
  [Network.Stagenet]: `${STAGENET_EXPLORER_URL}/address/${address}`,
})

export const getExplorerTxUrl = (tx: TxHash): Record<Network, string> => ({
  [Network.Mainnet]: `${MAINNET_EXPLORER_URL}/tx/${tx}`,
  [Network.Testnet]: 'deprecated',
  [Network.Stagenet]: `${STAGENET_EXPLORER_URL}/tx/${tx}`,
})

/**
 * Get denomination from Asset
 *
 * @param {Asset} asset
 * @returns {string} The denomination of the given asset.
 */
export const getDenom = (asset: Asset) => {
  if (eqAsset(asset, AssetCacao)) return CACAO_DENOM
  if (eqAsset(asset, AssetMaya)) return MAYA_DENOM
  if (isSynthAsset(asset)) return assetToString(asset).toLowerCase()
  return asset.symbol.toLowerCase()
}

/**
 * Helper to get mayachain's chain id
 * @param {string} nodeUrl MAYAnode url
 */
export const getChainId = async (nodeUrl: string): Promise<string> => {
  const { data } = await axios.get<{ default_node_info?: { network?: string } }>(
    `${nodeUrl}/cosmos/base/tendermint/v1beta1/node_info`,
  )
  return data?.default_node_info?.network || Promise.reject('Could not parse chain id')
}

/**
 * Get address prefix by network
 * @returns the address prefix
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
