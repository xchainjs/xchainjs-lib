import { useState, useEffect, useCallback } from 'react'
import { useOperation } from '../../hooks/useOperation'
import { ResultPanel } from '../ui/ResultPanel'
import { CodePreview } from '../ui/CodePreview'
import { AssetIcon } from '../swap/assetIcons'
import { TradeAssetIcon } from './TradeAssetIcon'
import { assetAmount, assetToBase, assetToString, baseToAsset } from '@xchainjs/xchain-util'
import { ArrowRight } from 'lucide-react'

type Protocol = 'thorchain' | 'mayachain'

interface WithdrawTradeAssetProps {
  thorchainAmm: any
  mayachainAmm: any
  wallet: any
}

const TRADE_ASSETS = [
  { chain: 'BTC', symbol: 'BTC', tradeSymbol: 'BTC~BTC', decimals: 8 },
  { chain: 'ETH', symbol: 'ETH', tradeSymbol: 'ETH~ETH', decimals: 8 },
  { chain: 'AVAX', symbol: 'AVAX', tradeSymbol: 'AVAX~AVAX', decimals: 8 },
  { chain: 'BSC', symbol: 'BNB', tradeSymbol: 'BSC~BNB', decimals: 8 },
  { chain: 'BCH', symbol: 'BCH', tradeSymbol: 'BCH~BCH', decimals: 8 },
  { chain: 'LTC', symbol: 'LTC', tradeSymbol: 'LTC~LTC', decimals: 8 },
  { chain: 'DOGE', symbol: 'DOGE', tradeSymbol: 'DOGE~DOGE', decimals: 8 },
  { chain: 'GAIA', symbol: 'ATOM', tradeSymbol: 'GAIA~ATOM', decimals: 8 },
]

interface WithdrawResult {
  hash: string
  url?: string
}

export function WithdrawTradeAsset({ thorchainAmm, mayachainAmm, wallet }: WithdrawTradeAssetProps) {
  const [protocol, setProtocol] = useState<Protocol>('thorchain')
  const [selectedAsset, setSelectedAsset] = useState(TRADE_ASSETS[0])
  const [amount, setAmount] = useState('')
  const [tradeBalance, setTradeBalance] = useState<string | null>(null)
  const [loadingBalance, setLoadingBalance] = useState(false)
  const withdrawOp = useOperation<WithdrawResult>()

  const amm = protocol === 'thorchain' ? thorchainAmm : mayachainAmm
  const protocolPrefix = protocol === 'thorchain' ? 'THOR' : 'MAYA'

  // Fetch trade account balance
  const fetchBalance = useCallback(async () => {
    if (!wallet || !amm) return
    setLoadingBalance(true)
    try {
      const { assetToString: ats } = await import('@xchainjs/xchain-util')
      const address = await wallet.getAddress(protocolPrefix)

      const queryMod = protocol === 'thorchain'
        ? await import('@xchainjs/xchain-thorchain-query')
        : await import('@xchainjs/xchain-mayachain-query')
      const query = protocol === 'thorchain'
        ? (amm as any).thorchainQuery || new (queryMod as any).ThorchainQuery()
        : (amm as any).mayachainQuery || new (queryMod as any).MayachainQuery()

      const accounts = await query.getAddressTradeAccounts({ address })
      const match = (accounts || []).find((a: any) => {
        const bal = a.balance || a.units
        const assetStr = bal ? ats(bal.asset) : ''
        return assetStr.includes(selectedAsset.tradeSymbol)
      })
      if (match) {
        const bal = match.balance || match.units
        setTradeBalance(baseToAsset(bal.baseAmount).amount().toFixed(8))
      } else {
        setTradeBalance('0')
      }
    } catch {
      setTradeBalance(null)
    } finally {
      setLoadingBalance(false)
    }
  }, [wallet, amm, protocol, protocolPrefix, selectedAsset])

  useEffect(() => {
    fetchBalance()
  }, [fetchBalance])

  const handleMax = () => {
    if (tradeBalance) setAmount(tradeBalance)
  }

  const handleWithdraw = async () => {
    if (!amm || !wallet || !amount) return
    const amountNum = parseFloat(amount)
    if (isNaN(amountNum) || amountNum <= 0) return

    await withdrawOp.execute(
      async () => {
        const { assetFromStringEx, TradeCryptoAmount, isTradeAsset } = await import('@xchainjs/xchain-util')

        // Trade assets use just 'BTC~BTC' format (tilde IS the chain/symbol delimiter)
        const asset = assetFromStringEx(selectedAsset.tradeSymbol)

        if (!isTradeAsset(asset)) {
          throw new Error(`Invalid trade asset: ${selectedAsset.tradeSymbol}`)
        }

        const tradeCryptoAmount = new TradeCryptoAmount(
          assetToBase(assetAmount(amountNum, 8)),
          asset
        )

        const destinationAddress = await wallet.getAddress(selectedAsset.chain)

        const result = await amm.withdrawFromTradeAccount({
          amount: tradeCryptoAmount,
          address: destinationAddress,
        })
        return result
      },
      { operation: 'withdrawTradeAsset', params: { protocol, asset: selectedAsset.tradeSymbol, amount } }
    )
  }

  const generateCode = () => {
    const ammClass = protocol === 'thorchain' ? 'ThorchainAMM' : 'MayachainAMM'
    const ammPkg = protocol === 'thorchain' ? 'xchain-thorchain-amm' : 'xchain-mayachain-amm'
    const queryClass = protocol === 'thorchain' ? 'ThorchainQuery' : 'MayachainQuery'
    const queryPkg = protocol === 'thorchain' ? 'xchain-thorchain-query' : 'xchain-mayachain-query'
    return `import { ${ammClass} } from '@xchainjs/${ammPkg}'
import { ${queryClass} } from '@xchainjs/${queryPkg}'
import { TradeCryptoAmount, assetAmount, assetToBase, assetFromStringEx } from '@xchainjs/xchain-util'
import { Wallet } from '@xchainjs/xchain-wallet'

const wallet = new Wallet({ /* chain clients */ })
const amm = new ${ammClass}(new ${queryClass}(), wallet)

// Withdraw ${amount || '0.1'} ${selectedAsset.tradeSymbol} from trade account
const tradeAsset = assetFromStringEx('${selectedAsset.tradeSymbol}')
const amount = new TradeCryptoAmount(
  assetToBase(assetAmount(${amount || '0.1'}, 8)),
  tradeAsset
)

const result = await amm.withdrawFromTradeAccount({
  amount,
  address: await wallet.getAddress('${selectedAsset.chain}'),
})

console.log('Withdraw TX:', result.hash)`
  }

  return (
    <div className="space-y-5">
      {/* Protocol Selector */}
      <div className="flex rounded-lg bg-gray-100 dark:bg-gray-700/50 p-1">
        {(['thorchain', 'mayachain'] as Protocol[]).map((p) => (
          <button
            key={p}
            onClick={() => { setProtocol(p); withdrawOp.reset() }}
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

      {/* From (Trade Asset) Card */}
      <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 p-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">You Send (Trade Asset)</span>
          {tradeBalance !== null && (
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Balance: <span className="font-mono">{loadingBalance ? '...' : tradeBalance}</span>
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          {/* Asset Selector */}
          <div className="relative">
            <select
              value={selectedAsset.tradeSymbol}
              onChange={(e) => {
                const asset = TRADE_ASSETS.find(a => a.tradeSymbol === e.target.value)
                if (asset) setSelectedAsset(asset)
              }}
              className="appearance-none pl-10 pr-8 py-2.5 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-900 dark:text-gray-100 cursor-pointer hover:border-gray-300 dark:hover:border-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            >
              {TRADE_ASSETS.map((asset) => (
                <option key={asset.tradeSymbol} value={asset.tradeSymbol}>
                  {asset.tradeSymbol}
                </option>
              ))}
            </select>
            <div className="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
              <TradeAssetIcon chainId={selectedAsset.chain} symbol={selectedAsset.symbol} size={22} />
            </div>
            <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
              <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </div>
          </div>

          {/* Amount + Max */}
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
              disabled={!tradeBalance || loadingBalance}
              className="px-2.5 py-1 text-xs font-semibold text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/30 rounded-md hover:bg-orange-100 dark:hover:bg-orange-900/50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              MAX
            </button>
          </div>
        </div>
      </div>

      {/* Arrow */}
      <div className="flex justify-center -my-2">
        <div className="p-2 rounded-full bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 shadow-sm">
          <ArrowRight size={16} className="text-orange-500" />
        </div>
      </div>

      {/* Receive (L1) Card */}
      <div className="rounded-xl border border-orange-200 dark:border-orange-800/50 bg-orange-50/50 dark:bg-orange-900/10 p-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-medium text-orange-600 dark:text-orange-400 uppercase tracking-wide">You Receive (L1)</span>
        </div>
        <div className="flex items-center gap-3">
          <AssetIcon chainId={selectedAsset.chain} symbol={selectedAsset.symbol} size={28} />
          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
            {selectedAsset.symbol} on {selectedAsset.chain}
          </span>
          <span className="ml-auto text-lg font-mono text-gray-900 dark:text-gray-100 pr-3">
            {amount || '—'}
          </span>
        </div>
      </div>

      {/* Withdraw Button */}
      <button
        onClick={handleWithdraw}
        disabled={!amount || withdrawOp.loading}
        className="w-full py-3 text-sm font-semibold text-white bg-orange-600 rounded-xl hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {withdrawOp.loading ? 'Withdrawing...' : `Withdraw ${selectedAsset.tradeSymbol}`}
      </button>

      {/* Result */}
      <ResultPanel loading={withdrawOp.loading} error={withdrawOp.error} duration={withdrawOp.duration}>
        {withdrawOp.result && (
          <div className="space-y-2">
            <p className="text-emerald-700 dark:text-emerald-300 font-medium">Withdrawal Submitted!</p>
            <div>
              <span className="text-gray-500 dark:text-gray-400 text-sm">Transaction Hash:</span>
              <p className="font-mono text-sm text-gray-900 dark:text-gray-100 break-all">{withdrawOp.result.hash}</p>
            </div>
            {withdrawOp.result.url && (
              <a href={withdrawOp.result.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline text-sm">
                View on Explorer
              </a>
            )}
          </div>
        )}
      </ResultPanel>

      <CodePreview code={generateCode()} title="Withdraw from Trade Account" />
    </div>
  )
}
