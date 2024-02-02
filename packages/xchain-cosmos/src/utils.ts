import { Network, RootDerivationPaths } from '@xchainjs/xchain-client'
import { Asset, eqAsset } from '@xchainjs/xchain-util'
import axios from 'axios'

import { ATOM_DENOM, AssetATOM } from './const'

const MAINNET_EXPLORER_URL = 'https://bigdipper.live/cosmos'

const TESTNET_EXPLORER_URL = 'https://explorer.theta-testnet.polypore.xyz'

export const getDefaultClientUrls = (): Record<Network, string> => {
  return {
    [Network.Testnet]: 'https://rpc.sentry-02.theta-testnet.polypore.xyz',
    [Network.Stagenet]: 'https://rpc.cosmos.directory/cosmoshub',
    [Network.Mainnet]: 'https://rpc.cosmos.directory/cosmoshub',
  }
}

export const getDefaultRootDerivationPaths = (): RootDerivationPaths => ({
  [Network.Mainnet]: `m/44'/118'/0'/0/`,
  [Network.Testnet]: `m/44'/118'/0'/0/`,
  [Network.Stagenet]: `m/44'/118'/0'/0/`,
})

export const getDefaultExplorers = (): Record<Network, string> => ({
  [Network.Mainnet]: MAINNET_EXPLORER_URL,
  [Network.Testnet]: TESTNET_EXPLORER_URL,
  [Network.Stagenet]: MAINNET_EXPLORER_URL,
})

/**
 * Get denomination from Asset - currently `ATOM` supported only
 *
 * @param {Asset} asset
 * @returns {string} The denomination of the given asset.
 */
export const getDenom = (asset: Asset): string | null => {
  if (eqAsset(asset, AssetATOM)) return ATOM_DENOM
  return null
}

/**
 * Get chain id from node url
 *
 * @param {string} url
 * @returns {string} the chainId
 */
export const getChainId = async (url: string): Promise<string> => {
  const { data } = await axios.get<{ node_info: { network: string } }>(`${url}/node_info`)
  return data?.node_info?.network || Promise.reject('Could not parse chain id')
}

/**
 * Get address prefix based on the network.
 *
 * @returns {string} The address prefix based on the network.
 **/
export const getPrefix = () => 'cosmos'
