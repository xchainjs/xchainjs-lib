import { useState } from 'react'
import { useOperation } from '../../hooks/useOperation'
import { ResultPanel } from '../ui/ResultPanel'
import { CodePreview } from '../ui/CodePreview'
import {
  assetAmount,
  assetToBase,
  CryptoAmount,
  AssetType,
  type Asset,
} from '@xchainjs/xchain-util'

interface DepositTradeAssetProps {
  thorchainAmm: any
  wallet: any
  supportedChains: string[]
}

// Assets that can be deposited as trade assets (L1 assets only)
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

export function DepositTradeAsset({ thorchainAmm, wallet, supportedChains }: DepositTradeAssetProps) {
  const [selectedAsset, setSelectedAsset] = useState(DEPOSITABLE_ASSETS[0])
  const [amount, setAmount] = useState('')
  const depositOp = useOperation<DepositResult>()

  // Filter depositable assets by supported chains
  const availableAssets = DEPOSITABLE_ASSETS.filter(asset =>
    supportedChains.includes(asset.chain)
  )

  const handleDeposit = async () => {
    if (!thorchainAmm || !wallet || !amount) return

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
        const thorAddress = await wallet.getAddress('THOR')
        const result = await thorchainAmm.addToTradeAccount({
          amount: cryptoAmount,
          address: thorAddress,
        })
        return result
      },
      { operation: 'depositTradeAsset', params: { asset: selectedAsset.symbol, amount } }
    )
  }

  const generateCode = () => {
    return `import { ThorchainAMM } from '@xchainjs/xchain-thorchain-amm'
import { ThorchainQuery } from '@xchainjs/xchain-thorchain-query'
import { CryptoAmount, assetAmount, assetToBase, assetFromStringEx } from '@xchainjs/xchain-util'
import { Wallet } from '@xchainjs/xchain-wallet'

// Initialize wallet with chain clients
const wallet = new Wallet({ /* chain clients */ })
const thorchainAmm = new ThorchainAMM(new ThorchainQuery(), wallet)

// Deposit ${amount || '0.1'} ${selectedAsset.symbol} to trade account
const asset = assetFromStringEx('${selectedAsset.chain}.${selectedAsset.symbol}')
const amount = new CryptoAmount(
  assetToBase(assetAmount(${amount || '0.1'}, ${selectedAsset.decimals})),
  asset
)

const result = await thorchainAmm.addToTradeAccount({
  amount,
  address: await wallet.getAddress('THOR'), // THORChain address to receive trade asset
})

console.log('Deposit TX:', result.hash)`
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {/* Asset Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Asset to Deposit
          </label>
          <select
            value={`${selectedAsset.chain}.${selectedAsset.symbol}`}
            onChange={(e) => {
              const [chain, symbol] = e.target.value.split('.')
              const asset = availableAssets.find(a => a.chain === chain && a.symbol === symbol)
              if (asset) setSelectedAsset(asset)
            }}
            className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {availableAssets.map((asset) => (
              <option key={`${asset.chain}.${asset.symbol}`} value={`${asset.chain}.${asset.symbol}`}>
                {asset.symbol} ({asset.chain})
              </option>
            ))}
          </select>
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
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 text-sm">
              {selectedAsset.symbol}
            </span>
          </div>
        </div>

        {/* Deposit Button */}
        <button
          onClick={handleDeposit}
          disabled={!amount || depositOp.loading}
          className="w-full px-4 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {depositOp.loading ? 'Depositing...' : `Deposit ${selectedAsset.symbol}`}
        </button>
      </div>

      {/* Result */}
      <ResultPanel loading={depositOp.loading} error={depositOp.error} duration={depositOp.duration}>
        {depositOp.result && (
          <div className="space-y-2">
            <p className="text-green-700 dark:text-green-300 font-medium">Deposit Submitted!</p>
            <div>
              <span className="text-gray-500 dark:text-gray-400 text-sm">Transaction Hash:</span>
              <p className="font-mono text-sm text-gray-900 dark:text-gray-100 break-all">
                {depositOp.result.hash}
              </p>
            </div>
            {depositOp.result.url && (
              <a
                href={depositOp.result.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
              >
                View on Explorer
              </a>
            )}
          </div>
        )}
      </ResultPanel>

      {/* Code Example */}
      <CodePreview code={generateCode()} title="Deposit to Trade Account" />
    </div>
  )
}
