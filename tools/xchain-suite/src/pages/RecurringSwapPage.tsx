import { useState, useEffect, useCallback } from 'react'
import { RefreshCw, ChevronDown, ChevronUp } from 'lucide-react'
import { useWallet } from '../contexts/WalletContext'
import { useAggregator, type SwapQuote } from '../hooks/useAggregator'
import { useRecurringSwaps } from '../hooks/useRecurringSwaps'
import { useOperation } from '../hooks/useOperation'
import { AssetSelector } from '../components/swap/AssetSelector'
import type { ChainAsset } from '../lib/types'
import { QuoteCard } from '../components/swap/QuoteCard'
import { ScheduleCard } from '../components/recurring/ScheduleCard'
import type { RecurringInterval } from '../lib/swap/RecurringSwapScheduler'
import { CryptoAmount, assetAmount, assetToBase } from '@xchainjs/xchain-util'
import { useAssetPrice } from '../hooks/usePrices'
import { CHAIN_MIN_SWAP_AMOUNT } from '../lib/chains'
import { buildAsset, getDecimals } from '../lib/assetUtils'

const USD_PRESETS = [25, 50, 100, 250, 500]

const INTERVAL_OPTIONS: { value: RecurringInterval; label: string }[] = [
  { value: 'every_minute', label: 'Every Minute' },
  { value: 'every_5min', label: 'Every 5 Minutes' },
  { value: 'every_15min', label: 'Every 15 Minutes' },
  { value: 'every_30min', label: 'Every 30 Minutes' },
  { value: 'every_hour', label: 'Every Hour' },
  { value: 'every_4h', label: 'Every 4 Hours' },
  { value: 'every_day', label: 'Every Day' },
  { value: 'every_week', label: 'Every Week' },
]

const PROTOCOL_OPTIONS = ['Thorchain', 'Mayachain', 'Chainflip'] as const

export default function RecurringSwapPage() {
  const { isConnected } = useWallet()
  const { swapService, wallet, loading: serviceLoading, error: serviceError, supportedChains } = useAggregator()
  const {
    schedules,
    isReady,
    createSchedule,
    pauseSchedule,
    resumeSchedule,
    cancelSchedule,
    getHistory,
    activeCount,
  } = useRecurringSwaps(swapService, wallet)

  // Form state
  const [fromAsset, setFromAsset] = useState<ChainAsset | null>(null)
  const [toAsset, setToAsset] = useState<ChainAsset | null>(null)
  const [amount, setAmount] = useState('')
  const [protocol, setProtocol] = useState<(typeof PROTOCOL_OPTIONS)[number]>('Thorchain')
  const [interval, setInterval] = useState<RecurringInterval>('every_day')
  const [maxSlippageBps, setMaxSlippageBps] = useState('300')
  const [isStreaming, setIsStreaming] = useState(true)
  const [streamingInterval, setStreamingInterval] = useState('1')
  const [streamingQuantity, setStreamingQuantity] = useState('0')

  // Custom destination address
  const [destinationOverride, setDestinationOverride] = useState('')
  const [showCustomDest, setShowCustomDest] = useState(false)
  const [destValidationError, setDestValidationError] = useState<string | null>(null)

  // Clear destination override when toAsset changes
  useEffect(() => {
    setDestinationOverride('')
    setDestValidationError(null)
  }, [toAsset])

  // Validate destination address
  const handleDestinationChange = useCallback(
    (value: string) => {
      setDestinationOverride(value)
      if (!value.trim()) {
        setDestValidationError(null)
        return
      }
      if (wallet && toAsset) {
        try {
          const valid = wallet.validateAddress(toAsset.chainId, value.trim())
          setDestValidationError(valid ? null : 'Invalid address for ' + toAsset.chainId)
        } catch {
          setDestValidationError('Unable to validate address')
        }
      }
    },
    [wallet, toAsset],
  )

  // Price for USD presets
  const fromAssetObj = fromAsset ? buildAsset(fromAsset) : null
  const { price: fromAssetPrice } = useAssetPrice(fromAssetObj)

  // Preview quote
  const [previewQuotes, setPreviewQuotes] = useState<SwapQuote[]>([])
  const quoteOp = useOperation<SwapQuote[]>()

  const handlePreviewQuote = async () => {
    if (!swapService || !fromAsset || !toAsset || !amount || !wallet) return

    const fromAssetObj = buildAsset(fromAsset)
    const toAssetObj = buildAsset(toAsset)
    const decimals = getDecimals(fromAsset)
    const amountNum = parseFloat(amount)
    if (isNaN(amountNum) || amountNum <= 0) return

    const cryptoAmount = new CryptoAmount(assetToBase(assetAmount(amountNum, decimals)), fromAssetObj)

    await quoteOp.execute(async () => {
      const fromAddress = await wallet.getAddress(fromAsset.chainId)
      const destinationAddress = destinationOverride.trim() || await wallet.getAddress(toAsset.chainId)
      const quotes = await swapService.estimateSwap({
        fromAsset: fromAssetObj,
        destinationAsset: toAssetObj,
        amount: cryptoAmount,
        fromAddress,
        destinationAddress,
        ...(isStreaming && protocol !== 'Chainflip' && {
          streamingInterval: Math.max(parseInt(streamingInterval) || 0, 1),
          streamingQuantity: Math.max(parseInt(streamingQuantity) || 0, 0),
        }),
      })
      setPreviewQuotes(quotes)
      return quotes
    })
  }

  const handleCreate = (startPaused: boolean) => {
    if (!fromAsset || !toAsset || !amount) return
    const amountNum = parseFloat(amount)
    if (isNaN(amountNum) || amountNum <= 0) return

    const parsedSlippage = Number(maxSlippageBps)
    const slippage = Number.isInteger(parsedSlippage) && parsedSlippage > 0 ? parsedSlippage : 300

    createSchedule({
      fromAsset,
      toAsset,
      amount,
      protocol,
      interval,
      maxSlippageBps: slippage,
      streaming: isStreaming,
      streamingInterval: Math.max(parseInt(streamingInterval) || 0, 1),
      streamingQuantity: Math.max(parseInt(streamingQuantity) || 0, 0),
      startPaused,
      destinationAddress: destinationOverride.trim() || undefined,
    })

    // Reset form
    setFromAsset(null)
    setToAsset(null)
    setAmount('')
    setPreviewQuotes([])
    quoteOp.reset()
  }

  // Filter visible schedules (show active/paused, cancelled at bottom)
  const activeSchedules = schedules.filter((s) => s.status !== 'cancelled')
  const cancelledSchedules = schedules.filter((s) => s.status === 'cancelled')

  if (!isConnected) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="text-center py-8">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-2">Connect Wallet</h2>
          <p className="text-gray-500 dark:text-gray-400">
            Please connect your wallet to use recurring swaps.
          </p>
        </div>
      </div>
    )
  }

  if (serviceLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex items-center gap-3">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
          <p className="text-gray-600 dark:text-gray-300">Initializing swap service...</p>
        </div>
      </div>
    )
  }

  if (serviceError) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="text-red-600 dark:text-red-400">
          <p className="font-medium">Failed to initialize swap service</p>
          <p className="text-sm mt-1">{serviceError.message}</p>
        </div>
      </div>
    )
  }

  // Dust / minimum amount check (UTXO chains)
  const amountNum = parseFloat(amount) || 0
  const minSwapAmount = fromAsset && !fromAsset.contractAddress ? CHAIN_MIN_SWAP_AMOUNT[fromAsset.chainId] : undefined
  const isBelowMinimum = minSwapAmount !== undefined && amountNum > 0 && amountNum < minSwapAmount

  const canCreate = fromAsset && toAsset && amount && amountNum > 0 && !isBelowMinimum && isReady

  return (
    <div className="p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Create New Schedule */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="border-b border-gray-200 dark:border-gray-700 px-6 py-4">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">Recurring Swap</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Schedule automatic recurring swaps at fixed intervals
            </p>
          </div>

          <div className="p-6 space-y-5">
            {/* Asset selectors */}
            <div className="space-y-4">
              <AssetSelector
                label="From"
                value={fromAsset}
                onChange={setFromAsset}
                availableChains={supportedChains}
                excludeAsset={toAsset ?? undefined}
              />
              <AssetSelector
                label="To"
                value={toAsset}
                onChange={setToAsset}
                availableChains={supportedChains}
                excludeAsset={fromAsset ?? undefined}
              />

              {/* Custom Destination Address */}
              {toAsset && (
                <div>
                  <button
                    type="button"
                    onClick={() => setShowCustomDest(!showCustomDest)}
                    className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                  >
                    {showCustomDest ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    Custom Destination Address
                  </button>
                  {showCustomDest && (
                    <div className="mt-2">
                      <input
                        type="text"
                        value={destinationOverride}
                        onChange={(e) => handleDestinationChange(e.target.value)}
                        placeholder={`Leave empty to use your ${toAsset.chainId} wallet address`}
                        className={`w-full px-3 py-2 text-sm border ${
                          destValidationError
                            ? 'border-red-400 dark:border-red-600'
                            : 'border-gray-300 dark:border-gray-600'
                        } bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono placeholder-gray-400 dark:placeholder-gray-500`}
                      />
                      {destValidationError && (
                        <p className="mt-1 text-xs text-red-600 dark:text-red-400">{destValidationError}</p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Amount */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Amount per Execution
              </label>
              <input
                type="text"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg font-mono placeholder-gray-400 dark:placeholder-gray-500"
              />
              {/* USD presets */}
              {fromAsset && fromAssetPrice && fromAssetPrice > 0 && (
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  {USD_PRESETS.map((usd) => {
                    const assetAmt = usd / fromAssetPrice
                    const decimals = getDecimals(fromAsset)
                    const display = assetAmt < 0.01 ? assetAmt.toFixed(decimals) : assetAmt.toFixed(6)
                    return (
                      <button
                        key={usd}
                        type="button"
                        onClick={() => setAmount(display)}
                        className="px-3 py-1 text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
                      >
                        ${usd}
                      </button>
                    )
                  })}
                </div>
              )}
              {/* USD equivalent */}
              {amount && fromAssetPrice && fromAssetPrice > 0 && (
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  ≈ ${(parseFloat(amount) * fromAssetPrice).toFixed(2)} USD
                </p>
              )}
              {isBelowMinimum && (
                <p className="mt-1 text-sm text-amber-600 dark:text-amber-400">
                  Minimum amount for {fromAsset!.chainId} is {minSwapAmount} {fromAsset!.symbol}
                </p>
              )}
            </div>

            {/* Protocol + Interval row */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Protocol
                </label>
                <select
                  value={protocol}
                  onChange={(e) => setProtocol(e.target.value as typeof protocol)}
                  className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  {PROTOCOL_OPTIONS.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Interval
                </label>
                <select
                  value={interval}
                  onChange={(e) => setInterval(e.target.value as RecurringInterval)}
                  className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  {INTERVAL_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Max slippage */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Max Slippage (basis points)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="1"
                  value={maxSlippageBps}
                  onChange={(e) => setMaxSlippageBps(e.target.value)}
                  className="w-32 px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm font-mono"
                />
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  = {((parseInt(maxSlippageBps) || 0) / 100).toFixed(1)}%
                </span>
              </div>
            </div>

            {/* Streaming Swap */}
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Streaming Swap</label>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    Split into smaller sub-swaps for better prices (THORChain/MAYAChain)
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsStreaming(!isStreaming)}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                    isStreaming ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-600'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      isStreaming ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {isStreaming && (
                <div className="mt-4 grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                      Interval (blocks)
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={streamingInterval}
                      onChange={(e) => setStreamingInterval(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                      Quantity (0 = auto)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={streamingQuantity}
                      onChange={(e) => setStreamingQuantity(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Preview Quote */}
            <button
              onClick={handlePreviewQuote}
              disabled={!canCreate || quoteOp.loading}
              className="w-full px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {quoteOp.loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" /> Fetching Preview...
                </>
              ) : (
                'Preview Quote'
              )}
            </button>

            {quoteOp.error && (
              <div className="p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-sm text-red-700 dark:text-red-300">{quoteOp.error.message}</p>
              </div>
            )}

            {previewQuotes.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                  Preview Quotes
                </h3>
                {previewQuotes
                  .filter((q) => q.protocol === protocol)
                  .map((quote, i) => (
                    <QuoteCard key={i} quote={quote} isSelected={false} onSelect={() => {}} isBest={false} />
                  ))}
                {previewQuotes.filter((q) => q.protocol === protocol).length === 0 && (
                  <p className="text-sm text-yellow-600 dark:text-yellow-400">
                    No quote available for {protocol}. Try a different protocol.
                  </p>
                )}
              </div>
            )}

            {/* Create buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => handleCreate(false)}
                disabled={!canCreate}
                className="flex-1 px-4 py-3 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create & Start
              </button>
              <button
                onClick={() => handleCreate(true)}
                disabled={!canCreate}
                className="flex-1 px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create Paused
              </button>
            </div>
          </div>
        </div>

        {/* Active Schedules */}
        {activeSchedules.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
            <div className="border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                Schedules
              </h2>
              {activeCount > 0 && (
                <span className="px-2.5 py-0.5 text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full">
                  {activeCount} active
                </span>
              )}
            </div>
            <div className="p-4 space-y-3">
              {activeSchedules.map((schedule) => (
                <ScheduleCard
                  key={schedule.id}
                  schedule={schedule}
                  history={getHistory(schedule.id)}
                  onPause={() => pauseSchedule(schedule.id)}
                  onResume={() => resumeSchedule(schedule.id)}
                  onCancel={() => cancelSchedule(schedule.id)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Cancelled Schedules */}
        {cancelledSchedules.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
            <div className="border-b border-gray-200 dark:border-gray-700 px-6 py-4">
              <h2 className="text-lg font-semibold text-gray-500 dark:text-gray-400">
                Cancelled ({cancelledSchedules.length})
              </h2>
            </div>
            <div className="p-4 space-y-3">
              {cancelledSchedules.map((schedule) => (
                <ScheduleCard
                  key={schedule.id}
                  schedule={schedule}
                  history={getHistory(schedule.id)}
                  onPause={() => {}}
                  onResume={() => {}}
                  onCancel={() => {}}
                />
              ))}
            </div>
          </div>
        )}

        {/* Empty state */}
        {schedules.length === 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 text-center">
            <p className="text-gray-500 dark:text-gray-400">
              No recurring swaps yet. Create one above to get started.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
