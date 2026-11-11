import { Asset as CAsset, AssetData, Chain as CChain, Chains } from '@chainflip/sdk/swap'
import {
  Asset as XAsset,
  AssetType,
  Chain as XChain,
  TokenAsset as XTokenAsset,
  isTokenAsset,
} from '@xchainjs/xchain-util'

export const cChainToXChain = (chain: CChain): XChain | null => {
  switch (chain) {
    case 'Bitcoin':
      return 'BTC'
    case 'Ethereum':
      return 'ETH'
    case 'Arbitrum':
      return 'ARB'
    case 'Solana':
      return 'SOL'
    case 'Tron':
      return 'TRON'
    case 'Bsc':
      return 'BSC'
    default:
      return null
  }
}

export const xChainToCChain = (chain: XChain): CChain | null => {
  switch (chain) {
    case 'BTC':
      return Chains.Bitcoin
    case 'ETH':
      return Chains.Ethereum
    case 'ARB':
      return Chains.Arbitrum
    case 'SOL':
      return Chains.Solana
    case 'TRON':
      return Chains.Tron
    case 'BSC':
      return Chains.Bsc
    default:
      return null
  }
}

export const cAssetToXAsset = (asset: AssetData): XAsset | XTokenAsset => {
  const chain = cChainToXChain(asset.chain)
  if (!chain) throw Error()
  return {
    chain,
    ticker: asset.contractAddress ? `${asset.symbol}-${asset.contractAddress}` : asset.symbol,
    symbol: asset.symbol,
    type: asset.contractAddress ? AssetType.TOKEN : AssetType.NATIVE,
  }
}

export const xAssetToCAsset = (asset: XAsset | XTokenAsset): CAsset => {
  return asset.ticker as CAsset
}

/**
 * A Chainflip token is only the same asset when the xchainjs token carries the same contract.
 * A native Chainflip asset only matches a native xchainjs asset. Ticker and chain alone are not
 * enough: another token with the same ticker on the same chain must not resolve to it.
 * Compared case-insensitively because xchainjs asset strings are often upper-cased (for example
 * from THORChain pool ids). A case-only collision with a real base58 mint is not practical to create.
 */
export const isSameContract = (asset: XAsset | XTokenAsset, assetData: AssetData): boolean => {
  if (!assetData.contractAddress) return !isTokenAsset(asset)
  if (!isTokenAsset(asset)) return false
  const contract = asset.symbol.slice(asset.ticker.length + 1)
  return contract.toLowerCase() === assetData.contractAddress.toLowerCase()
}
