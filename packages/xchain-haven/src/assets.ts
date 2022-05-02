import { Asset, Chain } from '@xchainjs/xchain-util'

export const AssetXHV: Asset = {
  symbol: 'XHV',
  ticker: 'XHV',
  synth: false,
  chain: Chain.Haven,
}

export const AssetXUSD: Asset = {
  symbol: 'XUSD',
  ticker: 'XUSD',
  synth: true,
  chain: Chain.Haven,
}

const assets = [AssetXHV, AssetXUSD]

export const getAsset = (ticker: string): Asset => {
  const asset = assets.find((asset: Asset) => ticker.toLowerCase() === asset.ticker.toLowerCase())
  if (!asset) {
    throw 'no asset added in assets.ts for ticker ' + ticker
  }

  return asset
}
