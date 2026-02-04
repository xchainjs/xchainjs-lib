import { useOperation } from '../../hooks/useOperation'
import { ResultPanel } from '../ui/ResultPanel'
import type { XChainClient, Fees } from '@xchainjs/xchain-client'
import { baseToAsset, formatAssetAmountCurrency } from '@xchainjs/xchain-util'
import type { BaseAmount } from '@xchainjs/xchain-util'

interface GetFeesProps {
  chainId: string
  client: XChainClient | null
}

interface FeesResult {
  fees: Fees
}

export function GetFees({ chainId, client }: GetFeesProps) {
  const { execute, result, error, loading, duration } = useOperation<FeesResult>()

  const handleExecute = async () => {
    await execute(async () => {
      if (!client) {
        throw new Error('Client not available. Please connect wallet first.')
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
        <h3 className="text-lg font-medium text-gray-900 mb-4">Get Fees</h3>
        <p className="text-sm text-gray-500 mb-4">
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
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                Average
              </p>
              <p className="text-lg font-mono text-gray-900">
                {formatFee(result.fees.average)}
              </p>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-xs font-medium text-blue-600 uppercase tracking-wider mb-1">
                Fast
              </p>
              <p className="text-lg font-mono text-gray-900">
                {formatFee(result.fees.fast)}
              </p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <p className="text-xs font-medium text-green-600 uppercase tracking-wider mb-1">
                Fastest
              </p>
              <p className="text-lg font-mono text-gray-900">
                {formatFee(result.fees.fastest)}
              </p>
            </div>
          </div>
        )}
      </ResultPanel>
    </div>
  )
}
