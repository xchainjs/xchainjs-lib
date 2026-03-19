import { useState, useEffect, useCallback } from 'react'
import { ArrowDownUp, RefreshCw, ExternalLink, ChevronDown, ChevronUp, CalendarClock, Trash2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useWallet } from '../contexts/WalletContext'
import { useAggregator, type SwapQuote } from '../hooks/useAggregator'
import { useOperation } from '../hooks/useOperation'
import { useBalanceUsdValue, usePrices, formatUsdValue } from '../hooks/usePrices'
import { AssetSelector } from '../components/swap/AssetSelector'
import type { ChainAsset } from '../lib/types'
import { QuoteCard } from '../components/swap/QuoteCard'
import { SwapConfirmModal } from '../components/swap/SwapConfirmModal'
import { SwapTrackingModal } from '../components/swap/SwapTrackingModal'
import { ResultPanel } from '../components/ui/ResultPanel'
import { CodePreview } from '../components/ui/CodePreview'
import { generateSwapEstimateCode, generateSwapExecuteCode } from '../lib/codeExamples'
import { CHAIN_MIN_SWAP_AMOUNT } from '../lib/chains'
import { buildAsset, getDecimals } from '../lib/assetUtils'
import { assetAmount, assetToBase, baseToAsset, CryptoAmount } from '@xchainjs/xchain-util'
import type { SwapResult } from '../lib/swap/SwapService'
import { addEntry, getHistory, clearHistory, type SwapHistoryEntry } from '../lib/swap/SwapHistory'

const USD_PRESETS = [25, 50, 100, 250, 500]

export default function SwapPage() {
  const { isConnected } = useWallet()
  const { swapService, wallet, loading: serviceLoading, error: serviceError, supportedChains } = useAggregator()
  const prices = usePrices()

  // Form state
  const [fromAsset, setFromAsset] = useState<ChainAsset | null>(null)
  const [toAsset, setToAsset] = useState<ChainAsset | null>(null)
  const [amount, setAmount] = useState('')
  const [balance, setBalance] = useState<string | null>(null)
  const [balanceLoading, setBalanceLoading] = useState(false)

  // Custom destination address
  const [destinationOverride, setDestinationOverride] = useState('')
  const [showCustomDest, setShowCustomDest] = useState(false)
  const [destValidationError, setDestValidationError] = useState<string | null>(null)

  // Slippage tolerance (basis points)
  const [slippageBps, setSlippageBps] = useState(100) // 1% default
  const [customSlippage, setCustomSlippage] = useState('')

  // Swap history
  const [swapHistory, setSwapHistory] = useState<SwapHistoryEntry[]>(() => getHistory())
  const [showHistory, setShowHistory] = useState(false)

  // Streaming swap state (enabled by default for better prices on large swaps)
  const [isStreaming, setIsStreaming] = useState(true)
  const [streamingInterval, setStreamingInterval] = useState('1')
  const [streamingQuantity, setStreamingQuantity] = useState('0') // 0 = automatic

  // Build Asset object for price lookup
  const fromAssetObj = fromAsset ? buildAsset(fromAsset) : null
  const toAssetObj = toAsset ? buildAsset(toAsset) : null

  // Get USD values
  const { usdValueFormatted: balanceUsdFormatted } = useBalanceUsdValue(balance, fromAssetObj)
  const inputUsdValue = fromAssetObj && amount ? prices.calculateValue(parseFloat(amount) || 0, fromAssetObj) : null
  const fromAssetPrice = fromAssetObj ? prices.getPrice(fromAssetObj) : null

  // Dust / minimum amount check (UTXO chains)
  const amountNum = parseFloat(amount) || 0
  const minSwapAmount = fromAsset && !fromAsset.contractAddress ? CHAIN_MIN_SWAP_AMOUNT[fromAsset.chainId] : undefined
  const isBelowMinimum = minSwapAmount !== undefined && amountNum > 0 && amountNum < minSwapAmount

  // Quote state
  const [quotes, setQuotes] = useState<SwapQuote[]>([])
  const [selectedQuote, setSelectedQuote] = useState<SwapQuote | null>(null)
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)

  // Tracking state
  const [isTrackingOpen, setIsTrackingOpen] = useState(false)
  const [trackingTxHash, setTrackingTxHash] = useState<string | null>(null)
  const [trackingProtocol, setTrackingProtocol] = useState<'Thorchain' | 'Mayachain' | 'Chainflip' | 'OneClick'>('Thorchain')
  const [trackingExplorerUrl, setTrackingExplorerUrl] = useState<string | undefined>()
  const [trackingDepositChannelId, setTrackingDepositChannelId] = useState<string | undefined>()

  // Operations
  const quoteOp = useOperation<SwapQuote[]>()
  const swapOp = useOperation<SwapResult>()

  // Fetch balance when fromAsset changes
  useEffect(() => {
    if (!wallet || !fromAsset) {
      setBalance(null)
      setBalanceLoading(false)
      return
    }

    let cancelled = false
    setBalanceLoading(true)

    const fetchBalance = async () => {
      try {
        const asset = buildAsset(fromAsset)
        // For tokens, request the specific asset so the provider queries the contract directly
        // rather than relying on auto-discovery from transaction history
        const assets = fromAsset.contractAddress ? [asset] : undefined
        let balances: any[]

        try {
          balances = await wallet.getBalance(fromAsset.chainId, assets)
        } catch (e) {
          // If explicit token fetch fails (e.g. RPC doesn't support eth_call),
          // fall back to auto-discovery which uses etherscan tokentx API
          if (fromAsset.contractAddress) {
            console.warn('[SwapPage] Explicit token balance fetch failed, trying auto-discovery:', e)
            balances = await wallet.getBalance(fromAsset.chainId)
          } else {
            throw e
          }
        }

        if (cancelled) return

        const match = balances.find(
          (b: any) =>
            b.asset.chain === asset.chain &&
            b.asset.symbol.toLowerCase() === asset.symbol.toLowerCase(),
        )
        if (match) {
          const assetAmt = baseToAsset(match.amount)
          setBalance(assetAmt.amount().toFixed(6))
        } else {
          setBalance('0')
        }
        if (!cancelled) setBalanceLoading(false)
      } catch (e) {
        console.warn('[SwapPage] Failed to fetch balance:', e)
        if (!cancelled) {
          setBalance(null)
          setBalanceLoading(false)
        }
      }
    }

    fetchBalance()
    return () => { cancelled = true }
  }, [wallet, fromAsset])

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

  // Clear quotes when assets change
  useEffect(() => {
    setQuotes([])
    setSelectedQuote(null)
    quoteOp.reset()
  }, [fromAsset, toAsset])

  // Swap from/to assets
  const handleSwapAssets = () => {
    const temp = fromAsset
    setFromAsset(toAsset)
    setToAsset(temp)
  }

  // Fee reserves for chains where native asset pays gas (applied at 100%)
  const FEE_RESERVES: Record<string, number> = {
    SOL: 0.001,
    ETH: 0.002,
    AVAX: 0.01,
    BSC: 0.001,
    ARB: 0.0001,
    GAIA: 0.01,
    THOR: 0.02,
    MAYA: 0.02,
    KUJI: 0.01,
  }

  // Set amount to percentage of balance
  const handleSetPercentage = (pct: number) => {
    if (balance && fromAsset) {
      const balanceNum = parseFloat(balance)
      let amt = balanceNum * pct
      // Reserve fee buffer at 100% for native assets (tokens don't pay gas directly)
      if (pct === 1 && !fromAsset.contractAddress) {
        const reserve = FEE_RESERVES[fromAsset.chainId] || 0
        if (reserve > 0 && amt > reserve) {
          amt = amt - reserve
        }
      }
      setAmount(Math.max(0, amt).toFixed(6))
    }
  }

  // Fetch quotes
  const handleGetQuotes = async () => {
    console.log('[SwapPage] handleGetQuotes called', {
      swapService: !!swapService,
      fromAsset,
      toAsset,
      amount,
      wallet: !!wallet,
    })

    if (!swapService || !fromAsset || !toAsset || !amount || !wallet) {
      console.log('[SwapPage] Missing required data, aborting')
      return
    }

    const fromAssetObj = buildAsset(fromAsset)
    const toAssetObj = buildAsset(toAsset)
    const decimals = getDecimals(fromAsset)

    console.log('[SwapPage] Built assets:', { fromAssetObj, toAssetObj, decimals })

    const amountNum = parseFloat(amount)
    if (isNaN(amountNum) || amountNum <= 0) {
      console.log('[SwapPage] Invalid amount:', amount)
      return
    }

    const cryptoAmount = new CryptoAmount(assetToBase(assetAmount(amountNum, decimals)), fromAssetObj)

    console.log('[SwapPage] CryptoAmount:', cryptoAmount.assetAmount.amount().toString())

    // Get addresses
    const fromAddress = await wallet.getAddress(fromAsset.chainId)
    const destinationAddress = destinationOverride.trim() || await wallet.getAddress(toAsset.chainId)

    console.log('[SwapPage] Addresses:', { fromAddress, destinationAddress })

    await quoteOp.execute(
      async () => {
        console.log('[SwapPage] Calling swapService.estimateSwap...')
        const result = await swapService.estimateSwap({
          fromAsset: fromAssetObj,
          destinationAsset: toAssetObj,
          amount: cryptoAmount,
          fromAddress,
          destinationAddress,
          // Streaming swap parameters (not applicable for Chainflip)
          ...(isStreaming && {
            streamingInterval: parseInt(streamingInterval) || 1,
            streamingQuantity: parseInt(streamingQuantity) || 0,
          }),
        })
        console.log('[SwapPage] estimateSwap result:', result)
        setQuotes(result)
        // Auto-select best quote
        if (result.length > 0) {
          const validQuotes = result.filter((q) => q.canSwap)
          console.log('[SwapPage] Valid quotes:', validQuotes.length)
          if (validQuotes.length > 0) {
            const bestQuote = validQuotes.reduce((best, current) =>
              current.expectedAmount.baseAmount.amount().gt(best.expectedAmount.baseAmount.amount()) ? current : best,
            )
            setSelectedQuote(bestQuote)
          }
        }
        return result
      },
      { operation: 'estimateSwap', params: { from: fromAsset.chainId, to: toAsset.chainId, amount } },
    )
  }

  // Execute swap
  const handleExecuteSwap = async () => {
    if (!swapService || !fromAsset || !toAsset || !amount || !wallet || !selectedQuote) return

    const fromAssetObj = buildAsset(fromAsset)
    const toAssetObj = buildAsset(toAsset)
    const decimals = getDecimals(fromAsset)
    const amountNum = parseFloat(amount)

    const cryptoAmount = new CryptoAmount(assetToBase(assetAmount(amountNum, decimals)), fromAssetObj)

    const fromAddress = await wallet.getAddress(fromAsset.chainId)
    const destinationAddress = destinationOverride.trim() || await wallet.getAddress(toAsset.chainId)

    setIsConfirmOpen(false)

    await swapOp.execute(
      async () => {
        const result = await swapService.doSwap({
          fromAsset: fromAssetObj,
          destinationAsset: toAssetObj,
          amount: cryptoAmount,
          fromAddress,
          destinationAddress,
          protocol: selectedQuote.protocol,
          slippageToleranceBps: slippageBps,
          // Streaming swap parameters (only for THORChain/MAYAChain)
          ...(isStreaming &&
            selectedQuote.protocol !== 'Chainflip' && selectedQuote.protocol !== 'OneClick' && {
              streamingInterval: parseInt(streamingInterval) || 1,
              streamingQuantity: parseInt(streamingQuantity) || 0,
            }),
        })

        // Open tracking modal on success
        if (result.hash) {
          setTrackingTxHash(result.hash)
          setTrackingProtocol(selectedQuote.protocol)
          setTrackingExplorerUrl(result.url)
          setTrackingDepositChannelId(result.depositChannelId)
          setIsTrackingOpen(true)
        }

        // Record in swap history
        const expectedOutput = baseToAsset(selectedQuote.expectedAmount.baseAmount).amount().toFixed(6)
        const entry: SwapHistoryEntry = {
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          timestamp: Date.now(),
          fromAsset: `${fromAsset.chainId}.${fromAsset.symbol}`,
          toAsset: `${toAsset.chainId}.${toAsset.symbol}`,
          inputAmount: amount,
          expectedOutput,
          protocol: selectedQuote.protocol,
          slippageBps: selectedQuote.slipBasisPoints,
          txHash: result.hash,
          explorerUrl: result.url,
          depositChannelId: result.depositChannelId,
          status: 'submitted',
        }
        addEntry(entry)
        setSwapHistory(getHistory())

        return result
      },
      {
        operation: 'doSwap',
        params: { from: fromAsset.chainId, to: toAsset.chainId, amount, protocol: selectedQuote.protocol },
      },
    )
  }

  // Sort quotes by expected amount (best first)
  const sortedQuotes = [...quotes].sort((a, b) => {
    if (!a.canSwap && b.canSwap) return 1
    if (a.canSwap && !b.canSwap) return -1
    return b.expectedAmount.baseAmount.amount().minus(a.expectedAmount.baseAmount.amount()).toNumber()
  })

  if (!isConnected) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="text-center py-8">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-2">Connect Wallet</h2>
          <p className="text-gray-500 dark:text-gray-400">Please connect your wallet to use the swap feature.</p>
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

  return (
    <div className="p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          {/* Header */}
          <div className="border-b border-gray-200 dark:border-gray-700 px-6 py-4">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">Swap</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Cross-chain swaps via THORChain, MAYAChain, and Chainflip
            </p>
          </div>

          <div className="p-6 space-y-6">
            {/* Asset Selection */}
            <div className="space-y-4">
              {/* From Asset */}
              <div>
                <AssetSelector
                  label="From"
                  value={fromAsset}
                  onChange={setFromAsset}
                  availableChains={supportedChains}
                  excludeAsset={toAsset ?? undefined}
                />
                {fromAsset && balanceLoading && balance === null && (
                  <div className="mt-2 flex items-center gap-2 text-sm text-gray-400 dark:text-gray-500">
                    <div className="w-3 h-3 border-2 border-gray-300 dark:border-gray-600 border-t-blue-500 rounded-full animate-spin" />
                    Loading balance...
                  </div>
                )}
                {fromAsset && balance !== null && (
                  <div className="mt-2 flex items-center justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">
                      Balance: {balance} {fromAsset.symbol}
                      {balanceUsdFormatted && (
                        <span className="text-gray-400 dark:text-gray-500 ml-1">({balanceUsdFormatted})</span>
                      )}
                    </span>
                    <div className="flex gap-2">
                      {[25, 50, 75, 100].map((pct) => (
                        <button
                          key={pct}
                          onClick={() => handleSetPercentage(pct / 100)}
                          className="px-2 py-1 text-xs font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded transition-colors"
                        >
                          {pct}%
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Swap Button */}
              <div className="flex justify-center">
                <button
                  onClick={handleSwapAssets}
                  disabled={!fromAsset && !toAsset}
                  className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ArrowDownUp className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                </button>
              </div>

              {/* To Asset */}
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

            {/* Amount Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Amount</label>
              <div className="relative">
                <input
                  type="text"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg font-mono placeholder-gray-400 dark:placeholder-gray-500"
                />
                {inputUsdValue !== null && inputUsdValue > 0 && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400 dark:text-gray-500">
                    {prices.calculateValue(parseFloat(amount) || 0, fromAssetObj!) !== null && (
                      <span>~{formatUsdValue(inputUsdValue)}</span>
                    )}
                  </div>
                )}
              </div>
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
              {isBelowMinimum && (
                <p className="mt-1 text-sm text-amber-600 dark:text-amber-400">
                  Minimum amount for {fromAsset!.chainId} is {minSwapAmount} {fromAsset!.symbol}
                </p>
              )}
            </div>

            {/* Streaming Swap Options */}
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Streaming Swap</label>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    Split large swaps into smaller sub-swaps for better prices
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

            {/* Slippage Tolerance */}
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Slippage Tolerance</label>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Enforced on-chain for Chainflip (fill-or-kill). For THORChain/MAYAChain this is advisory only.
              </p>
              <div className="mt-2 flex items-center gap-2">
                {[50, 100, 300].map((bps) => (
                  <button
                    key={bps}
                    type="button"
                    onClick={() => { setSlippageBps(bps); setCustomSlippage('') }}
                    className={`px-3 py-1.5 text-sm font-medium rounded-lg border transition-colors ${
                      slippageBps === bps && !customSlippage
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                        : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-blue-300 dark:hover:border-blue-600'
                    }`}
                  >
                    {(bps / 100).toFixed(1)}%
                  </button>
                ))}
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={customSlippage}
                    onChange={(e) => {
                      const val = e.target.value
                      setCustomSlippage(val)
                      if (val === '') {
                        setSlippageBps(100) // reset to 1% default
                        return
                      }
                      const num = parseFloat(val)
                      if (!isNaN(num) && num > 0 && num <= 50) {
                        setSlippageBps(Math.round(num * 100))
                      }
                    }}
                    placeholder="Custom"
                    className="w-full px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder-gray-400 dark:placeholder-gray-500"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">%</span>
                </div>
              </div>
            </div>

            {/* Get Quote Button */}
            <button
              onClick={handleGetQuotes}
              disabled={!fromAsset || !toAsset || !amount || isBelowMinimum || quoteOp.loading}
              className="w-full px-4 py-3 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {quoteOp.loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Fetching Quotes...
                </>
              ) : (
                'Get Quotes'
              )}
            </button>

            {/* Quote Error */}
            {quoteOp.error && (
              <div className="p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-sm text-red-700 dark:text-red-300">{quoteOp.error.message}</p>
              </div>
            )}

            {/* Quotes List */}
            {sortedQuotes.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Available Routes ({sortedQuotes.length})
                </h3>
                <div className="grid gap-3">
                  {sortedQuotes.map((quote, index) => (
                    <QuoteCard
                      key={`${quote.protocol}-${index}`}
                      quote={quote}
                      isSelected={selectedQuote?.protocol === quote.protocol}
                      onSelect={() => quote.canSwap && setSelectedQuote(quote)}
                      isBest={index === 0 && quote.canSwap}
                      slippageToleranceBps={slippageBps}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Execute Swap Button */}
            {selectedQuote && selectedQuote.canSwap && (
              <button
                onClick={() => setIsConfirmOpen(true)}
                disabled={swapOp.loading}
                className="w-full px-4 py-3 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Review Swap
              </button>
            )}

            {/* Swap Result */}
            <ResultPanel loading={swapOp.loading} error={swapOp.error} duration={swapOp.duration}>
              {swapOp.result && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-green-700 dark:text-green-300 font-medium">
                    Swap Submitted Successfully!
                  </div>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Transaction Hash:</span>
                      <p className="font-mono text-gray-900 dark:text-gray-100 break-all mt-1">{swapOp.result.hash}</p>
                    </div>
                    <div className="flex items-center gap-3 mt-3">
                      <button
                        onClick={() => setIsTrackingOpen(true)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Track Progress
                      </button>
                      <a
                        href={swapOp.result.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        Explorer <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                </div>
              )}
            </ResultPanel>
          </div>
        </div>

        {/* Confirm Modal */}
        {fromAsset && toAsset && selectedQuote && (
          <SwapConfirmModal
            isOpen={isConfirmOpen}
            onClose={() => setIsConfirmOpen(false)}
            onConfirm={handleExecuteSwap}
            fromAsset={fromAsset}
            toAsset={toAsset}
            amount={amount}
            quote={selectedQuote}
            isExecuting={swapOp.loading}
            slippageToleranceBps={slippageBps}
          />
        )}

        {/* Tracking Modal */}
        {trackingTxHash && (
          <SwapTrackingModal
            isOpen={isTrackingOpen}
            onClose={() => setIsTrackingOpen(false)}
            txHash={trackingTxHash}
            protocol={trackingProtocol}
            explorerUrl={trackingExplorerUrl}
            depositChannelId={trackingDepositChannelId}
          />
        )}

        {/* Code Examples */}
        {fromAsset && toAsset && amount && selectedQuote?.protocol !== 'Chainflip' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 space-y-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Code Examples</h3>
            <CodePreview
              code={generateSwapEstimateCode(
                fromAsset.chainId,
                toAsset.chainId,
                amount,
                selectedQuote?.protocol === 'Mayachain' ? 'MAYAChain' : 'THORChain',
              )}
              title="Get Swap Quote"
            />
            <CodePreview
              code={generateSwapExecuteCode(
                fromAsset.chainId,
                toAsset.chainId,
                amount,
                selectedQuote?.protocol === 'Mayachain' ? 'MAYAChain' : 'THORChain',
              )}
              title="Execute Swap"
            />
          </div>
        )}
        {/* DCA Callout */}
        <Link
          to="/recurring"
          className="block bg-white dark:bg-gray-800 rounded-lg shadow p-4 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors group"
        >
          <div className="flex items-center gap-3">
            <CalendarClock className="w-5 h-5 text-blue-500 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Dollar-Cost Average</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Set up recurring swaps to DCA into any asset automatically</p>
            </div>
            <ChevronDown className="w-4 h-4 text-gray-400 -rotate-90 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </Link>

        {/* Recent Swaps */}
        {swapHistory.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
            <button
              type="button"
              onClick={() => setShowHistory(!showHistory)}
              className="w-full flex items-center justify-between px-6 py-4 text-left"
            >
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Recent Swaps ({swapHistory.length})
              </h3>
              {showHistory ? (
                <ChevronUp className="w-4 h-4 text-gray-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-gray-400" />
              )}
            </button>
            {showHistory && (
              <div className="px-6 pb-4 space-y-3">
                {swapHistory.slice(0, 10).map((entry) => (
                  <div
                    key={entry.id}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg text-sm"
                  >
                    <div className="min-w-0">
                      <div className="font-medium text-gray-900 dark:text-gray-100">
                        {entry.inputAmount} {entry.fromAsset.split('.')[1]} → {entry.expectedOutput} {entry.toAsset.split('.')[1]}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        {entry.protocol} · {formatTimeAgo(entry.timestamp)} · Slip: {(entry.slippageBps / 100).toFixed(2)}%
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${
                        entry.status === 'completed'
                          ? 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-400'
                          : entry.status === 'failed'
                          ? 'bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-400'
                          : 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-400'
                      }`}>
                        {entry.status}
                      </span>
                      <a
                        href={entry.explorerUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => { clearHistory(); setSwapHistory([]) }}
                  className="flex items-center gap-1 text-xs text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                >
                  <Trash2 className="w-3 h-3" />
                  Clear History
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function formatTimeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000)
  if (seconds < 60) return 'just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}
