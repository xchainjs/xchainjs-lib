import { Network, RootDerivationPaths, TxHash } from '@xchainjs/xchain-client'
import { Address, Asset, assetToString } from '@xchainjs/xchain-util'

import { AssetRUNE, DEFAULT_EXPLORER_URL } from './const'

export const getDefaultClientUrls = (): Record<Network, string> => {
  return {
    [Network.Testnet]: 'deprecated',
    [Network.Stagenet]: 'https://stagenet-rpc.ninerealms.com',
    [Network.Mainnet]: 'https://rpc-v1.ninerealms.com',
  }
}

export const getDefaultRootDerivationPaths = (): RootDerivationPaths => ({
  [Network.Mainnet]: `44'/931'/0'/0/`,
  [Network.Stagenet]: `44'/931'/0'/0/`,
  [Network.Testnet]: `44'/931'/0'/0/`,
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
export const isAssetRune = (asset: Asset): boolean => assetToString(asset) === assetToString(AssetRUNE)
