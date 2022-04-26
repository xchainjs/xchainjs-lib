import { Asset, Chain } from '@xchainjs/xchain-util'

const xhvAsset: Asset = {
  symbol: 'XHV',
  ticker: 'XHV',
  synth: false,
  chain: Chain.Haven,
}

const xUSDAsset: Asset = {
  symbol: 'xUSD',
  ticker: 'xUSD',
  synth: true,
  chain: Chain.Haven,
}

const assets = [xhvAsset, xUSDAsset]

export const getAsset = (ticker: string): Asset => {
  const asset = assets.find((asset: Asset) => ticker.toLowerCase() === asset.ticker.toLowerCase())
  if (!asset) {
    throw 'no asset added in assets.ts for ticker ' + ticker
  }

  return asset
}
