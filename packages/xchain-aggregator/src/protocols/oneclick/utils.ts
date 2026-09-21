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
  NEAR: 'near',
}

const ONECLICK_TO_X: Record<string, string> = Object.fromEntries(Object.entries(X_TO_ONECLICK).map(([k, v]) => [v, k]))

/**
 * 1Click rejects empty `refundTo` / `recipient` even on dry quotes.
 * Named NEAR accounts such as this one are accepted for preview-only requests.
 */
export const ONECLICK_PREVIEW_ADDRESS = 'aurora'

/**
 * 1Click requires a digit-only integer string (base units).
 * `BigNumber#toString()` emits scientific notation past its exponential threshold,
 * which 24-decimal NEAR amounts cross (`"7.7e+24"`). Fractional parts truncate toward zero.
 */
export const toOneClickAmountString = (amount: string): string => {
  const trimmed = amount.trim()
  if (/^\d+$/.test(trimmed)) return trimmed

  const match = trimmed.toLowerCase().match(/^([+-]?)(\d+)(?:\.(\d+))?(?:e([+-]?\d+))?$/)
  if (!match) return trimmed

  const negative = match[1] === '-'
  const intPart = match[2]
  const fracPart = match[3] ?? ''
  const exp = parseInt(match[4] ?? '0', 10)
  const digits = intPart + fracPart
  const newExp = exp - fracPart.length

  let result: string
  if (newExp >= 0) {
    result = digits + '0'.repeat(newExp)
  } else {
    const split = digits.length + newExp
    result = split <= 0 ? '0' : digits.slice(0, split) || '0'
  }
  result = result.replace(/^0+(?=\d)/, '') || '0'
  return negative ? '0' : result
}

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

    // 1Click exposes NEAR as wNEAR (wrap.near), not a contract-less native entry.
    if (asset.chain === 'NEAR') {
      return (
        token.contractAddress === 'wrap.near' ||
        token.assetId === 'nep141:wrap.near' ||
        token.symbol.toUpperCase() === 'WNEAR'
      )
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

  // Surface wrap.near as native NEAR for XChain consumers / suite UX.
  if (chain === 'NEAR' && (token.contractAddress === 'wrap.near' || token.assetId === 'nep141:wrap.near')) {
    return { chain, symbol: 'NEAR', ticker: 'NEAR', type: AssetType.NATIVE }
  }

  if (token.contractAddress) {
    const symbol = `${token.symbol}-${token.contractAddress}`
    return { chain, symbol, ticker: token.symbol, type: AssetType.TOKEN }
  }

  return { chain, symbol: token.symbol, ticker: token.symbol, type: AssetType.NATIVE }
}
