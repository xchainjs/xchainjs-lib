import { Asset as CAsset, AssetData, Chain as CChain, Chains } from '@chainflip/sdk/swap'
import { Asset as XAsset, AssetType, Chain as XChain, TokenAsset as XTokenAsset } from '@xchainjs/xchain-util'

export const cChainToXChain = (chain: CChain): XChain | null => {
  switch (chain) {
    case 'Bitcoin':
      return 'BTC'
    case 'Ethereum':
      return 'ETH'
    case 'Polkadot':
      return 'POL'
    case 'Arbitrum':
      return 'ARB'
    case 'Solana':
      return 'SOL'
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
    case 'POL':
      return Chains.Polkadot
    case 'ARB':
      return Chains.Arbitrum
    case 'SOL':
      return Chains.Solana
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
