import { useState, useEffect } from 'react'
import { X, Check, Loader2, ExternalLink, AlertCircle, Copy, CheckCheck } from 'lucide-react'
import { transactionTracker, type TxStatus, type TxStage } from '../../lib/swap/TransactionTracker'

interface SwapTrackingModalProps {
  isOpen: boolean
  onClose: () => void
  txHash: string
  protocol: 'Thorchain' | 'Mayachain'
  explorerUrl?: string
}

const STAGE_ORDER = ['inbound_observed', 'inbound_finalised', 'swap_finalised', 'outbound_signed'] as const

const STAGE_LABELS: Record<string, { title: string; description: string }> = {
  inbound_observed: {
    title: 'Inbound Observed',
    description: 'Transaction detected by the network',
  },
  inbound_finalised: {
    title: 'Inbound Confirmed',
    description: 'Transaction confirmed on source chain',
  },
  swap_finalised: {
    title: 'Swap Executed',
    description: 'Swap completed on the protocol',
  },
  outbound_signed: {
    title: 'Outbound Sent',
    description: 'Funds sent to destination address',
  },
}

function StageItem({ stage, stageKey, isActive }: { stage: TxStage; stageKey: string; isActive: boolean }) {
  const label = STAGE_LABELS[stageKey]

  return (
    <div className={`flex items-start gap-3 p-3 rounded-lg transition-colors ${
      stage.completed
        ? 'bg-green-50 dark:bg-green-900/20'
        : isActive
        ? 'bg-blue-50 dark:bg-blue-900/20'
        : 'bg-gray-50 dark:bg-gray-800'
    }`}>
      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
        stage.completed
          ? 'bg-green-500 text-white'
          : isActive
          ? 'bg-blue-500 text-white'
          : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400'
      }`}>
        {stage.completed ? (
          <Check className="w-4 h-4" />
        ) : isActive ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <span className="text-xs font-medium">{STAGE_ORDER.indexOf(stageKey as any) + 1}</span>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className={`font-medium ${
          stage.completed
            ? 'text-green-700 dark:text-green-300'
            : isActive
            ? 'text-blue-700 dark:text-blue-300'
            : 'text-gray-500 dark:text-gray-400'
        }`}>
          {label.title}
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {label.description}
        </p>
      </div>
    </div>
  )
}

export function SwapTrackingModal({
  isOpen,
  onClose,
  txHash,
  protocol,
  explorerUrl,
}: SwapTrackingModalProps) {
  const [status, setStatus] = useState<TxStatus | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!isOpen || !txHash) return

    transactionTracker.track(txHash, protocol, setStatus)

    return () => {
      transactionTracker.stop(txHash, protocol)
    }
  }, [isOpen, txHash, protocol])

  const handleCopy = async () => {
    await navigator.clipboard.writeText(txHash)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (!isOpen) return null

  // Find current active stage (first incomplete)
  const activeStageIndex = status
    ? STAGE_ORDER.findIndex(key => !status.stages[key].completed)
    : 0

  const trackerUrl = protocol === 'Thorchain'
    ? `https://track.ninerealms.com/${txHash}`
    : `https://www.mayascan.org/tx/${txHash}`

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />

      {/* Modal */}
      <div className="relative z-[101] w-full max-w-md bg-white dark:bg-gray-800 rounded-xl shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Transaction Progress
          </h2>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Transaction Hash */}
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Transaction Hash
              </span>
              <span className="text-xs font-medium text-blue-600 dark:text-blue-400">
                {protocol}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <code className="flex-1 text-sm font-mono text-gray-900 dark:text-gray-100 truncate">
                {txHash}
              </code>
              <button
                onClick={handleCopy}
                className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                title="Copy hash"
              >
                {copied ? (
                  <CheckCheck className="w-4 h-4 text-green-500" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Error Display */}
          {status?.error && (
            <div className="flex items-start gap-2 p-3 bg-yellow-50 dark:bg-yellow-900/30 rounded-lg">
              <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-yellow-700 dark:text-yellow-300">
                  Waiting for transaction...
                </p>
                <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">
                  {status.error}
                </p>
              </div>
            </div>
          )}

          {/* Stages */}
          <div className="space-y-2">
            {STAGE_ORDER.map((stageKey, index) => (
              <StageItem
                key={stageKey}
                stageKey={stageKey}
                stage={status?.stages[stageKey] || { name: stageKey, completed: false }}
                isActive={index === activeStageIndex}
              />
            ))}
          </div>

          {/* Completion Message */}
          {status?.isComplete && (
            <div className="bg-green-50 dark:bg-green-900/30 rounded-lg p-4 text-center">
              <Check className="w-8 h-8 text-green-500 mx-auto mb-2" />
              <p className="font-medium text-green-700 dark:text-green-300">
                Swap Complete!
              </p>
              <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                Your funds have been sent to your destination address.
              </p>
            </div>
          )}

          {/* Outbound Hash */}
          {status?.outboundHash && (
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3">
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Outbound Transaction
              </span>
              <code className="block text-sm font-mono text-gray-900 dark:text-gray-100 truncate mt-1">
                {status.outboundHash}
              </code>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-4 border-t border-gray-200 dark:border-gray-700">
          <a
            href={trackerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors flex items-center justify-center gap-2"
          >
            View on Tracker <ExternalLink className="w-4 h-4" />
          </a>
          {explorerUrl && (
            <a
              href={explorerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center justify-center gap-2"
            >
              Explorer <ExternalLink className="w-4 h-4" />
            </a>
          )}
        </div>
      </div>
    </div>
  )
}
