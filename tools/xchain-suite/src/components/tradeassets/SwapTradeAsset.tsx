import { useState, useEffect, useCallback } from 'react'
import { useOperation } from '../../hooks/useOperation'
import { ResultPanel } from '../ui/ResultPanel'
import { CodePreview } from '../ui/CodePreview'
import { TradeAssetIcon } from './TradeAssetIcon'
import { AssetIcon } from '../swap/assetIcons'
import {
  assetAmount,
  assetToBase,
  assetToString,
  baseToAsset,
} from '@xchainjs/xchain-util'
import { ArrowDownUp } from 'lucide-react'

interface SwapTradeAssetProps {
  thorchainAmm: any
  mayachainAmm: any
  wallet: any
}

type Protocol = 'thorchain' | 'mayachain'

const TRADE_ASSET_OPTIONS = [
  { label: 'BTC', chain: 'BTC', symbol: 'BTC', tradeSymbol: 'BTC~BTC' },
  { label: 'ETH', chain: 'ETH', symbol: 'ETH', tradeSymbol: 'ETH~ETH' },
  { label: 'AVAX', chain: 'AVAX', symbol: 'AVAX', tradeSymbol: 'AVAX~AVAX' },
  { label: 'BNB', chain: 'BSC', symbol: 'BNB', tradeSymbol: 'BSC~BNB' },
  { label: 'BCH', chain: 'BCH', symbol: 'BCH', tradeSymbol: 'BCH~BCH' },
  { label: 'LTC', chain: 'LTC', symbol: 'LTC', tradeSymbol: 'LTC~LTC' },
  { label: 'DOGE', chain: 'DOGE', symbol: 'DOGE', tradeSymbol: 'DOGE~DOGE' },
  { label: 'ATOM', chain: 'GAIA', symbol: 'ATOM', tradeSymbol: 'GAIA~ATOM' },
]

const NATIVE_CONFIG: Record<Protocol, { label: string; key: string; chain: string; symbol: string }> = {
  thorchain: { label: 'RUNE', key: 'RUNE', chain: 'THOR', symbol: 'RUNE' },
  mayachain: { label: 'CACAO', key: 'CACAO', chain: 'MAYA', symbol: 'CACAO' },
}

interface QuoteResult {
  expectedAmount: string
  fees: string
  slipBasisPoints: string
  canSwap: boolean
  errors: string[]
  memo: string
}

interface SwapResult {
  hash: string
  url?: string
}

export function SwapTradeAsset({ thorchainAmm, mayachainAmm, wallet }: SwapTradeAssetProps) {
  const [protocol, setProtocol] = useState<Protocol>('thorchain')
  const [fromIndex, setFromIndex] = useState(0)
  const [toIndex, setToIndex] = useState(1)
  const [fromIsNative, setFromIsNative] = useState(false)
  const [toIsNative, setToIsNative] = useState(false)
  const [amount, setAmount] = useState('')
  const [fromBalance, setFromBalance] = useState<string | null>(null)
  const [loadingBalance, setLoadingBalance] = useState(false)

  const quoteOp = useOperation<QuoteResult>()
  const swapOp = useOperation<SwapResult>()

  const amm = protocol === 'thorchain' ? thorchainAmm : mayachainAmm
  const protocolPrefix = protocol === 'thorchain' ? 'THOR' : 'MAYA'
  const native = NATIVE_CONFIG[protocol]

  // Fetch trade account balance for the selected "from" asset
  const fetchBalance = useCallback(async () => {
    if (!wallet || !amm) return
    setLoadingBalance(true)
    try {
      const { assetToString: ats } = await import('@xchainjs/xchain-util')
      const queryMod = protocol === 'thorchain'
        ? await import('@xchainjs/xchain-thorchain-query')
        : await import('@xchainjs/xchain-mayachain-query')

      if (fromIsNative) {
        // For native assets, we'd need chain balance - skip for now
        setFromBalance(null)
      } else {
        const address = await wallet.getAddress(protocolPrefix)
        const query = protocol === 'thorchain'
          ? (amm as any).thorchainQuery || new (queryMod as any).ThorchainQuery()
          : (amm as any).mayachainQuery || new (queryMod as any).MayachainQuery()
        const accounts = await query.getAddressTradeAccounts({ address })
        const tradeSymbol = TRADE_ASSET_OPTIONS[fromIndex].tradeSymbol
        const match = (accounts || []).find((a: any) => {
          const bal = a.balance || a.units
          const assetStr = bal ? ats(bal.asset) : ''
          return assetStr.includes(tradeSymbol)
        })
        if (match) {
          const bal = match.balance || match.units
          setFromBalance(baseToAsset(bal.baseAmount).amount().toFixed(8))
        } else {
          setFromBalance('0')
        }
      }
    } catch {
      setFromBalance(null)
    } finally {
      setLoadingBalance(false)
    }
  }, [wallet, amm, protocol, protocolPrefix, fromIsNative, fromIndex])

  useEffect(() => {
    fetchBalance()
  }, [fetchBalance])

  const handleMax = () => {
    if (fromBalance) setAmount(fromBalance)
  }

  const buildAsset = async (tradeSymbol: string, isNative: boolean) => {
    const { assetFromStringEx } = await import('@xchainjs/xchain-util')
    if (isNative) {
      if (protocol === 'thorchain') {
        const { AssetRuneNative } = await import('@xchainjs/xchain-thorchain')
        return AssetRuneNative
      } else {
        const { AssetCacao } = await import('@xchainjs/xchain-mayachain')
        return AssetCacao
      }
    }
    // Trade assets use just 'BTC~BTC' format (tilde IS the chain/symbol delimiter)
    // NOT 'THOR.BTC~BTC' which assetFromString misparses as NATIVE type
    return assetFromStringEx(tradeSymbol)
  }

  const handleFlip = () => {
    setFromIndex(toIndex)
    setToIndex(fromIndex)
    setFromIsNative(toIsNative)
    setToIsNative(fromIsNative)
    quoteOp.reset()
  }

  const handleGetQuote = async () => {
    if (!amm || !wallet || !amount) return
    const amountNum = parseFloat(amount)
    if (isNaN(amountNum) || amountNum <= 0) return

    await quoteOp.execute(
      async () => {
        const { TradeCryptoAmount, CryptoAmount, isTradeAsset } = await import('@xchainjs/xchain-util')

        const fromAsset = await buildAsset(TRADE_ASSET_OPTIONS[fromIndex].tradeSymbol, fromIsNative)
        const toAsset = await buildAsset(TRADE_ASSET_OPTIONS[toIndex].tradeSymbol, toIsNative)

        let cryptoAmount: any
        if (isTradeAsset(fromAsset)) {
          cryptoAmount = new TradeCryptoAmount(assetToBase(assetAmount(amountNum, 8)), fromAsset)
        } else {
          const decimals = protocol === 'thorchain' ? 8 : 10
          cryptoAmount = new CryptoAmount(assetToBase(assetAmount(amountNum, decimals)), fromAsset)
        }

        const fromAddress = await wallet.getAddress(protocolPrefix)
        const destinationAddress = await wallet.getAddress(protocolPrefix)

        const quote = await amm.estimateSwap({
          fromAsset,
          destinationAsset: toAsset,
          amount: cryptoAmount,
          fromAddress,
          destinationAddress,
          affiliateAddress: 'xc',
          affiliateBps: 0,
        })

        const txEstimate = quote.txEstimate || quote
        const expectedAmount = txEstimate.expectedAmount || txEstimate.netOutput
        const fees = txEstimate.fees || txEstimate.totalFees

        return {
          expectedAmount: expectedAmount
            ? `${baseToAsset(expectedAmount.baseAmount).amount().toFixed(8)} ${assetToString(expectedAmount.asset)}`
            : 'N/A',
          fees: fees?.totalFee
            ? `${baseToAsset(fees.totalFee.baseAmount).amount().toFixed(8)} ${assetToString(fees.totalFee.asset)}`
            : 'N/A',
          slipBasisPoints: String(txEstimate.slipBasisPoints ?? quote.slipBasisPoints ?? '0'),
          canSwap: txEstimate.canSwap ?? quote.canSwap ?? true,
          errors: txEstimate.errors || quote.errors || [],
          memo: quote.memo || txEstimate.memo || '',
        }
      },
      { operation: 'quoteTradeSwap', params: { protocol, amount } }
    )
  }

  const handleExecuteSwap = async () => {
    if (!amm || !wallet || !amount) return
    const amountNum = parseFloat(amount)
    if (isNaN(amountNum) || amountNum <= 0) return

    await swapOp.execute(
      async () => {
        const { TradeCryptoAmount, CryptoAmount, isTradeAsset } = await import('@xchainjs/xchain-util')

        const fromAsset = await buildAsset(TRADE_ASSET_OPTIONS[fromIndex].tradeSymbol, fromIsNative)
        const toAsset = await buildAsset(TRADE_ASSET_OPTIONS[toIndex].tradeSymbol, toIsNative)

        let cryptoAmount: any
        if (isTradeAsset(fromAsset)) {
          cryptoAmount = new TradeCryptoAmount(assetToBase(assetAmount(amountNum, 8)), fromAsset)
        } else {
          const decimals = protocol === 'thorchain' ? 8 : 10
          cryptoAmount = new CryptoAmount(assetToBase(assetAmount(amountNum, decimals)), fromAsset)
        }

        const fromAddress = await wallet.getAddress(protocolPrefix)
        const destinationAddress = await wallet.getAddress(protocolPrefix)

        const result = await amm.doSwap({
          fromAsset,
          destinationAsset: toAsset,
          amount: cryptoAmount,
          fromAddress,
          destinationAddress,
          affiliateAddress: 'xc',
          affiliateBps: 0,
        })

        return { hash: result.hash, url: result.url }
      },
      { operation: 'executeTradeSwap', params: { protocol, amount } }
    )
  }

  // Current from/to display info
  const fromAssetInfo = fromIsNative ? native : TRADE_ASSET_OPTIONS[fromIndex]
  const toAssetInfo = toIsNative ? native : TRADE_ASSET_OPTIONS[toIndex]

  const generateCode = () => {
    const ammClass = protocol === 'thorchain' ? 'ThorchainAMM' : 'MayachainAMM'
    const ammPkg = protocol === 'thorchain' ? 'xchain-thorchain-amm' : 'xchain-mayachain-amm'
    const queryClass = protocol === 'thorchain' ? 'ThorchainQuery' : 'MayachainQuery'
    const queryPkg = protocol === 'thorchain' ? 'xchain-thorchain-query' : 'xchain-mayachain-query'
    const fromLabel = fromIsNative ? native.key : TRADE_ASSET_OPTIONS[fromIndex].tradeSymbol
    const toLabel = toIsNative ? native.key : TRADE_ASSET_OPTIONS[toIndex].tradeSymbol
    return `import { ${ammClass} } from '@xchainjs/${ammPkg}'
import { ${queryClass} } from '@xchainjs/${queryPkg}'
import { TradeCryptoAmount, assetAmount, assetToBase, assetFromStringEx } from '@xchainjs/xchain-util'
import { Wallet } from '@xchainjs/xchain-wallet'

const wallet = new Wallet({ /* chain clients */ })
const amm = new ${ammClass}(new ${queryClass}(), wallet)

// Swap ${amount || '0.1'} ${fromLabel} -> ${toLabel}
const fromAsset = assetFromStringEx('${fromIsNative ? `${protocolPrefix}.${fromLabel}` : fromLabel}')
const toAsset = assetFromStringEx('${toIsNative ? `${protocolPrefix}.${toLabel}` : toLabel}')
const amount = new TradeCryptoAmount(assetToBase(assetAmount(${amount || '0.1'}, 8)), fromAsset)

const quote = await amm.estimateSwap({
  fromAsset, destinationAsset: toAsset, amount,
  fromAddress: await wallet.getAddress('${protocolPrefix}'),
  destinationAddress: await wallet.getAddress('${protocolPrefix}'),
})

const result = await amm.doSwap({ fromAsset, destinationAsset: toAsset, amount })
console.log('Swap TX:', result.hash)`
  }

  return (
    <div className="space-y-5">
      {/* Protocol Selector */}
      <div className="flex rounded-lg bg-gray-100 dark:bg-gray-700/50 p-1">
        {(['thorchain', 'mayachain'] as Protocol[]).map((p) => (
          <button
            key={p}
            onClick={() => { setProtocol(p); quoteOp.reset(); swapOp.reset() }}
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
              protocol === p
                ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100 shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            {p === 'thorchain' ? 'THORChain' : 'MAYAChain'}
          </button>
        ))}
      </div>

      {/* From Card */}
      <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 p-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">From</span>
          {fromBalance !== null && (
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Balance: <span className="font-mono">{loadingBalance ? '...' : fromBalance}</span>
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          {/* Asset Selector Button */}
          <div className="relative">
            <select
              value={fromIsNative ? 'NATIVE' : String(fromIndex)}
              onChange={(e) => {
                if (e.target.value === 'NATIVE') {
                  setFromIsNative(true)
                } else {
                  setFromIsNative(false)
                  setFromIndex(Number(e.target.value))
                }
                quoteOp.reset()
              }}
              className="appearance-none pl-10 pr-8 py-2.5 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-900 dark:text-gray-100 cursor-pointer hover:border-gray-300 dark:hover:border-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            >
              <option value="NATIVE">{native.label}</option>
              {TRADE_ASSET_OPTIONS.map((opt, i) => (
                <option key={opt.tradeSymbol} value={i} disabled={!toIsNative && i === toIndex}>
                  {opt.tradeSymbol}
                </option>
              ))}
            </select>
            <div className="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
              {fromIsNative
                ? <AssetIcon chainId={native.chain} symbol={native.symbol} size={22} />
                : <TradeAssetIcon chainId={fromAssetInfo.chain} symbol={fromAssetInfo.symbol} size={22} />
              }
            </div>
            <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
              <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </div>
          </div>

          {/* Amount Input + Max */}
          <div className="flex-1 flex items-center gap-2">
            <input
              type="text"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="flex-1 min-w-0 px-3 py-2.5 bg-transparent text-right text-lg font-mono text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none"
            />
            <button
              onClick={handleMax}
              disabled={!fromBalance || loadingBalance}
              className="px-2.5 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 rounded-md hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              MAX
            </button>
          </div>
        </div>
      </div>

      {/* Flip Button */}
      <div className="flex justify-center -my-2 relative z-10">
        <button
          onClick={handleFlip}
          className="p-2 rounded-full bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 shadow-sm hover:shadow-md hover:border-gray-300 dark:hover:border-gray-500 transition-all active:scale-95"
          title="Swap direction"
        >
          <ArrowDownUp size={16} className="text-gray-600 dark:text-gray-300" />
        </button>
      </div>

      {/* To Card */}
      <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 p-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">To</span>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <select
              value={toIsNative ? 'NATIVE' : String(toIndex)}
              onChange={(e) => {
                if (e.target.value === 'NATIVE') {
                  setToIsNative(true)
                } else {
                  setToIsNative(false)
                  setToIndex(Number(e.target.value))
                }
                quoteOp.reset()
              }}
              className="appearance-none pl-10 pr-8 py-2.5 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-900 dark:text-gray-100 cursor-pointer hover:border-gray-300 dark:hover:border-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            >
              <option value="NATIVE">{native.label}</option>
              {TRADE_ASSET_OPTIONS.map((opt, i) => (
                <option key={opt.tradeSymbol} value={i} disabled={!fromIsNative && i === fromIndex}>
                  {opt.tradeSymbol}
                </option>
              ))}
            </select>
            <div className="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
              {toIsNative
                ? <AssetIcon chainId={native.chain} symbol={native.symbol} size={22} />
                : <TradeAssetIcon chainId={toAssetInfo.chain} symbol={toAssetInfo.symbol} size={22} />
              }
            </div>
            <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
              <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </div>
          </div>

          <div className="flex-1 text-right text-lg font-mono text-gray-400 dark:text-gray-500 pr-3">
            {quoteOp.result ? quoteOp.result.expectedAmount.split(' ')[0] : '—'}
          </div>
        </div>
      </div>

      {/* Validation */}
      {fromIsNative && toIsNative && (
        <p className="text-sm text-amber-600 dark:text-amber-400 text-center">
          Cannot swap native to native. Select at least one trade asset.
        </p>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button
          onClick={handleGetQuote}
          disabled={!amount || quoteOp.loading || (fromIsNative && toIsNative)}
          className="flex-1 py-3 text-sm font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {quoteOp.loading ? 'Getting Quote...' : 'Get Quote'}
        </button>
        <button
          onClick={handleExecuteSwap}
          disabled={!amount || swapOp.loading || !quoteOp.result?.canSwap}
          className="flex-1 py-3 text-sm font-semibold text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {swapOp.loading ? 'Swapping...' : 'Execute Swap'}
        </button>
      </div>

      {/* Quote Result */}
      <ResultPanel loading={quoteOp.loading} error={quoteOp.error} duration={quoteOp.duration}>
        {quoteOp.result && (
          <div className="space-y-2 text-sm">
            <p className="font-medium text-gray-900 dark:text-gray-100">Swap Quote</p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
              <span className="text-gray-500 dark:text-gray-400">Expected Output</span>
              <span className="font-mono text-gray-900 dark:text-gray-100 text-right">{quoteOp.result.expectedAmount}</span>
              <span className="text-gray-500 dark:text-gray-400">Fees</span>
              <span className="font-mono text-gray-900 dark:text-gray-100 text-right">{quoteOp.result.fees}</span>
              <span className="text-gray-500 dark:text-gray-400">Slippage (bps)</span>
              <span className="font-mono text-gray-900 dark:text-gray-100 text-right">{quoteOp.result.slipBasisPoints}</span>
              <span className="text-gray-500 dark:text-gray-400">Can Swap</span>
              <span className={`text-right font-medium ${quoteOp.result.canSwap ? 'text-emerald-600' : 'text-red-600'}`}>
                {quoteOp.result.canSwap ? 'Yes' : 'No'}
              </span>
            </div>
            {quoteOp.result.errors.length > 0 && (
              <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 rounded-lg text-red-700 dark:text-red-300 text-xs">
                {quoteOp.result.errors.map((err, i) => <p key={i}>{err}</p>)}
              </div>
            )}
          </div>
        )}
      </ResultPanel>

      {/* Swap Result */}
      <ResultPanel loading={swapOp.loading} error={swapOp.error} duration={swapOp.duration}>
        {swapOp.result && (
          <div className="space-y-2">
            <p className="text-emerald-700 dark:text-emerald-300 font-medium">Swap Submitted!</p>
            <div>
              <span className="text-gray-500 dark:text-gray-400 text-sm">Transaction Hash:</span>
              <p className="font-mono text-sm text-gray-900 dark:text-gray-100 break-all">{swapOp.result.hash}</p>
            </div>
            {swapOp.result.url && (
              <a href={swapOp.result.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline text-sm">
                View on Explorer
              </a>
            )}
          </div>
        )}
      </ResultPanel>

      <CodePreview code={generateCode()} title="Trade Asset Swap" />
    </div>
  )
}
