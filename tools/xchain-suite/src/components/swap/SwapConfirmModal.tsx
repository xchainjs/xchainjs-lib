import { X, ArrowRight, AlertTriangle, Loader2 } from 'lucide-react'
import { baseToAsset, formatAssetAmountCurrency, assetToString, AssetType, type Asset } from '@xchainjs/xchain-util'
import type { ChainAsset } from './AssetSelector'
import type { SwapQuote } from '../../lib/swap/SwapService'
import { usePrices, formatUsdValue } from '../../hooks/usePrices'

interface SwapConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  fromAsset: ChainAsset
  toAsset: ChainAsset
  amount: string
  quote: SwapQuote
  isExecuting: boolean
}

// Helper to build Asset from ChainAsset
function buildAssetFromChain(chainAsset: ChainAsset): Asset {
  return {
    chain: chainAsset.chainId,
    symbol: chainAsset.symbol,
    ticker: chainAsset.symbol,
    type: AssetType.NATIVE,
  }
}

export function SwapConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  fromAsset,
  toAsset,
  amount,
  quote,
  isExecuting,
}: SwapConfirmModalProps) {
  const prices = usePrices()

  if (!isOpen) return null

  const expectedOutput = formatExpectedAmount(quote)
  const slippagePercent = (quote.slipBasisPoints / 100).toFixed(2)

  // Calculate USD values
  const fromAssetObj = buildAssetFromChain(fromAsset)
  const inputUsdValue = prices.calculateValue(parseFloat(amount) || 0, fromAssetObj)
  const outputUsdValue = prices.getValue(quote.expectedAmount)

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50" onClick={!isExecuting ? onClose : undefined} />

      {/* Modal */}
      <div className="relative z-[101] w-full max-w-md bg-white dark:bg-gray-800 rounded-xl shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Confirm Swap</h2>
          {!isExecuting && (
            <button
              onClick={onClose}
              className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Swap Visual */}
          <div className="flex items-center justify-center gap-4">
            <div className="text-center">
              <div className="w-12 h-12 mx-auto rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                {fromAsset.symbol.slice(0, 2)}
              </div>
              <div className="mt-2 font-medium text-gray-900 dark:text-gray-100">{amount}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">{fromAsset.symbol}</div>
              {inputUsdValue !== null && (
                <div className="text-xs text-gray-400 dark:text-gray-500">{formatUsdValue(inputUsdValue)}</div>
              )}
            </div>

            <ArrowRight className="w-6 h-6 text-gray-400" />

            <div className="text-center">
              <div className="w-12 h-12 mx-auto rounded-full bg-gradient-to-br from-green-500 to-teal-600 flex items-center justify-center text-white font-bold">
                {toAsset.symbol.slice(0, 2)}
              </div>
              <div className="mt-2 font-medium text-gray-900 dark:text-gray-100">
                {expectedOutput}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">{toAsset.symbol}</div>
              {outputUsdValue !== null && (
                <div className="text-xs text-gray-400 dark:text-gray-500">{formatUsdValue(outputUsdValue)}</div>
              )}
            </div>
          </div>

          {/* Details Table */}
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">Protocol</span>
              <span className="font-medium text-gray-900 dark:text-gray-100">{quote.protocol}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">Slippage</span>
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
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">Estimated Time</span>
              <span className="font-medium text-gray-900 dark:text-gray-100">
                {formatTime(quote.totalSwapSeconds)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">Destination Address</span>
              <span className="font-medium text-gray-900 dark:text-gray-100 font-mono text-xs truncate max-w-[200px]">
                {quote.toAddress}
              </span>
            </div>
          </div>

          {/* Fees */}
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 space-y-2 text-sm">
            <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
              Fees
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">Affiliate Fee</span>
              <span className="font-medium text-gray-900 dark:text-gray-100">
                {formatFee(quote.fees.affiliateFee)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">Outbound Fee</span>
              <span className="font-medium text-gray-900 dark:text-gray-100">
                {formatFee(quote.fees.outboundFee)}
              </span>
            </div>
          </div>

          {/* Warning */}
          {quote.warning && (
            <div className="flex items-start gap-2 p-3 bg-yellow-50 dark:bg-yellow-900/30 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0" />
              <span className="text-sm text-yellow-700 dark:text-yellow-300">{quote.warning}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            disabled={isExecuting}
            className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isExecuting}
            className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isExecuting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Swapping...
              </>
            ) : (
              'Confirm Swap'
            )}
          </button>
        </div>
      </div>
    </div>
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
    return `~${Math.round(seconds)} seconds`
  }
  const minutes = Math.round(seconds / 60)
  return `~${minutes} minutes`
}
