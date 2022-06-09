import { Asset, Chain } from '@xchainjs/xchain-util'

import { isHavenTicker } from './utils'

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

export const createAssetByTicker = (ticker: string): Asset => {
  if (isHavenTicker(ticker)) {
    throw Error(`${ticker} is not a valid Haven Asset`)
  }

  const isSynth = ticker !== 'XHV'

  return {
    symbol: ticker,
    ticker,
    chain: Chain.Haven,
    synth: isSynth,
  }
}
