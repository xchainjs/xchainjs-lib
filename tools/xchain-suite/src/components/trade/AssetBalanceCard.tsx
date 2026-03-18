import { useState, useEffect } from 'react'
import { Wallet } from 'lucide-react'
import { useWallet } from '../../contexts/WalletContext'
import { useChainClient } from '../../hooks/useChainClient'
import { useBalanceUsdValue } from '../../hooks/usePrices'
import { baseToAsset } from '@xchainjs/xchain-util'

interface Props {
  asset: string
}

// Map trade asset ID to chain ID for client creation
const ASSET_TO_CHAIN: Record<string, string> = {
  BTC: 'BTC', ETH: 'ETH', SOL: 'SOL', AVAX: 'AVAX', DOGE: 'DOGE',
  LTC: 'LTC', BCH: 'BCH', XRP: 'XRP', ADA: 'ADA', BNB: 'BSC',
  ARB: 'ARB', SUI: 'SUI', GAIA: 'GAIA', THOR: 'THOR', MAYA: 'MAYA',
  KUJI: 'KUJI', DASH: 'DASH', ZEC: 'ZEC', XRD: 'XRD', XMR: 'XMR',
}

export function AssetBalanceCard({ asset }: Props) {
  const { isConnected } = useWallet()
  const chainId = ASSET_TO_CHAIN[asset] ?? asset
  const { client } = useChainClient(chainId)
  const [balance, setBalance] = useState<string | null>(null)
  const [balanceLoading, setBalanceLoading] = useState(false)

  // Construct a minimal asset object for price lookup
  const assetObj = { chain: chainId, symbol: asset, ticker: asset, type: 0 as const }
  const { usdValueFormatted, loading: priceLoading } = useBalanceUsdValue(balance, assetObj)

  useEffect(() => {
    if (!client || !isConnected) {
      setBalance(null)
      return
    }

    let cancelled = false
    setBalanceLoading(true)

    async function fetchBalance() {
      try {
        const address = await client!.getAddressAsync()
        const balances = await client!.getBalance(address)
        if (cancelled) return

        // Find native asset balance
        const native = balances.find((b) => b.asset.symbol === asset || b.asset.ticker === asset)
        if (native) {
          setBalance(baseToAsset(native.amount).amount().toFixed(6))
        } else {
          setBalance('0')
        }
      } catch {
        if (!cancelled) setBalance(null)
      } finally {
        if (!cancelled) setBalanceLoading(false)
      }
    }

    fetchBalance()
    return () => { cancelled = true }
  }, [client, isConnected, asset])

  if (!isConnected) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm">
          <Wallet className="w-4 h-4" />
          Connect wallet to view balance
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
      <div className="flex items-center gap-2 mb-2">
        <Wallet className="w-4 h-4 text-gray-500 dark:text-gray-400" />
        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">{asset} Balance</span>
      </div>
      {balanceLoading ? (
        <div className="animate-pulse h-7 w-32 bg-gray-200 dark:bg-gray-700 rounded" />
      ) : balance !== null ? (
        <>
          <div className="text-xl font-bold text-gray-900 dark:text-gray-100">
            {parseFloat(balance).toLocaleString(undefined, { maximumFractionDigits: 6 })} {asset}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {priceLoading ? '...' : usdValueFormatted}
          </div>
        </>
      ) : (
        <div className="text-sm text-gray-500 dark:text-gray-400">Unable to fetch balance</div>
      )}
    </div>
  )
}
