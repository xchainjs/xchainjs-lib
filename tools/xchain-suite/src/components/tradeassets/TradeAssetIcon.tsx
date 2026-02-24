import { AssetIcon } from '../swap/assetIcons'

interface TradeAssetIconProps {
  chainId: string
  symbol: string
  size?: number
  className?: string
}

/**
 * Chain icon with a green "trade" overlay badge in the bottom-right corner.
 */
export function TradeAssetIcon({ chainId, symbol, size = 32, className = '' }: TradeAssetIconProps) {
  const badgeSize = Math.max(12, Math.round(size * 0.4))

  return (
    <div className={`relative inline-flex ${className}`} style={{ width: size, height: size }}>
      <AssetIcon chainId={chainId} symbol={symbol} size={size} />
      <div
        className="absolute -bottom-0.5 -right-0.5 rounded-full bg-gradient-to-br from-emerald-400 to-green-600 border-2 border-white dark:border-gray-800 flex items-center justify-center"
        style={{ width: badgeSize, height: badgeSize }}
      >
        <svg
          viewBox="0 0 12 12"
          fill="none"
          className="text-white"
          style={{ width: badgeSize * 0.6, height: badgeSize * 0.6 }}
        >
          <path d="M2 6h8M6 2l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </div>
  )
}
