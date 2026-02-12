import { useState } from 'react'
import { useOperation } from '../../hooks/useOperation'
import { ResultPanel } from '../ui/ResultPanel'
import { CodePreview } from '../ui/CodePreview'
import { assetAmount, assetToBase } from '@xchainjs/xchain-util'

interface WithdrawTradeAssetProps {
  thorchainAmm: any
  wallet: any
}

// Trade assets that can be withdrawn (THOR~ASSET format)
const TRADE_ASSETS = [
  { chain: 'BTC', symbol: 'BTC', tradeSymbol: 'BTC~BTC', decimals: 8 },
  { chain: 'ETH', symbol: 'ETH', tradeSymbol: 'ETH~ETH', decimals: 8 }, // Trade assets use 8 decimals
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

export function WithdrawTradeAsset({ thorchainAmm, wallet }: WithdrawTradeAssetProps) {
  const [selectedAsset, setSelectedAsset] = useState(TRADE_ASSETS[0])
  const [amount, setAmount] = useState('')
  const withdrawOp = useOperation<WithdrawResult>()

  const handleWithdraw = async () => {
    if (!thorchainAmm || !wallet || !amount) return

    const amountNum = parseFloat(amount)
    if (isNaN(amountNum) || amountNum <= 0) return

    await withdrawOp.execute(
      async () => {
        // Import the required utilities dynamically
        const { assetFromStringEx, TradeCryptoAmount, isTradeAsset } = await import('@xchainjs/xchain-util')

        // Create the trade asset (e.g., "THOR.BTC~BTC")
        const asset = assetFromStringEx(`THOR.${selectedAsset.tradeSymbol}`)

        if (!isTradeAsset(asset)) {
          throw new Error(`Invalid trade asset: THOR.${selectedAsset.tradeSymbol}`)
        }

        // Trade assets always use 8 decimals - isTradeAsset narrows type to TradeAsset
        const tradeCryptoAmount = new TradeCryptoAmount(
          assetToBase(assetAmount(amountNum, 8)),
          asset
        )

        // Get the destination address for the underlying chain
        const destinationAddress = await wallet.getAddress(selectedAsset.chain)

        const result = await thorchainAmm.withdrawFromTradeAccount({
          amount: tradeCryptoAmount,
          address: destinationAddress,
        })
        return result
      },
      { operation: 'withdrawTradeAsset', params: { asset: selectedAsset.tradeSymbol, amount } }
    )
  }

  const generateCode = () => {
    return `import { ThorchainAMM } from '@xchainjs/xchain-thorchain-amm'
import { ThorchainQuery } from '@xchainjs/xchain-thorchain-query'
import { TradeCryptoAmount, assetAmount, assetToBase, assetFromStringEx } from '@xchainjs/xchain-util'
import { Wallet } from '@xchainjs/xchain-wallet'

// Initialize wallet with chain clients
const wallet = new Wallet({ /* chain clients */ })
const thorchainAmm = new ThorchainAMM(new ThorchainQuery(), wallet)

// Withdraw ${amount || '0.1'} ${selectedAsset.tradeSymbol} from trade account
const tradeAsset = assetFromStringEx('THOR.${selectedAsset.tradeSymbol}')
const amount = new TradeCryptoAmount(
  assetToBase(assetAmount(${amount || '0.1'}, 8)), // Trade assets use 8 decimals
  tradeAsset
)

const result = await thorchainAmm.withdrawFromTradeAccount({
  amount,
  address: await wallet.getAddress('${selectedAsset.chain}'), // L1 address to receive withdrawal
})

console.log('Withdraw TX:', result.hash)`
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {/* Trade Asset Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Trade Asset to Withdraw
          </label>
          <select
            value={selectedAsset.tradeSymbol}
            onChange={(e) => {
              const asset = TRADE_ASSETS.find(a => a.tradeSymbol === e.target.value)
              if (asset) setSelectedAsset(asset)
            }}
            className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {TRADE_ASSETS.map((asset) => (
              <option key={asset.tradeSymbol} value={asset.tradeSymbol}>
                {asset.tradeSymbol} (receives {asset.symbol} on {asset.chain})
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
              {selectedAsset.tradeSymbol}
            </span>
          </div>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            You will receive {selectedAsset.symbol} on the {selectedAsset.chain} chain
          </p>
        </div>

        {/* Withdraw Button */}
        <button
          onClick={handleWithdraw}
          disabled={!amount || withdrawOp.loading}
          className="w-full px-4 py-2.5 text-sm font-medium text-white bg-orange-600 rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {withdrawOp.loading ? 'Withdrawing...' : `Withdraw ${selectedAsset.tradeSymbol}`}
        </button>
      </div>

      {/* Result */}
      <ResultPanel loading={withdrawOp.loading} error={withdrawOp.error} duration={withdrawOp.duration}>
        {withdrawOp.result && (
          <div className="space-y-2">
            <p className="text-green-700 dark:text-green-300 font-medium">Withdrawal Submitted!</p>
            <div>
              <span className="text-gray-500 dark:text-gray-400 text-sm">Transaction Hash:</span>
              <p className="font-mono text-sm text-gray-900 dark:text-gray-100 break-all">
                {withdrawOp.result.hash}
              </p>
            </div>
            {withdrawOp.result.url && (
              <a
                href={withdrawOp.result.url}
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
      <CodePreview code={generateCode()} title="Withdraw from Trade Account" />
    </div>
  )
}
