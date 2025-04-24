/**
 * Import necessary modules and types for client URL configuration and utility functions.
 */
import { Uint53 } from '@cosmjs/math'
import { Network, RootDerivationPaths, TxHash } from '@xchainjs/xchain-client'
import { Address, AssetType, assetToString, isSecuredAsset, isSynthAsset } from '@xchainjs/xchain-util' // Import axios for making HTTP requests
import axios from 'axios'
//Import necessary constants for default client URLs
import { AssetRuneNative as AssetRUNE, DEFAULT_EXPLORER_URL, RUNE_DENOM } from './const'
import { CompatibleAsset } from './types'

/**
 * Function to retrieve default client URLs based on network configuration.
 */
export const getDefaultClientUrls = (): Record<Network, string[]> => {
  return {
    [Network.Testnet]: ['deprecated'],
    [Network.Stagenet]: ['https://stagenet-rpc.ninerealms.com'],
    [Network.Mainnet]: ['https://rpc.ninerealms.com'],
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
 * @param {CompatibleAsset} asset
 * @returns {boolean} `true` or `false`
 */
export const isAssetRuneNative = (asset: CompatibleAsset): boolean => assetToString(asset) === assetToString(AssetRUNE)

/**
 * Get denomination from Asset
 *
 * @param {CompatibleAsset} asset
 * @returns {string} The denomination of the given asset
 */
export const getDenom = (asset: CompatibleAsset) => {
  if (isAssetRuneNative(asset)) return RUNE_DENOM
  if (isSynthAsset(asset)) return assetToString(asset).toLowerCase()
  if (isSecuredAsset(asset)) return assetToString(asset).toLowerCase()
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

/**
 * Parse the derivation path from a string to an Array of numbers
 * @param {string} path - Path to parse
 * @returns {number[]} - The derivation path as Array of numbers
 */
export const parseDerivationPath = (path: string): number[] => {
  if (!path.startsWith('m')) throw new Error("Path string must start with 'm'")
  let rest = path.slice(1)

  const out = new Array<number>()
  while (rest) {
    const match = rest.match(/^\/([0-9]+)('?)/)
    if (!match) throw new Error('Syntax error while reading path component')
    const [fullMatch, numberString] = match
    const value = Uint53.fromString(numberString).toNumber()
    if (value >= 2 ** 31) throw new Error('Component value too high. Must not exceed 2**31-1.')
    out.push(value)
    rest = rest.slice(fullMatch.length)
  }
  return out
}

/**
 * Sort JSON object
 * @param {any} obj - JSON object
 * @returns {any} JSON object sorted
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function sortedObject(obj: any): any {
  if (typeof obj !== 'object' || obj === null) {
    return obj
  }
  if (Array.isArray(obj)) {
    return obj.map(sortedObject)
  }
  const sortedKeys = Object.keys(obj).sort()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result: Record<string, any> = {}
  // NOTE: Use forEach instead of reduce for performance with large objects eg Wasm code
  sortedKeys.forEach((key) => {
    result[key] = sortedObject(obj[key])
  })
  return result
}

/**
 * Returns a JSON string with objects sorted by key
 * */
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any
export function sortAndStringifyJson(obj: any): string {
  return JSON.stringify(sortedObject(obj))
}

/**
 * Parse XChainJS asset to Thornode asset
 */
export const parseAssetToTHORNodeAsset = (
  asset: CompatibleAsset,
): {
  chain: string
  symbol: string
  ticker: string
  synth: boolean
  trade: boolean
  secured: boolean
} => {
  return {
    chain: asset.chain,
    symbol: asset.symbol,
    ticker: asset.ticker,
    synth: asset.type === AssetType.SYNTH,
    trade: asset.type === AssetType.TRADE,
    secured: asset.type === AssetType.SECURED,
  }
}
