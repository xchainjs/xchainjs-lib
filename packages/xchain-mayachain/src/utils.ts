import { Network, RootDerivationPaths, TxHash } from '@xchainjs/xchain-client'
import { Address, AssetType, assetToString, eqAsset, isSynthAsset } from '@xchainjs/xchain-util'
import axios from 'axios'
import { Uint53 } from '@cosmjs/math'

import { AssetCacao, AssetMaya, CACAO_DENOM, MAYA_DENOM } from './const'
import { CompatibleAsset } from './types'

const MAINNET_EXPLORER_URL = 'https://www.explorer.mayachain.info'

const STAGENET_EXPLORER_URL = 'https://www.explorer.mayachain.info'

export const getDefaultClientUrls = (): Record<Network, string[]> => {
  return {
    [Network.Testnet]: ['deprecated'],
    [Network.Stagenet]: ['https://stagenet.tendermint.mayachain.info'],
    [Network.Mainnet]: ['https://tendermint.mayachain.info', 'https://rpc-maya.liquify.com'],
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

export const getDenom = (asset: CompatibleAsset) => {
  if (eqAsset(asset, AssetCacao)) return CACAO_DENOM
  if (eqAsset(asset, AssetMaya)) return MAYA_DENOM
  if (isSynthAsset(asset)) return assetToString(asset).toLowerCase()
  return asset.symbol.toLowerCase()
}

export const getChainId = async (nodeUrl: string): Promise<string> => {
  const { data } = await axios.get<{ default_node_info?: { network?: string } }>(
    `${nodeUrl}/cosmos/base/tendermint/v1beta1/node_info`,
  )
  return data?.default_node_info?.network || Promise.reject('Could not parse chain ID')
}

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

export const parseAssetToMayanodeAsset = (
  asset: CompatibleAsset,
): {
  chain: string
  symbol: string
  ticker: string
  synth: boolean
  trade: boolean
} => {
  return {
    chain: asset.chain,
    symbol: asset.symbol,
    ticker: asset.ticker,
    synth: asset.type === AssetType.SYNTH,
    trade: asset.type === AssetType.TRADE,
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
