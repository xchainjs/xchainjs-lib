import { Uint53 } from '@cosmjs/math'
import { Network, RootDerivationPaths, TxHash } from '@xchainjs/xchain-client'
import { Address, AssetType, assetToString, isSecuredAsset, isSynthAsset } from '@xchainjs/xchain-util'
import axios from 'axios'
import {
  AssetRUJI,
  AssetRuneNative as AssetRUNE,
  AssetTCY,
  DEFAULT_EXPLORER_URL,
  RUJI_DENOM,
  RUNE_DENOM,
  TCY_DENOM,
} from './const'
import { CompatibleAsset } from './types'

export const getDefaultClientUrls = (): Record<Network, string[]> => {
  return {
    [Network.Testnet]: ['deprecated'],
    [Network.Stagenet]: [],
    [Network.Mainnet]: ['https://gateway.liquify.com/chain/thorchain_rpc'],
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

export const isAssetRuneNative = (asset: CompatibleAsset): boolean => assetToString(asset) === assetToString(AssetRUNE)

export const isTCYAsset = (asset: CompatibleAsset): boolean => assetToString(asset) === assetToString(AssetTCY)

export const isRUJIAsset = (asset: CompatibleAsset): boolean => assetToString(asset) === assetToString(AssetRUJI)

export const getDenom = (asset: CompatibleAsset) => {
  if (isAssetRuneNative(asset)) return RUNE_DENOM
  if (isSynthAsset(asset)) return assetToString(asset).toLowerCase()
  if (isSecuredAsset(asset)) return assetToString(asset).toLowerCase()
  if (isTCYAsset(asset)) return TCY_DENOM
  if (isRUJIAsset(asset)) return RUJI_DENOM
  return assetToString(asset).toLowerCase()
}

export const getChainId = async (nodeUrl: string): Promise<string> => {
  const { data } = await axios.get<{ default_node_info?: { network?: string } }>(
    `${nodeUrl}/cosmos/base/tendermint/v1beta1/node_info`,
  )
  return data?.default_node_info?.network || Promise.reject('Could not parse chain id')
}

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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function sortAndStringifyJson(obj: any): string {
  return JSON.stringify(sortedObject(obj))
}

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
