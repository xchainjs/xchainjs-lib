import { Asset as CAsset, AssetData, Chain as CChain, Chains } from '@chainflip/sdk/swap'
import { Asset as XAsset, AssetType, Chain as XChain, TokenAsset as XTokenAsset } from '@xchainjs/xchain-util'

export const cChainToXChain = (chain: CChain): XChain => {
  switch (chain) {
    case 'Bitcoin':
      return 'BTC'
    case 'Ethereum':
      return 'ETH'
    case 'Polkadot':
      return 'POL'
    default:
      throw Error('Unsupported chain in XChainJS')
  }
}

export const xChainToCChain = (chain: XChain): CChain => {
  switch (chain) {
    case 'BTC':
      return Chains.Bitcoin
    case 'ETH':
      return Chains.Ethereum
    case 'POL':
      return Chains.Polkadot
    default:
      throw Error('Unsupported chain in Chainflip')
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
