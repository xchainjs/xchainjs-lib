import { useState } from 'react'

// Override map for assets missing from or wrong in the cryptocurrency-icons CDN
const ICON_OVERRIDES: Record<string, string> = {
  THOR: 'https://assets.coingecko.com/coins/images/6595/standard/Rune200x200.png',
  MAYA: 'https://assets.coingecko.com/coins/images/29512/standard/cacao.png',
  KUJI: 'https://assets.coingecko.com/coins/images/20685/standard/kuji-200x200.png',
  ARB: 'https://assets.coingecko.com/coins/images/16547/standard/photo_2023-03-29_21.47.00.jpeg',
}

// Maps chainId to a lowercase symbol the CDN understands
const CDN_SYMBOL_MAP: Record<string, string> = {
  BTC: 'btc',
  BCH: 'bch',
  LTC: 'ltc',
  DOGE: 'doge',
  DASH: 'dash',
  ETH: 'eth',
  AVAX: 'avax',
  BSC: 'bnb',
  GAIA: 'atom',
  SOL: 'sol',
}

export function getAssetIconUrl(chainId: string): string {
  if (ICON_OVERRIDES[chainId]) return ICON_OVERRIDES[chainId]
  const symbol = CDN_SYMBOL_MAP[chainId] ?? chainId.toLowerCase()
  return `https://cdn.jsdelivr.net/npm/cryptocurrency-icons@0.18.1/svg/color/${symbol}.svg`
}

export const POPULAR_CHAIN_IDS = ['BTC', 'ETH', 'SOL', 'THOR', 'AVAX', 'GAIA'] as const

interface AssetIconProps {
  chainId: string
  symbol: string
  size?: number
  className?: string
}

export function AssetIcon({ chainId, symbol, size = 32, className = '' }: AssetIconProps) {
  const [hasError, setHasError] = useState(false)

  if (hasError) {
    return (
      <div
        className={`rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold ${className}`}
        style={{ width: size, height: size }}
      >
        {symbol.slice(0, 2)}
      </div>
    )
  }

  return (
    <img
      src={getAssetIconUrl(chainId)}
      alt={symbol}
      width={size}
      height={size}
      className={`rounded-full ${className}`}
      onError={() => setHasError(true)}
    />
  )
}
