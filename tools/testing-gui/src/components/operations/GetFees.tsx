import { useOperation } from '../../hooks/useOperation'
import { ResultPanel } from '../ui/ResultPanel'
import { FeeType, type XChainClient, type Fees } from '@xchainjs/xchain-client'
import { baseToAsset, formatAssetAmountCurrency, baseAmount } from '@xchainjs/xchain-util'
import type { BaseAmount } from '@xchainjs/xchain-util'

interface GetFeesProps {
  chainId: string
  client: XChainClient | null
}

interface FeesResult {
  fees: Fees
}

// EVM chains require tx params for fee estimation
const EVM_CHAINS = ['ETH', 'AVAX', 'BSC', 'ARB']

export function GetFees({ chainId, client }: GetFeesProps) {
  const { execute, result, error, loading, duration } = useOperation<FeesResult>()

  const handleExecute = async () => {
    await execute(async () => {
      if (!client) {
        throw new Error('Client not available. Please connect wallet first.')
      }

      // EVM chains need special handling - get gas price from provider
      if (EVM_CHAINS.includes(chainId)) {
        const evmClient = client as unknown as {
          getProvider: () => { getFeeData: () => Promise<{ gasPrice: bigint | null; maxFeePerGas: bigint | null }> }
        }
        if (evmClient.getProvider) {
          const provider = evmClient.getProvider()
          const feeData = await provider.getFeeData()
          const gasPrice = feeData.maxFeePerGas || feeData.gasPrice || BigInt(0)
          // Estimate for a simple transfer (21000 gas)
          const baseFee = gasPrice * BigInt(21000)
          const fee = baseAmount(baseFee.toString(), 18)
          return {
            fees: {
              average: fee,
              fast: baseAmount((baseFee * BigInt(12) / BigInt(10)).toString(), 18), // 1.2x
              fastest: baseAmount((baseFee * BigInt(15) / BigInt(10)).toString(), 18), // 1.5x
              type: FeeType.PerByte,
            }
          }
        }
      }

      const fees = await client.getFees()
      return { fees }
    })
  }

  const formatFee = (fee: BaseAmount): string => {
    try {
      const assetAmount = baseToAsset(fee)
      return formatAssetAmountCurrency({ amount: assetAmount, trimZeros: true })
    } catch {
      return fee.amount().toString()
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Get Fees</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          Get current network fee estimates for {chainId}.
        </p>
      </div>

      <div className="pt-4">
        <button
          onClick={handleExecute}
          disabled={loading || !client}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Loading...' : 'Get Fees'}
        </button>
      </div>

      <ResultPanel loading={loading} error={error} duration={duration}>
        {result && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                Average
              </p>
              <p className="text-lg font-mono text-gray-900 dark:text-gray-100">
                {formatFee(result.fees.average)}
              </p>
            </div>
            <div className="p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
              <p className="text-xs font-medium text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-1">
                Fast
              </p>
              <p className="text-lg font-mono text-gray-900 dark:text-gray-100">
                {formatFee(result.fees.fast)}
              </p>
            </div>
            <div className="p-4 bg-green-50 dark:bg-green-900/30 rounded-lg">
              <p className="text-xs font-medium text-green-600 dark:text-green-400 uppercase tracking-wider mb-1">
                Fastest
              </p>
              <p className="text-lg font-mono text-gray-900 dark:text-gray-100">
                {formatFee(result.fees.fastest)}
              </p>
            </div>
          </div>
        )}
      </ResultPanel>
    </div>
  )
}
