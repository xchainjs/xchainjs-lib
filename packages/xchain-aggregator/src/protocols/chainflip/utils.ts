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
 * BSC only: the Chainflip BscUsdt token matches only the xchainjs BSC token carrying the same
 * contract (case-insensitive), and native Bnb matches only the exact native BSC.BNB asset. Ticker
 * and chain alone are not enough on BSC. Other chains keep their existing ticker + chain matching.
 */
export const isSameBscAsset = (asset: XAsset | XTokenAsset, assetData: AssetData): boolean => {
  if (assetData.chain !== Chains.Bsc) return true
  if (!assetData.contractAddress) {
    // Exact native identity (BSC.BNB): a hand-built NATIVE asset with an extra symbol suffix must not match
    return (
      asset.type === AssetType.NATIVE &&
      asset.chain === 'BSC' &&
      asset.ticker === assetData.symbol &&
      asset.symbol === assetData.symbol
    )
  }
  if (!isTokenAsset(asset)) return false
  const contract = asset.symbol.slice(asset.ticker.length + 1)
  return contract.toLowerCase() === assetData.contractAddress.toLowerCase()
}
