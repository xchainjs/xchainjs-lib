import {
  AnyAsset,
  AssetType,
  Chain,
  isSecuredAsset,
  isSynthAsset,
  isTokenAsset,
  isTradeAsset,
} from '@xchainjs/xchain-util'

import { OneClickToken } from './types'

const X_TO_ONECLICK: Record<string, string> = {
  BTC: 'btc',
  ETH: 'eth',
  ARB: 'arb',
  AVAX: 'avax',
  BSC: 'bsc',
  SOL: 'sol',
  DOGE: 'doge',
  DASH: 'dash',
  LTC: 'ltc',
  BCH: 'bch',
  XRP: 'xrp',
  ADA: 'cardano',
  SUI: 'sui',
}

const ONECLICK_TO_X: Record<string, string> = Object.fromEntries(Object.entries(X_TO_ONECLICK).map(([k, v]) => [v, k]))

export const xChainToOneClickBlockchain = (chain: Chain): string | null => {
  return X_TO_ONECLICK[chain] ?? null
}

export const oneClickBlockchainToXChain = (blockchain: string): Chain | null => {
  return (ONECLICK_TO_X[blockchain] as Chain) ?? null
}

export const findOneClickToken = (asset: AnyAsset, tokens: OneClickToken[]): OneClickToken | undefined => {
  if (isSynthAsset(asset) || isTradeAsset(asset) || isSecuredAsset(asset)) return undefined

  const blockchain = xChainToOneClickBlockchain(asset.chain)
  if (!blockchain) return undefined

  return tokens.find((token) => {
    if (token.blockchain !== blockchain) return false

    if (isTokenAsset(asset)) {
      // Match by contract address (case-insensitive)
      const assetContract = asset.symbol.includes('-') ? asset.symbol.split('-')[1] : undefined
      return assetContract && token.contractAddress
        ? token.contractAddress.toLowerCase() === assetContract.toLowerCase()
        : false
    }

    // Native asset: match by symbol, ensure no contract address on token
    return token.symbol.toUpperCase() === asset.symbol.toUpperCase() && !token.contractAddress
  })
}

export const oneClickTokenToXAsset = (
  token: OneClickToken,
): { chain: Chain; symbol: string; ticker: string; type: AssetType } | null => {
  const chain = oneClickBlockchainToXChain(token.blockchain)
  if (!chain) return null

  if (token.contractAddress) {
    const symbol = `${token.symbol}-${token.contractAddress}`
    return { chain, symbol, ticker: symbol, type: AssetType.TOKEN }
  }

  return { chain, symbol: token.symbol, ticker: token.symbol, type: AssetType.NATIVE }
}
