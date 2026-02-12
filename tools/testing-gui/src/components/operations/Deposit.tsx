import { useState, useEffect } from 'react'
import { ChevronDown, ExternalLink } from 'lucide-react'
import { useOperation } from '../../hooks/useOperation'
import { ResultPanel } from '../ui/ResultPanel'
import { CodePreview } from '../ui/CodePreview'
import type { XChainClient } from '@xchainjs/xchain-client'
import { assetToBase, assetAmount, baseToAsset } from '@xchainjs/xchain-util'
import { getChainById } from '../../lib/chains'

interface DepositProps {
  chainId: string
  client: XChainClient | null
}

interface DepositResult {
  txHash: string
}

// Common memo templates for THORChain/MAYAChain
const MEMO_TEMPLATES: Record<string, { label: string; template: string; description: string }[]> = {
  THOR: [
    { label: 'THORName Register', template: '~:{name}:{chain}:{address}:{owner}:THOR.RUNE', description: 'Register a new THORName' },
    { label: 'THORName Update', template: '~:{name}:{chain}:{address}:{owner}:THOR.RUNE', description: 'Update/extend THORName expiry' },
    { label: 'Add Liquidity', template: '+:{pool}:{affiliate}:{affiliateBps}', description: 'Add liquidity to a pool (e.g., +:BTC.BTC)' },
    { label: 'Add Liquidity (Sym)', template: '+:{pool}', description: 'Add symmetric liquidity' },
    { label: 'Withdraw Liquidity', template: '-:{pool}:{basisPoints}', description: 'Withdraw liquidity (10000 = 100%)' },
    { label: 'Swap', template: '=:{destAsset}:{destAddress}:{limit}:{affiliate}:{affiliateBps}', description: 'Swap to destination asset' },
    { label: 'Swap (Streaming)', template: '=:{destAsset}:{destAddress}:{limit}/{interval}/{quantity}', description: 'Streaming swap' },
    { label: 'Donate to Pool', template: 'DONATE:{pool}', description: 'Donate to a pool reserve' },
    { label: 'Bond', template: 'BOND:{nodeAddress}', description: 'Bond RUNE to a node' },
    { label: 'Unbond', template: 'UNBOND:{nodeAddress}:{amount}', description: 'Unbond RUNE from a node' },
    { label: 'Leave', template: 'LEAVE:{nodeAddress}', description: 'Node operator leave' },
    { label: 'Reserve', template: 'RESERVE', description: 'Add to network reserve' },
    { label: 'RUNEPool Deposit', template: 'POOL+', description: 'Deposit to RUNEPool' },
    { label: 'RUNEPool Withdraw', template: 'POOL-:{basisPoints}', description: 'Withdraw from RUNEPool' },
    { label: 'Trade+ Deposit', template: 'TRADE+:{address}', description: 'Deposit to Trade Account' },
    { label: 'Trade- Withdraw', template: 'TRADE-:{address}', description: 'Withdraw from Trade Account' },
    { label: 'NoOp (Refund)', template: 'NOOP:NOVAULT', description: 'No operation, triggers refund' },
  ],
  MAYA: [
    { label: 'MAYAName Register', template: '~:{name}:{chain}:{address}:{owner}:MAYA.CACAO', description: 'Register a new MAYAName' },
    { label: 'MAYAName Update', template: '~:{name}:{chain}:{address}:{owner}:MAYA.CACAO', description: 'Update/extend MAYAName expiry' },
    { label: 'Add Liquidity', template: '+:{pool}:{affiliate}:{affiliateBps}', description: 'Add liquidity to a pool (e.g., +:BTC.BTC)' },
    { label: 'Add Liquidity (Sym)', template: '+:{pool}', description: 'Add symmetric liquidity' },
    { label: 'Withdraw Liquidity', template: '-:{pool}:{basisPoints}', description: 'Withdraw liquidity (10000 = 100%)' },
    { label: 'Swap', template: '=:{destAsset}:{destAddress}:{limit}:{affiliate}:{affiliateBps}', description: 'Swap to destination asset' },
    { label: 'Swap (Streaming)', template: '=:{destAsset}:{destAddress}:{limit}/{interval}/{quantity}', description: 'Streaming swap' },
    { label: 'Donate to Pool', template: 'DONATE:{pool}', description: 'Donate to a pool reserve' },
    { label: 'Bond', template: 'BOND:{nodeAddress}', description: 'Bond CACAO to a node' },
    { label: 'Unbond', template: 'UNBOND:{nodeAddress}:{amount}', description: 'Unbond CACAO from a node' },
    { label: 'Leave', template: 'LEAVE:{nodeAddress}', description: 'Node operator leave' },
    { label: 'Reserve', template: 'RESERVE', description: 'Add to network reserve' },
    { label: 'Trade+ Deposit', template: 'TRADE+:{address}', description: 'Deposit to Trade Account' },
    { label: 'Trade- Withdraw', template: 'TRADE-:{address}', description: 'Withdraw from Trade Account' },
    { label: 'NoOp (Refund)', template: 'NOOP:NOVAULT', description: 'No operation, triggers refund' },
  ],
}

const EXPLORER_TX_URLS: Record<string, string> = {
  THOR: 'https://runescan.io/tx/',
  MAYA: 'https://www.mayascan.org/tx/',
}

export function Deposit({ chainId, client }: DepositProps) {
  const [amount, setAmount] = useState('')
  const [memo, setMemo] = useState('')
  const [showConfirm, setShowConfirm] = useState(false)
  const [showMemoHelper, setShowMemoHelper] = useState(false)
  const [maxBalance, setMaxBalance] = useState<string | null>(null)
  const [loadingBalance, setLoadingBalance] = useState(false)
  const { execute, result, error, loading, duration } = useOperation<DepositResult>()

  const nativeAsset = chainId === 'THOR' ? 'RUNE' : chainId === 'MAYA' ? 'CACAO' : ''
  const memoTemplates = MEMO_TEMPLATES[chainId] || []

  // Fetch balance when client is available
  useEffect(() => {
    const fetchBalance = async () => {
      if (!client) {
        setMaxBalance(null)
        return
      }
      setLoadingBalance(true)
      try {
        const address = await client.getAddressAsync(0)
        const balances = await client.getBalance(address)
        if (balances.length > 0) {
          const chainInfo = getChainById(chainId)
          const decimals = chainInfo?.decimals ?? 8
          const assetAmt = baseToAsset(balances[0].amount)
          setMaxBalance(assetAmt.amount().toFixed(decimals))
        } else {
          setMaxBalance('0')
        }
      } catch (e) {
        console.error('Failed to fetch balance for max:', e)
        setMaxBalance(null)
      } finally {
        setLoadingBalance(false)
      }
    }
    fetchBalance()
  }, [client, chainId])

  const handleMax = () => {
    if (maxBalance) {
      setAmount(maxBalance)
    }
  }

  const handleSelectTemplate = (template: string) => {
    setMemo(template)
    setShowMemoHelper(false)
  }

  const handleExecute = async () => {
    setShowConfirm(false)
    await execute(async () => {
      if (!client) {
        throw new Error('Client not available. Please connect wallet first.')
      }

      // Check if client has deposit method
      if (!('deposit' in client) || typeof (client as any).deposit !== 'function') {
        throw new Error('Deposit not supported for this chain')
      }

      const chainInfo = getChainById(chainId)
      const decimals = chainInfo?.decimals ?? 8
      const baseAmt = assetToBase(assetAmount(amount, decimals))

      const txHash = await (client as any).deposit({
        amount: baseAmt,
        memo,
      })
      return { txHash }
    })
  }

  const getExplorerUrl = (txHash: string): string | null => {
    const baseUrl = EXPLORER_TX_URLS[chainId]
    return baseUrl ? `${baseUrl}${txHash}` : null
  }

  const generateDepositCode = (): string => {
    const clientImport = chainId === 'THOR' ? 'xchain-thorchain' : 'xchain-mayachain'
    return `import { Client } from '@xchainjs/${clientImport}'
import { assetToBase, assetAmount } from '@xchainjs/xchain-util'

const client = new Client({ phrase: 'your mnemonic...' })

// Make a deposit with custom memo
const txHash = await client.deposit({
  amount: assetToBase(assetAmount(${amount || '1'}, 8)),
  memo: '${memo || '~:myname:THOR:thor1...:thor1...:THOR.RUNE'}',
})

console.log('Deposit tx:', txHash)`
  }

  if (!client) {
    return (
      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
        <p className="text-yellow-700 dark:text-yellow-300">
          Please connect a wallet to make deposits.
        </p>
      </div>
    )
  }

  // Only show for THOR and MAYA
  if (chainId !== 'THOR' && chainId !== 'MAYA') {
    return (
      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
        <p className="text-gray-600 dark:text-gray-400">
          Deposit with memo is only available for THORChain and MAYAChain.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Info Banner */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">Network Deposit</h3>
        <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
          Send {nativeAsset} with a memo to interact with {chainId === 'THOR' ? 'THORChain' : 'MAYAChain'} protocol.
          This can be used for registering names, adding liquidity, bonding, and more.
        </p>
      </div>

      <div className="space-y-4">
        {/* Amount Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Amount ({nativeAsset})
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.0"
              className="flex-1 px-4 py-2.5 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleMax}
              disabled={!maxBalance || loadingBalance}
              className="px-3 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loadingBalance ? '...' : 'MAX'}
            </button>
          </div>
          {maxBalance && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Balance: {maxBalance} {nativeAsset}
            </p>
          )}
        </div>

        {/* Memo Input */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Memo
            </label>
            <button
              onClick={() => setShowMemoHelper(!showMemoHelper)}
              className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
            >
              Common Memos
              <ChevronDown className={`w-3 h-3 transition-transform ${showMemoHelper ? 'rotate-180' : ''}`} />
            </button>
          </div>
          <textarea
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            placeholder="Enter memo (e.g., ~:myname:THOR:thor1...:thor1...:THOR.RUNE)"
            rows={2}
            className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
          />
        </div>

        {/* Memo Helper Dropdown */}
        {showMemoHelper && (
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
            <div className="bg-gray-50 dark:bg-gray-800 px-4 py-2 border-b border-gray-200 dark:border-gray-700">
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                Select a memo template
              </span>
            </div>
            <div className="max-h-64 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-700/50">
              {memoTemplates.map((item, index) => (
                <button
                  key={index}
                  onClick={() => handleSelectTemplate(item.template)}
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-900 dark:text-gray-100 text-sm">
                      {item.label}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    {item.description}
                  </p>
                  <code className="text-xs text-blue-600 dark:text-blue-400 mt-1 block">
                    {item.template}
                  </code>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Submit Button */}
        {!showConfirm ? (
          <button
            onClick={() => setShowConfirm(true)}
            disabled={!amount || !memo || loading}
            className="w-full px-4 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Deposit
          </button>
        ) : (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 space-y-3">
            <p className="text-yellow-800 dark:text-yellow-200 font-medium">Confirm Deposit</p>
            <div className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
              <p><strong>Amount:</strong> {amount} {nativeAsset}</p>
              <p><strong>Memo:</strong> <code className="text-xs bg-yellow-100 dark:bg-yellow-900/50 px-1 rounded">{memo}</code></p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleExecute}
                disabled={loading}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-yellow-600 rounded-lg hover:bg-yellow-700 transition-colors disabled:opacity-50"
              >
                {loading ? 'Processing...' : 'Confirm'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Result */}
      <ResultPanel loading={loading} error={error} duration={duration}>
        {result && (
          <div className="space-y-2">
            <div>
              <span className="text-xs text-gray-500 dark:text-gray-400">Transaction Hash</span>
              <p className="font-mono text-sm text-gray-900 dark:text-gray-100 break-all">
                {result.txHash}
              </p>
            </div>
            {getExplorerUrl(result.txHash) && (
              <a
                href={getExplorerUrl(result.txHash)!}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400 hover:underline"
              >
                View on Explorer
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        )}
      </ResultPanel>

      {/* Code Example */}
      <CodePreview code={generateDepositCode()} title="Deposit with Memo" />
    </div>
  )
}
