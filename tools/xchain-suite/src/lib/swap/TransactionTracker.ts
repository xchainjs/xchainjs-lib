/**
 * Transaction Tracker for THORChain and MAYAChain swaps
 *
 * Polls the respective node APIs to track swap progress through stages:
 * 1. Inbound Observed - Transaction seen by the network
 * 2. Inbound Finalised - Transaction confirmed on source chain
 * 3. Swap Finalised - Swap executed on the protocol
 * 4. Outbound Signed - Outbound transaction sent to destination
 */

export interface TxStage {
  name: string
  completed: boolean
  timestamp?: number
}

export interface TxStatus {
  hash: string
  protocol: 'Thorchain' | 'Mayachain'
  stages: {
    inbound_observed: TxStage
    inbound_finalised: TxStage
    swap_finalised: TxStage
    outbound_signed: TxStage
  }
  outboundHash?: string
  error?: string
  isComplete: boolean
}

type StatusListener = (status: TxStatus) => void

/**
 * Normalize transaction hash for THORNode/MAYANode API
 * - Remove 0x prefix if present
 * - Convert to uppercase
 */
function normalizeHash(hash: string): string {
  let normalized = hash
  if (normalized.startsWith('0x') || normalized.startsWith('0X')) {
    normalized = normalized.slice(2)
  }
  return normalized.toUpperCase()
}

// Lazy-loaded API instances
let thornodeApiPromise: Promise<any> | null = null
let mayanodeApiPromise: Promise<any> | null = null

async function getThornodeApi() {
  if (!thornodeApiPromise) {
    thornodeApiPromise = (async () => {
      const { TransactionsApi, Configuration } = await import('@xchainjs/xchain-thornode')
      const config = new Configuration({ basePath: 'https://thornode.ninerealms.com' })
      return new TransactionsApi(config)
    })()
  }
  return thornodeApiPromise
}

async function getMayanodeApi() {
  if (!mayanodeApiPromise) {
    mayanodeApiPromise = (async () => {
      const { TransactionsApi, Configuration } = await import('@xchainjs/xchain-mayanode')
      const config = new Configuration({ basePath: 'https://mayanode.mayachain.info' })
      return new TransactionsApi(config)
    })()
  }
  return mayanodeApiPromise
}

export class TransactionTracker {
  private listeners: Map<string, StatusListener[]> = new Map()
  private polling: Map<string, NodeJS.Timeout> = new Map()
  private statuses: Map<string, TxStatus> = new Map()

  /**
   * Start tracking a transaction
   */
  async track(
    hash: string,
    protocol: 'Thorchain' | 'Mayachain',
    onUpdate: StatusListener
  ): Promise<void> {
    const key = `${protocol}:${hash}`

    // Initialize status
    const initialStatus: TxStatus = {
      hash,
      protocol,
      stages: {
        inbound_observed: { name: 'Inbound Observed', completed: false },
        inbound_finalised: { name: 'Inbound Finalised', completed: false },
        swap_finalised: { name: 'Swap Finalised', completed: false },
        outbound_signed: { name: 'Outbound Signed', completed: false },
      },
      isComplete: false,
    }

    this.statuses.set(key, initialStatus)

    // Add listener
    const listeners = this.listeners.get(key) || []
    listeners.push(onUpdate)
    this.listeners.set(key, listeners)

    // Emit initial status
    onUpdate(initialStatus)

    // Start polling
    this.startPolling(hash, protocol)
  }

  /**
   * Stop tracking a transaction
   */
  stop(hash: string, protocol: 'Thorchain' | 'Mayachain'): void {
    const key = `${protocol}:${hash}`

    const interval = this.polling.get(key)
    if (interval) {
      clearInterval(interval)
      this.polling.delete(key)
    }

    this.listeners.delete(key)
    this.statuses.delete(key)
  }

  /**
   * Get current status
   */
  getStatus(hash: string, protocol: 'Thorchain' | 'Mayachain'): TxStatus | undefined {
    return this.statuses.get(`${protocol}:${hash}`)
  }

  private startPolling(hash: string, protocol: 'Thorchain' | 'Mayachain'): void {
    const key = `${protocol}:${hash}`

    // Don't start if already polling
    if (this.polling.has(key)) return

    const poll = async () => {
      try {
        const api = protocol === 'Thorchain'
          ? await getThornodeApi()
          : await getMayanodeApi()

        // Normalize hash for API (remove 0x prefix, uppercase)
        const normalizedHash = normalizeHash(hash)
        const response = await api.txStatus(normalizedHash)
        const data = response.data

        const currentStatus = this.statuses.get(key)
        if (!currentStatus) return

        // Update stages
        const stages = data.stages || {}

        const newStatus: TxStatus = {
          ...currentStatus,
          stages: {
            inbound_observed: {
              name: 'Inbound Observed',
              completed: stages.inbound_observed?.completed ?? false,
              timestamp: stages.inbound_observed?.completed ? Date.now() : undefined,
            },
            inbound_finalised: {
              name: 'Inbound Finalised',
              completed: stages.inbound_finalised?.completed ?? false,
              timestamp: stages.inbound_finalised?.completed ? Date.now() : undefined,
            },
            swap_finalised: {
              name: 'Swap Finalised',
              completed: stages.swap_finalised?.completed ?? false,
              timestamp: stages.swap_finalised?.completed ? Date.now() : undefined,
            },
            outbound_signed: {
              name: 'Outbound Signed',
              completed: stages.outbound_signed?.completed ?? false,
              timestamp: stages.outbound_signed?.completed ? Date.now() : undefined,
            },
          },
          isComplete: stages.outbound_signed?.completed ?? false,
        }

        // Get outbound hash if available
        if (data.out_txs && data.out_txs.length > 0) {
          newStatus.outboundHash = data.out_txs[0].id
        }

        this.statuses.set(key, newStatus)

        // Notify listeners
        const listeners = this.listeners.get(key) || []
        listeners.forEach(listener => listener(newStatus))

        // Stop polling if complete
        if (newStatus.isComplete) {
          this.stopPolling(key)
        }
      } catch (error: any) {
        console.warn(`[TransactionTracker] Poll failed for ${hash}:`, error.message)

        // Update status with error but keep polling
        const currentStatus = this.statuses.get(key)
        if (currentStatus) {
          const errorStatus = {
            ...currentStatus,
            error: error.message || 'Failed to fetch status',
          }
          this.statuses.set(key, errorStatus)

          const listeners = this.listeners.get(key) || []
          listeners.forEach(listener => listener(errorStatus))
        }
      }
    }

    // Poll immediately, then every 5 seconds
    poll()
    const interval = setInterval(poll, 5000)
    this.polling.set(key, interval)
  }

  private stopPolling(key: string): void {
    const interval = this.polling.get(key)
    if (interval) {
      clearInterval(interval)
      this.polling.delete(key)
    }
  }
}

// Singleton instance
export const transactionTracker = new TransactionTracker()
