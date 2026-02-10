import { useState, useEffect } from 'react'
import { ArrowDownUp, RefreshCw, ExternalLink } from 'lucide-react'
import { useWallet } from '../contexts/WalletContext'
import { useAggregator, type SwapQuote } from '../hooks/useAggregator'
import { useOperation } from '../hooks/useOperation'
import { useBalanceUsdValue, usePrices, formatUsdValue } from '../hooks/usePrices'
import { AssetSelector, type ChainAsset } from '../components/swap/AssetSelector'
import { QuoteCard } from '../components/swap/QuoteCard'
import { SwapConfirmModal } from '../components/swap/SwapConfirmModal'
import { SwapTrackingModal } from '../components/swap/SwapTrackingModal'
import { ResultPanel } from '../components/ui/ResultPanel'
import { CodePreview } from '../components/ui/CodePreview'
import { generateSwapEstimateCode, generateSwapExecuteCode } from '../lib/codeExamples'
import { getChainById } from '../lib/chains'
import {
  assetAmount,
  assetToBase,
  baseToAsset,
  CryptoAmount,
  AssetType,
  type Asset,
} from '@xchainjs/xchain-util'
import type { SwapResult } from '../lib/swap/SwapService'

// Helper to build Asset from ChainAsset
function buildAsset(chainAsset: ChainAsset): Asset {
  return {
    chain: chainAsset.chainId,
    symbol: chainAsset.symbol,
    ticker: chainAsset.symbol,
    type: AssetType.NATIVE,
  }
}

// Get decimals for a chain
function getDecimals(chainId: string): number {
  const chain = getChainById(chainId)
  return chain?.decimals ?? 8
}

export default function SwapPage() {
  const { isConnected } = useWallet()
  const { swapService, wallet, loading: serviceLoading, error: serviceError, supportedChains } = useAggregator()
  const prices = usePrices()

  // Form state
  const [fromAsset, setFromAsset] = useState<ChainAsset | null>(null)
  const [toAsset, setToAsset] = useState<ChainAsset | null>(null)
  const [amount, setAmount] = useState('')
  const [balance, setBalance] = useState<string | null>(null)

  // Build Asset object for price lookup
  const fromAssetObj = fromAsset ? buildAsset(fromAsset) : null
  const toAssetObj = toAsset ? buildAsset(toAsset) : null

  // Get USD values
  const { usdValueFormatted: balanceUsdFormatted } = useBalanceUsdValue(balance, fromAssetObj)
  const inputUsdValue = fromAssetObj && amount
    ? prices.calculateValue(parseFloat(amount) || 0, fromAssetObj)
    : null

  // Quote state
  const [quotes, setQuotes] = useState<SwapQuote[]>([])
  const [selectedQuote, setSelectedQuote] = useState<SwapQuote | null>(null)
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)

  // Tracking state
  const [isTrackingOpen, setIsTrackingOpen] = useState(false)
  const [trackingTxHash, setTrackingTxHash] = useState<string | null>(null)
  const [trackingProtocol, setTrackingProtocol] = useState<'Thorchain' | 'Mayachain'>('Thorchain')
  const [trackingExplorerUrl, setTrackingExplorerUrl] = useState<string | undefined>()

  // Operations
  const quoteOp = useOperation<SwapQuote[]>()
  const swapOp = useOperation<SwapResult>()

  // Fetch balance when fromAsset changes
  useEffect(() => {
    if (!wallet || !fromAsset) {
      setBalance(null)
      return
    }

    const fetchBalance = async () => {
      try {
        const balances = await wallet.getBalance(fromAsset.chainId)
        const asset = buildAsset(fromAsset)
        const nativeBalance = balances.find(
          (b: any) => b.asset.chain === asset.chain && b.asset.symbol === asset.symbol
        )
        if (nativeBalance) {
          const assetAmt = baseToAsset(nativeBalance.amount)
          setBalance(assetAmt.amount().toFixed(6))
        } else {
          setBalance('0')
        }
      } catch (e) {
        console.warn('[SwapPage] Failed to fetch balance:', e)
        setBalance(null)
      }
    }

    fetchBalance()
  }, [wallet, fromAsset])

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

  // Set amount to percentage of balance
  const handleSetPercentage = (pct: number) => {
    if (balance) {
      const balanceNum = parseFloat(balance)
      setAmount((balanceNum * pct).toFixed(6))
    }
  }

  // Fetch quotes
  const handleGetQuotes = async () => {
    console.log('[SwapPage] handleGetQuotes called', { swapService: !!swapService, fromAsset, toAsset, amount, wallet: !!wallet })

    if (!swapService || !fromAsset || !toAsset || !amount || !wallet) {
      console.log('[SwapPage] Missing required data, aborting')
      return
    }

    const fromAssetObj = buildAsset(fromAsset)
    const toAssetObj = buildAsset(toAsset)
    const decimals = getDecimals(fromAsset.chainId)

    console.log('[SwapPage] Built assets:', { fromAssetObj, toAssetObj, decimals })

    const amountNum = parseFloat(amount)
    if (isNaN(amountNum) || amountNum <= 0) {
      console.log('[SwapPage] Invalid amount:', amount)
      return
    }

    const cryptoAmount = new CryptoAmount(
      assetToBase(assetAmount(amountNum, decimals)),
      fromAssetObj
    )

    console.log('[SwapPage] CryptoAmount:', cryptoAmount.assetAmount.amount().toString())

    // Get addresses
    const fromAddress = await wallet.getAddress(fromAsset.chainId)
    const destinationAddress = await wallet.getAddress(toAsset.chainId)

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
        })
        console.log('[SwapPage] estimateSwap result:', result)
        setQuotes(result)
        // Auto-select best quote
        if (result.length > 0) {
          const validQuotes = result.filter(q => q.canSwap)
          console.log('[SwapPage] Valid quotes:', validQuotes.length)
          if (validQuotes.length > 0) {
            const bestQuote = validQuotes.reduce((best, current) =>
              current.expectedAmount.baseAmount.amount().gt(best.expectedAmount.baseAmount.amount()) ? current : best
            )
            setSelectedQuote(bestQuote)
          }
        }
        return result
      },
      { operation: 'estimateSwap', params: { from: fromAsset.chainId, to: toAsset.chainId, amount } }
    )
  }

  // Execute swap
  const handleExecuteSwap = async () => {
    if (!swapService || !fromAsset || !toAsset || !amount || !wallet || !selectedQuote) return

    const fromAssetObj = buildAsset(fromAsset)
    const toAssetObj = buildAsset(toAsset)
    const decimals = getDecimals(fromAsset.chainId)
    const amountNum = parseFloat(amount)

    const cryptoAmount = new CryptoAmount(
      assetToBase(assetAmount(amountNum, decimals)),
      fromAssetObj
    )

    const fromAddress = await wallet.getAddress(fromAsset.chainId)
    const destinationAddress = await wallet.getAddress(toAsset.chainId)

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
        })

        // Open tracking modal on success
        if (result.hash) {
          setTrackingTxHash(result.hash)
          setTrackingProtocol(selectedQuote.protocol)
          setTrackingExplorerUrl(result.url)
          setIsTrackingOpen(true)
        }

        return result
      },
      { operation: 'doSwap', params: { from: fromAsset.chainId, to: toAsset.chainId, amount, protocol: selectedQuote.protocol } }
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
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-2">
            Connect Wallet
          </h2>
          <p className="text-gray-500 dark:text-gray-400">
            Please connect your wallet to use the swap feature.
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

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        {/* Header */}
        <div className="border-b border-gray-200 dark:border-gray-700 px-6 py-4">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">Swap</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Cross-chain swaps via THORChain and MAYAChain
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
                excludeChain={toAsset?.chainId}
              />
              {fromAsset && balance !== null && (
                <div className="mt-2 flex items-center justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">
                    Balance: {balance} {fromAsset.symbol}
                    {balanceUsdFormatted && (
                      <span className="text-gray-400 dark:text-gray-500 ml-1">
                        ({balanceUsdFormatted})
                      </span>
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
              excludeChain={fromAsset?.chainId}
            />
          </div>

          {/* Amount Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Amount
            </label>
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
          </div>

          {/* Get Quote Button */}
          <button
            onClick={handleGetQuotes}
            disabled={!fromAsset || !toAsset || !amount || quoteOp.loading}
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
                    <p className="font-mono text-gray-900 dark:text-gray-100 break-all mt-1">
                      {swapOp.result.hash}
                    </p>
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
        />
      )}

      {/* Code Examples */}
      {fromAsset && toAsset && amount && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 space-y-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Code Examples</h3>
          <CodePreview
            code={generateSwapEstimateCode(
              fromAsset.chainId,
              toAsset.chainId,
              amount,
              selectedQuote?.protocol === 'Mayachain' ? 'MAYAChain' : 'THORChain'
            )}
            title="Get Swap Quote"
          />
          <CodePreview
            code={generateSwapExecuteCode(
              fromAsset.chainId,
              toAsset.chainId,
              amount,
              selectedQuote?.protocol === 'Mayachain' ? 'MAYAChain' : 'THORChain'
            )}
            title="Execute Swap"
          />
        </div>
      )}
    </div>
  )
}
