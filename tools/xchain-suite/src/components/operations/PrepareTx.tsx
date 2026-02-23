import { useState, useEffect } from 'react'
import { FileCode } from 'lucide-react'
import { useOperation } from '../../hooks/useOperation'
import { ResultPanel } from '../ui/ResultPanel'
import { CodePreview } from '../ui/CodePreview'
import { assetAmount, assetToBase } from '@xchainjs/xchain-util'
import { getChainById } from '../../lib/chains'
import type { XChainClient } from '@xchainjs/xchain-client'

interface PrepareTxProps {
  chainId: string
  client: XChainClient | null
}

interface PreparedTx {
  rawUnsignedTx: string
}

// Chains that support prepareTx
const SUPPORTED_CHAINS = ['BTC', 'BCH', 'LTC', 'DOGE', 'DASH', 'ETH', 'AVAX', 'BSC', 'ARB']

export function PrepareTx({ chainId, client }: PrepareTxProps) {
  const [sender, setSender] = useState('')
  const [recipient, setRecipient] = useState('')
  const [amount, setAmount] = useState('')
  const [feeRate, setFeeRate] = useState('') // For UTXO chains
  const prepareOp = useOperation<PreparedTx>()

  const chainInfo = getChainById(chainId)
  const decimals = chainInfo?.decimals ?? 8
  const isUtxo = ['BTC', 'BCH', 'LTC', 'DOGE', 'DASH'].includes(chainId)
  const isSupported = SUPPORTED_CHAINS.includes(chainId)

  // Auto-fill sender address when client is available
  useEffect(() => {
    if (client && !sender) {
      const getAddress = async () => {
        try {
          const addr = await client.getAddressAsync()
          setSender(addr)
        } catch (e) {
          console.warn('Failed to get address:', e)
        }
      }
      getAddress()
    }
  }, [client, sender])

  const handlePrepare = async () => {
    if (!client || !sender || !recipient || !amount) return

    const amountNum = parseFloat(amount)
    if (isNaN(amountNum) || amountNum <= 0) return

    await prepareOp.execute(
      async () => {
        const baseAmount = assetToBase(assetAmount(amountNum, decimals))

        const params: any = {
          sender,
          recipient,
          amount: baseAmount,
        }

        // UTXO chains need feeRate
        if (isUtxo && feeRate) {
          params.feeRate = parseInt(feeRate) || 1
        }

        // EVM chains need asset specified
        if (!isUtxo) {
          const { AssetType } = await import('@xchainjs/xchain-util')
          params.asset = {
            chain: chainId,
            symbol: chainInfo?.symbol || chainId,
            ticker: chainInfo?.symbol || chainId,
            type: AssetType.NATIVE,
          }
        }

        const result = await client.prepareTx(params)
        return result
      },
      { operation: 'prepareTx', params: { sender, recipient, amount } }
    )
  }

  const generateCode = () => {
    const clientImport = isUtxo
      ? `import { Client } from '@xchainjs/xchain-${chainId.toLowerCase()}'`
      : `import { Client, Asset${chainId} } from '@xchainjs/xchain-${chainId.toLowerCase()}'`

    const amountCode = `assetToBase(assetAmount(${amount || '0.001'}, ${decimals}))`

    const paramsCode = isUtxo
      ? `{
    sender: '${sender || 'your-address'}',
    recipient: '${recipient || 'recipient-address'}',
    amount: ${amountCode},
    feeRate: ${feeRate || '1'}, // sat/byte
  }`
      : `{
    sender: '${sender || 'your-address'}',
    recipient: '${recipient || 'recipient-address'}',
    amount: ${amountCode},
    asset: Asset${chainId},
  }`

    return `${clientImport}
import { assetAmount, assetToBase } from '@xchainjs/xchain-util'

// Initialize client (without phrase for address-only operations)
const client = new Client({ /* config */ })

// Prepare unsigned transaction
const unsignedTx = await client.prepareTx(${paramsCode})

console.log('Unsigned Raw TX:', unsignedTx.rawUnsignedTx)

// The unsigned transaction can be:
// - Signed by a hardware wallet (Ledger, Trezor)
// - Signed by an external signer
// - Used in multi-signature schemes`
  }

  if (!isSupported) {
    return (
      <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
        <p className="text-yellow-700 dark:text-yellow-300">
          Prepare transaction is not available for {chainId}. Supported chains: {SUPPORTED_CHAINS.join(', ')}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Info Banner */}
      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
        <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">What is Prepare Tx?</h3>
        <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
          Creates an unsigned raw transaction that can be signed externally. Useful for hardware wallets,
          multi-signature setups, or when the signing key is not available locally.
        </p>
      </div>

      <div className="space-y-4">
        {/* Sender Address */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Sender Address
          </label>
          <input
            type="text"
            value={sender}
            onChange={(e) => setSender(e.target.value)}
            placeholder="Your address"
            className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
          />
        </div>

        {/* Recipient Address */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Recipient Address
          </label>
          <input
            type="text"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            placeholder="Destination address"
            className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
          />
        </div>

        {/* Amount */}
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
              {chainInfo?.symbol || chainId}
            </span>
          </div>
        </div>

        {/* Fee Rate (UTXO only) */}
        {isUtxo && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Fee Rate (sat/byte)
            </label>
            <input
              type="number"
              min="1"
              value={feeRate}
              onChange={(e) => setFeeRate(e.target.value)}
              placeholder="1"
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Higher fee rate = faster confirmation
            </p>
          </div>
        )}

        {/* Prepare Button */}
        <button
          onClick={handlePrepare}
          disabled={!sender || !recipient || !amount || prepareOp.loading}
          className="w-full px-4 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {prepareOp.loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Preparing...
            </>
          ) : (
            <>
              <FileCode className="w-4 h-4" />
              Prepare Unsigned Transaction
            </>
          )}
        </button>
      </div>

      {/* Result */}
      <ResultPanel loading={prepareOp.loading} error={prepareOp.error} duration={prepareOp.duration}>
        {prepareOp.result && (
          <div className="space-y-3">
            <p className="text-green-700 dark:text-green-300 font-medium">
              Transaction Prepared Successfully!
            </p>
            <div>
              <span className="text-xs text-gray-500 dark:text-gray-400 block mb-1">
                Raw Unsigned Transaction:
              </span>
              <div className="bg-gray-100 dark:bg-gray-900 rounded-lg p-3 overflow-x-auto">
                <pre className="font-mono text-xs text-gray-900 dark:text-gray-100 whitespace-pre-wrap break-all">
                  {typeof prepareOp.result.rawUnsignedTx === 'string'
                    ? prepareOp.result.rawUnsignedTx
                    : JSON.stringify(prepareOp.result.rawUnsignedTx, null, 2)}
                </pre>
              </div>
            </div>
            <button
              onClick={() => {
                const text = typeof prepareOp.result!.rawUnsignedTx === 'string'
                  ? prepareOp.result!.rawUnsignedTx
                  : JSON.stringify(prepareOp.result!.rawUnsignedTx)
                navigator.clipboard.writeText(text)
              }}
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              Copy to clipboard
            </button>
          </div>
        )}
      </ResultPanel>

      {/* Code Example */}
      <CodePreview code={generateCode()} title="Prepare Unsigned Transaction" />
    </div>
  )
}
