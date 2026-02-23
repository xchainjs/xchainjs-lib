import { Check, AlertTriangle, X, Clock, Percent } from 'lucide-react'
import { baseToAsset, formatAssetAmountCurrency } from '@xchainjs/xchain-util'
import type { SwapQuote } from '../../lib/swap/SwapService'
import { usePrices, formatUsdValue } from '../../hooks/usePrices'

interface QuoteCardProps {
  quote: SwapQuote
  isSelected: boolean
  onSelect: () => void
  isBest?: boolean
}

export function QuoteCard({ quote, isSelected, onSelect, isBest = false }: QuoteCardProps) {
  const prices = usePrices()
  const expectedAmountFormatted = formatExpectedAmount(quote)
  const slippagePercent = (quote.slipBasisPoints / 100).toFixed(2)
  const estimatedTime = formatTime(quote.totalSwapSeconds)

  const canSwap = quote.canSwap && quote.errors.length === 0

  // Calculate USD value of expected output
  const expectedUsdValue = prices.getValue(quote.expectedAmount)

  return (
    <button
      type="button"
      onClick={onSelect}
      disabled={!canSwap}
      className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
        isSelected
          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30'
          : canSwap
          ? 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 bg-white dark:bg-gray-800'
          : 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 cursor-not-allowed opacity-75'
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-gray-900 dark:text-gray-100">{quote.protocol}</span>
          {isBest && canSwap && (
            <span className="px-2 py-0.5 text-xs font-medium bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-400 rounded-full">
              Best Rate
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {canSwap ? (
            <Check className="w-5 h-5 text-green-500" />
          ) : (
            <X className="w-5 h-5 text-red-500" />
          )}
        </div>
      </div>

      {/* Expected Output */}
      <div className="mb-3">
        <div className="text-sm text-gray-500 dark:text-gray-400">Expected Output</div>
        <div className="text-xl font-bold text-gray-900 dark:text-gray-100">
          {expectedAmountFormatted}
        </div>
        {expectedUsdValue !== null && (
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {formatUsdValue(expectedUsdValue)}
          </div>
        )}
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="flex items-center gap-2">
          <Percent className="w-4 h-4 text-gray-400" />
          <div>
            <span className="text-gray-500 dark:text-gray-400">Slippage: </span>
            <span
              className={`font-medium ${
                quote.slipBasisPoints > 100
                  ? 'text-yellow-600 dark:text-yellow-400'
                  : 'text-gray-900 dark:text-gray-100'
              }`}
            >
              {slippagePercent}%
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-gray-400" />
          <div>
            <span className="text-gray-500 dark:text-gray-400">Time: </span>
            <span className="font-medium text-gray-900 dark:text-gray-100">{estimatedTime}</span>
          </div>
        </div>
      </div>

      {/* Fees */}
      <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-500 dark:text-gray-400">Affiliate Fee:</span>
          <span className="text-gray-900 dark:text-gray-100">
            {formatFee(quote.fees.affiliateFee)}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500 dark:text-gray-400">Outbound Fee:</span>
          <span className="text-gray-900 dark:text-gray-100">
            {formatFee(quote.fees.outboundFee)}
          </span>
        </div>
      </div>

      {/* Warning */}
      {quote.warning && (
        <div className="mt-3 flex items-start gap-2 p-2 bg-yellow-50 dark:bg-yellow-900/30 rounded text-sm">
          <AlertTriangle className="w-4 h-4 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
          <span className="text-yellow-700 dark:text-yellow-300">{quote.warning}</span>
        </div>
      )}

      {/* Errors */}
      {quote.errors.length > 0 && (
        <div className="mt-3 space-y-1">
          {quote.errors.map((error, i) => (
            <div
              key={i}
              className="flex items-start gap-2 p-2 bg-red-50 dark:bg-red-900/30 rounded text-sm"
            >
              <X className="w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <span className="text-red-700 dark:text-red-300">{error}</span>
            </div>
          ))}
        </div>
      )}
    </button>
  )
}

function formatExpectedAmount(quote: SwapQuote): string {
  try {
    const assetAmount = baseToAsset(quote.expectedAmount.baseAmount)
    return formatAssetAmountCurrency({
      amount: assetAmount,
      asset: quote.expectedAmount.asset,
      trimZeros: true,
    })
  } catch {
    return quote.expectedAmount.baseAmount.amount().toString()
  }
}

function formatFee(fee: SwapQuote['fees']['affiliateFee']): string {
  try {
    const assetAmount = baseToAsset(fee.baseAmount)
    return formatAssetAmountCurrency({
      amount: assetAmount,
      asset: fee.asset,
      trimZeros: true,
    })
  } catch {
    return fee.baseAmount.amount().toString()
  }
}

function formatTime(seconds: number): string {
  if (seconds < 60) {
    return `~${Math.round(seconds)}s`
  }
  const minutes = Math.round(seconds / 60)
  return `~${minutes}m`
}
