import { Network, RootDerivationPaths } from '@xchainjs/xchain-client'
import { eqAsset } from '@xchainjs/xchain-util'
import axios from 'axios'

import { ATOM_DENOM, AssetATOM } from './const'
import { CompatibleAsset } from './types'

// Explorer URLs for Mainnet and Testnet
const MAINNET_EXPLORER_URL = 'https://bigdipper.live/cosmos'
const TESTNET_EXPLORER_URL = 'https://explorer.theta-testnet.polypore.xyz'

/**
 * Function to retrieve default RPC client URLs for different networks.
 * Returns a mapping of network to its corresponding RPC client URL.
 *
 * @returns {Record<Network, string>} Default RPC client URLs for different networks.
 */
export const getDefaultClientUrls = (): Record<Network, string[]> => {
  return {
    [Network.Testnet]: ['https://rpc.sentry-02.theta-testnet.polypore.xyz'],
    [Network.Stagenet]: ['https://cosmos-rpc.publicnode.com', 'https://rpc.cosmos.directory/cosmoshub'],
    [Network.Mainnet]: ['https://cosmos-rpc.publicnode.com', 'https://rpc.cosmos.directory/cosmoshub'],
  }
}

/**
 * Function to retrieve default root derivation paths for different networks.
 * Returns a mapping of network to its corresponding root derivation path.
 *
 * @returns {RootDerivationPaths} Default root derivation paths for different networks.
 */
export const getDefaultRootDerivationPaths = (): RootDerivationPaths => ({
  [Network.Mainnet]: `m/44'/118'/0'/0/`,
  [Network.Testnet]: `m/44'/118'/0'/0/`,
  [Network.Stagenet]: `m/44'/118'/0'/0/`,
})

/**
 * Function to retrieve default explorer URLs for different networks.
 * Returns a mapping of network to its corresponding explorer URL.
 *
 * @returns {Record<Network, string>} Default explorer URLs for different networks.
 */
export const getDefaultExplorers = (): Record<Network, string> => ({
  [Network.Mainnet]: MAINNET_EXPLORER_URL,
  [Network.Testnet]: TESTNET_EXPLORER_URL,
  [Network.Stagenet]: MAINNET_EXPLORER_URL,
})

/**
 * Function to get the denomination of a given asset.
 * Currently only supports 'ATOM'.
 *
 * @param {CompatibleAsset} asset The asset for which denomination is requested.
 * @returns {string} The denomination of the given asset, or null if not supported.
 */
export const getDenom = (asset: CompatibleAsset): string | null => {
  if (eqAsset(asset, AssetATOM)) return ATOM_DENOM
  return null
}

/**
 * Asynchronously fetches the chain ID from a node URL using an Axios HTTP GET request.
 *
 * @param {string} url The URL of the node.
 * @returns {string} A Promise that resolves to the chain ID.
 */
export const getChainId = async (url: string): Promise<string> => {
  const { data } = await axios.get<{ node_info: { network: string } }>(`${url}/node_info`)
  return data?.node_info?.network || Promise.reject('Could not parse chain id')
}

/**
 * Function to get the address prefix based on the network.
 *
 * @returns {string} The address prefix based on the network.
 */
export const getPrefix = () => 'cosmos'
