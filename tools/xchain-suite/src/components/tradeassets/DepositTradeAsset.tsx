import { useState, useEffect, useCallback } from 'react'
import { useOperation } from '../../hooks/useOperation'
import { ResultPanel } from '../ui/ResultPanel'
import { CodePreview } from '../ui/CodePreview'
import { AssetIcon } from '../swap/assetIcons'
import { TradeAssetIcon } from './TradeAssetIcon'
import {
  assetAmount,
  assetToBase,
  baseToAsset,
  CryptoAmount,
  AssetType,
  type Asset,
} from '@xchainjs/xchain-util'
import { ArrowRight } from 'lucide-react'

type Protocol = 'thorchain' | 'mayachain'

interface DepositTradeAssetProps {
  thorchainAmm: any
  mayachainAmm: any
  wallet: any
  supportedChains: string[]
}

const DEPOSITABLE_ASSETS = [
  { chain: 'BTC', symbol: 'BTC', decimals: 8 },
  { chain: 'ETH', symbol: 'ETH', decimals: 18 },
  { chain: 'AVAX', symbol: 'AVAX', decimals: 18 },
  { chain: 'BSC', symbol: 'BNB', decimals: 18 },
  { chain: 'BCH', symbol: 'BCH', decimals: 8 },
  { chain: 'LTC', symbol: 'LTC', decimals: 8 },
  { chain: 'DOGE', symbol: 'DOGE', decimals: 8 },
  { chain: 'GAIA', symbol: 'ATOM', decimals: 6 },
]

interface DepositResult {
  hash: string
  url?: string
}

export function DepositTradeAsset({ thorchainAmm, mayachainAmm, wallet, supportedChains }: DepositTradeAssetProps) {
  const [protocol, setProtocol] = useState<Protocol>('thorchain')
  const [selectedAsset, setSelectedAsset] = useState(DEPOSITABLE_ASSETS[0])
  const [amount, setAmount] = useState('')
  const [maxBalance, setMaxBalance] = useState<string | null>(null)
  const [loadingBalance, setLoadingBalance] = useState(false)
  const depositOp = useOperation<DepositResult>()

  const amm = protocol === 'thorchain' ? thorchainAmm : mayachainAmm
  const protocolChain = protocol === 'thorchain' ? 'THOR' : 'MAYA'

  const availableAssets = DEPOSITABLE_ASSETS.filter(asset =>
    supportedChains.includes(asset.chain)
  )

  // Fetch L1 balance for selected asset
  const fetchBalance = useCallback(async () => {
    if (!wallet) return
    setLoadingBalance(true)
    try {
      const address = await wallet.getAddress(selectedAsset.chain)
      const balances = await wallet.getBalance(selectedAsset.chain, address)
      const native = balances?.find((b: any) => b.asset?.symbol === selectedAsset.symbol && b.asset?.chain === selectedAsset.chain)
      if (native) {
        setMaxBalance(baseToAsset(native.amount).amount().toFixed(selectedAsset.decimals))
      } else if (balances && balances.length > 0) {
        setMaxBalance(baseToAsset(balances[0].amount).amount().toFixed(selectedAsset.decimals))
      } else {
        setMaxBalance('0')
      }
    } catch {
      setMaxBalance(null)
    } finally {
      setLoadingBalance(false)
    }
  }, [wallet, selectedAsset])

  useEffect(() => {
    fetchBalance()
  }, [fetchBalance])

  const handleMax = () => {
    if (maxBalance) setAmount(maxBalance)
  }

  const handleDeposit = async () => {
    if (!amm || !wallet || !amount) return
    const amountNum = parseFloat(amount)
    if (isNaN(amountNum) || amountNum <= 0) return

    const asset: Asset = {
      chain: selectedAsset.chain,
      symbol: selectedAsset.symbol,
      ticker: selectedAsset.symbol,
      type: AssetType.NATIVE,
    }

    const cryptoAmount = new CryptoAmount(
      assetToBase(assetAmount(amountNum, selectedAsset.decimals)),
      asset
    )

    await depositOp.execute(
      async () => {
        const address = await wallet.getAddress(protocolChain)
        const result = await amm.addToTradeAccount({
          amount: cryptoAmount,
          address,
        })
        return result
      },
      { operation: 'depositTradeAsset', params: { protocol, asset: selectedAsset.symbol, amount } }
    )
  }

  const generateCode = () => {
    const ammClass = protocol === 'thorchain' ? 'ThorchainAMM' : 'MayachainAMM'
    const ammPkg = protocol === 'thorchain' ? 'xchain-thorchain-amm' : 'xchain-mayachain-amm'
    const queryClass = protocol === 'thorchain' ? 'ThorchainQuery' : 'MayachainQuery'
    const queryPkg = protocol === 'thorchain' ? 'xchain-thorchain-query' : 'xchain-mayachain-query'
    return `import { ${ammClass} } from '@xchainjs/${ammPkg}'
import { ${queryClass} } from '@xchainjs/${queryPkg}'
import { CryptoAmount, assetAmount, assetToBase, assetFromStringEx } from '@xchainjs/xchain-util'
import { Wallet } from '@xchainjs/xchain-wallet'

const wallet = new Wallet({ /* chain clients */ })
const amm = new ${ammClass}(new ${queryClass}(), wallet)

// Deposit ${amount || '0.1'} ${selectedAsset.symbol} to trade account
const asset = assetFromStringEx('${selectedAsset.chain}.${selectedAsset.symbol}')
const amount = new CryptoAmount(
  assetToBase(assetAmount(${amount || '0.1'}, ${selectedAsset.decimals})),
  asset
)

const result = await amm.addToTradeAccount({
  amount,
  address: await wallet.getAddress('${protocolChain}'),
})

console.log('Deposit TX:', result.hash)`
  }

  return (
    <div className="space-y-5">
      {/* Protocol Selector */}
      <div className="flex rounded-lg bg-gray-100 dark:bg-gray-700/50 p-1">
        {(['thorchain', 'mayachain'] as Protocol[]).map((p) => (
          <button
            key={p}
            onClick={() => { setProtocol(p); depositOp.reset() }}
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

      {/* Deposit Card */}
      <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 p-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">You Send (L1)</span>
          {maxBalance !== null && (
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Balance: <span className="font-mono">{loadingBalance ? '...' : maxBalance}</span>
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          {/* Asset Selector */}
          <div className="relative">
            <select
              value={`${selectedAsset.chain}.${selectedAsset.symbol}`}
              onChange={(e) => {
                const [chain, symbol] = e.target.value.split('.')
                const asset = availableAssets.find(a => a.chain === chain && a.symbol === symbol)
                if (asset) setSelectedAsset(asset)
              }}
              className="appearance-none pl-10 pr-8 py-2.5 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-900 dark:text-gray-100 cursor-pointer hover:border-gray-300 dark:hover:border-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            >
              {availableAssets.map((asset) => (
                <option key={`${asset.chain}.${asset.symbol}`} value={`${asset.chain}.${asset.symbol}`}>
                  {asset.symbol} ({asset.chain})
                </option>
              ))}
            </select>
            <div className="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
              <AssetIcon chainId={selectedAsset.chain} symbol={selectedAsset.symbol} size={22} />
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
              disabled={!maxBalance || loadingBalance}
              className="px-2.5 py-1 text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 rounded-md hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              MAX
            </button>
          </div>
        </div>
      </div>

      {/* Arrow */}
      <div className="flex justify-center -my-2">
        <div className="p-2 rounded-full bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 shadow-sm">
          <ArrowRight size={16} className="text-emerald-500" />
        </div>
      </div>

      {/* Receive Card */}
      <div className="rounded-xl border border-emerald-200 dark:border-emerald-800/50 bg-emerald-50/50 dark:bg-emerald-900/10 p-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 uppercase tracking-wide">You Receive (Trade Asset)</span>
        </div>
        <div className="flex items-center gap-3">
          <TradeAssetIcon chainId={selectedAsset.chain} symbol={selectedAsset.symbol} size={28} />
          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
            {selectedAsset.chain}~{selectedAsset.symbol}
          </span>
          <span className="ml-auto text-lg font-mono text-gray-900 dark:text-gray-100 pr-3">
            {amount || '—'}
          </span>
        </div>
      </div>

      {/* Deposit Button */}
      <button
        onClick={handleDeposit}
        disabled={!amount || depositOp.loading}
        className="w-full py-3 text-sm font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {depositOp.loading ? 'Depositing...' : `Deposit ${selectedAsset.symbol}`}
      </button>

      {/* Result */}
      <ResultPanel loading={depositOp.loading} error={depositOp.error} duration={depositOp.duration}>
        {depositOp.result && (
          <div className="space-y-2">
            <p className="text-emerald-700 dark:text-emerald-300 font-medium">Deposit Submitted!</p>
            <div>
              <span className="text-gray-500 dark:text-gray-400 text-sm">Transaction Hash:</span>
              <p className="font-mono text-sm text-gray-900 dark:text-gray-100 break-all">{depositOp.result.hash}</p>
            </div>
            {depositOp.result.url && (
              <a href={depositOp.result.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline text-sm">
                View on Explorer
              </a>
            )}
          </div>
        )}
      </ResultPanel>

      <CodePreview code={generateCode()} title="Deposit to Trade Account" />
    </div>
  )
}
