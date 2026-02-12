import { useState } from 'react'
import { Shield, Check } from 'lucide-react'
import { useWallet } from '../contexts/WalletContext'
import { useLiquidity } from '../hooks/useLiquidity'
import { useOperation } from '../hooks/useOperation'
import { ResultPanel } from '../components/ui/ResultPanel'
import { CodePreview } from '../components/ui/CodePreview'
import { assetAmount, assetToBase, AssetType, CryptoAmount, type TokenAsset } from '@xchainjs/xchain-util'

// Common ERC-20 tokens on supported EVM chains
const EVM_TOKENS = [
  // Ethereum
  { chain: 'ETH', symbol: 'USDT', address: '0xdAC17F958D2ee523a2206206994597C13D831ec7', decimals: 6 },
  { chain: 'ETH', symbol: 'USDC', address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', decimals: 6 },
  { chain: 'ETH', symbol: 'WBTC', address: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599', decimals: 8 },
  { chain: 'ETH', symbol: 'DAI', address: '0x6B175474E89094C44Da98b954EesdfgDCB61C2', decimals: 18 },
  // Avalanche
  { chain: 'AVAX', symbol: 'USDC', address: '0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E', decimals: 6 },
  { chain: 'AVAX', symbol: 'USDT', address: '0x9702230A8Ea53601f5cD2dc00fDBc13d4dF4A8c7', decimals: 6 },
  // BSC
  { chain: 'BSC', symbol: 'USDT', address: '0x55d398326f99059fF775485246999027B3197955', decimals: 18 },
  { chain: 'BSC', symbol: 'USDC', address: '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d', decimals: 18 },
  // Arbitrum
  { chain: 'ARB', symbol: 'USDC', address: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831', decimals: 6 },
  { chain: 'ARB', symbol: 'USDT', address: '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9', decimals: 6 },
]

const EVM_CHAINS = ['ETH', 'AVAX', 'BSC', 'ARB']

type Protocol = 'THORChain' | 'MAYAChain'

interface ApprovalResult {
  hash: string
  url?: string
}

export default function RouterApprovalPage() {
  const { isConnected } = useWallet()
  const { thorchainAmm, wallet, loading, error } = useLiquidity()
  const [selectedChain, setSelectedChain] = useState('ETH')
  const [selectedToken, setSelectedToken] = useState(EVM_TOKENS[0])
  const [amount, setAmount] = useState('')
  const [protocol, setProtocol] = useState<Protocol>('THORChain')
  const approveOp = useOperation<ApprovalResult>()

  // Filter tokens by selected chain
  const availableTokens = EVM_TOKENS.filter(t => t.chain === selectedChain)

  // Update selected token when chain changes
  const handleChainChange = (chain: string) => {
    setSelectedChain(chain)
    const firstToken = EVM_TOKENS.find(t => t.chain === chain)
    if (firstToken) setSelectedToken(firstToken)
  }

  const handleApprove = async () => {
    if (!wallet || !amount) return

    const amountNum = parseFloat(amount)
    if (isNaN(amountNum) || amountNum <= 0) return

    await approveOp.execute(
      async () => {
        // Build the token asset with correct type
        const tokenAsset: TokenAsset = {
          chain: selectedToken.chain,
          symbol: `${selectedToken.symbol}-${selectedToken.address}`,
          ticker: selectedToken.symbol,
          type: AssetType.TOKEN,
        }

        const cryptoAmount = new CryptoAmount(
          assetToBase(assetAmount(amountNum, selectedToken.decimals)),
          tokenAsset
        )

        if (protocol === 'THORChain') {
          if (!thorchainAmm) throw new Error('THORChain AMM not initialized')
          const result = await thorchainAmm.approveRouterToSpend({
            asset: tokenAsset,
            amount: cryptoAmount,
          })
          return result
        } else {
          // Initialize MAYAChain AMM
          const { MayachainAMM } = await import('@xchainjs/xchain-mayachain-amm')
          const { MayachainQuery } = await import('@xchainjs/xchain-mayachain-query')
          const mayachainAmm = new MayachainAMM(new MayachainQuery(), wallet)
          const result = await mayachainAmm.approveRouterToSpend({
            asset: tokenAsset,
            amount: cryptoAmount,
          })
          return result
        }
      },
      { operation: 'approveRouter', params: { token: selectedToken.symbol, amount, protocol } }
    )
  }

  const generateCode = () => {
    const ammImport = protocol === 'THORChain'
      ? `import { ThorchainAMM } from '@xchainjs/xchain-thorchain-amm'
import { ThorchainQuery } from '@xchainjs/xchain-thorchain-query'`
      : `import { MayachainAMM } from '@xchainjs/xchain-mayachain-amm'
import { MayachainQuery } from '@xchainjs/xchain-mayachain-query'`

    const ammInit = protocol === 'THORChain'
      ? 'const amm = new ThorchainAMM(new ThorchainQuery(), wallet)'
      : 'const amm = new MayachainAMM(new MayachainQuery(), wallet)'

    return `${ammImport}
import { CryptoAmount, assetAmount, assetToBase, AssetType } from '@xchainjs/xchain-util'
import { Wallet } from '@xchainjs/xchain-wallet'

// Initialize wallet with EVM chain client
const wallet = new Wallet({ /* chain clients */ })
${ammInit}

// Define the ERC-20 token to approve
const tokenAsset = {
  chain: '${selectedToken.chain}',
  symbol: '${selectedToken.symbol}-${selectedToken.address}',
  ticker: '${selectedToken.symbol}',
  type: AssetType.TOKEN,
}

// Approve ${protocol} router to spend ${amount || '1000'} ${selectedToken.symbol}
const result = await amm.approveRouterToSpend({
  asset: tokenAsset,
  amount: new CryptoAmount(
    assetToBase(assetAmount(${amount || '1000'}, ${selectedToken.decimals})),
    tokenAsset
  ),
})

console.log('Approval TX:', result.hash)`
  }

  if (!isConnected) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="text-center py-8">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-2">
            Connect Wallet
          </h2>
          <p className="text-gray-500 dark:text-gray-400">
            Please connect your wallet to approve router spending.
          </p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex items-center gap-3">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
          <p className="text-gray-600 dark:text-gray-300">Initializing...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="text-red-600 dark:text-red-400">
          <p className="font-medium">Failed to initialize</p>
          <p className="text-sm mt-1">{error.message}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        {/* Header */}
        <div className="border-b border-gray-200 dark:border-gray-700 px-6 py-4">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">Router Approval</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Approve THORChain or MAYAChain router to spend ERC-20 tokens
          </p>
        </div>

        {/* Info Banner */}
        <div className="mx-6 mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">Why is approval needed?</h3>
          <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
            Before swapping ERC-20 tokens via THORChain or MAYAChain, you must approve the router contract to spend
            your tokens. This is a one-time approval per token per protocol. You can revoke approvals anytime.
          </p>
        </div>

        <div className="p-6 space-y-6">
          <div className="space-y-4">
            {/* Protocol Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Protocol
              </label>
              <div className="grid grid-cols-2 gap-3">
                {(['THORChain', 'MAYAChain'] as Protocol[]).map((p) => (
                  <button
                    key={p}
                    onClick={() => setProtocol(p)}
                    className={`px-4 py-3 text-sm font-medium rounded-lg border transition-colors ${
                      protocol === p
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Chain Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Chain
              </label>
              <div className="grid grid-cols-4 gap-2">
                {EVM_CHAINS.map((chain) => (
                  <button
                    key={chain}
                    onClick={() => handleChainChange(chain)}
                    className={`px-3 py-2 text-sm font-medium rounded-lg border transition-colors ${
                      selectedChain === chain
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'
                    }`}
                  >
                    {chain}
                  </button>
                ))}
              </div>
            </div>

            {/* Token Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Token
              </label>
              <select
                value={selectedToken.symbol}
                onChange={(e) => {
                  const token = availableTokens.find(t => t.symbol === e.target.value)
                  if (token) setSelectedToken(token)
                }}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {availableTokens.map((token) => (
                  <option key={token.symbol} value={token.symbol}>
                    {token.symbol}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 font-mono">
                {selectedToken.address}
              </p>
            </div>

            {/* Amount Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Amount to Approve
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
                  {selectedToken.symbol}
                </span>
              </div>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Tip: Approve a large amount to avoid repeated approvals
              </p>
            </div>

            {/* Approve Button */}
            <button
              onClick={handleApprove}
              disabled={!amount || approveOp.loading}
              className="w-full px-4 py-2.5 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {approveOp.loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Approving...
                </>
              ) : (
                <>
                  <Shield className="w-4 h-4" />
                  Approve {protocol} Router
                </>
              )}
            </button>
          </div>

          {/* Result */}
          <ResultPanel loading={approveOp.loading} error={approveOp.error} duration={approveOp.duration}>
            {approveOp.result && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
                  <Check className="w-5 h-5" />
                  <span className="font-medium">Approval Successful!</span>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400 text-sm">Transaction Hash:</span>
                  <p className="font-mono text-sm text-gray-900 dark:text-gray-100 break-all">
                    {approveOp.result.hash}
                  </p>
                </div>
                {approveOp.result.url && (
                  <a
                    href={approveOp.result.url}
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
          <CodePreview code={generateCode()} title="Approve Router to Spend" />
        </div>
      </div>
    </div>
  )
}
