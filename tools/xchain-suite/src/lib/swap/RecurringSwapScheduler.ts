import type { SwapService, SwapQuote, SwapParams } from './SwapService'
import type { ChainAsset } from '../../components/swap/AssetSelector'
import { AssetType, CryptoAmount, assetAmount, assetToBase, type AnyAsset } from '@xchainjs/xchain-util'
import { getChainById, CHAIN_MIN_SWAP_AMOUNT } from '../chains'

export type RecurringInterval = 'every_minute' | 'every_5min' | 'every_15min' | 'every_30min' | 'every_hour' | 'every_4h' | 'every_day' | 'every_week'
export type ScheduleStatus = 'active' | 'paused' | 'cancelled'

export interface RecurringSchedule {
  id: string
  fromAsset: ChainAsset
  toAsset: ChainAsset
  amount: string
  protocol: 'Thorchain' | 'Mayachain' | 'Chainflip'
  interval: RecurringInterval
  maxSlippageBps: number
  streaming: boolean
  streamingInterval: number
  streamingQuantity: number
  status: ScheduleStatus
  createdAt: number
  nextExecutionAt: number | null
  consecutiveFailures: number
  totalExecutions: number
}

export interface ExecutionRecord {
  id: string
  scheduleId: string
  executedAt: number
  status: 'success' | 'failed' | 'skipped'
  txHash?: string
  error?: string
  skipReason?: string
  slippageBps?: number
}

const INTERVAL_MS: Record<RecurringInterval, number> = {
  every_minute: 60_000,
  every_5min: 300_000,
  every_15min: 900_000,
  every_30min: 1_800_000,
  every_hour: 3_600_000,
  every_4h: 14_400_000,
  every_day: 86_400_000,
  every_week: 604_800_000,
}

const STORAGE_KEY = 'xchain-suite-recurring-schedules'
const HISTORY_KEY_PREFIX = 'xchain-suite-recurring-history-'
const MAX_HISTORY = 100
const MAX_CONSECUTIVE_FAILURES = 3

type Listener = () => void

export class RecurringSwapScheduler {
  private schedules: Map<string, RecurringSchedule> = new Map()
  private timers: Map<string, ReturnType<typeof setTimeout>> = new Map()
  private executing: Set<string> = new Set()
  private listeners: Set<Listener> = new Set()
  private swapService: SwapService
  private wallet: any

  constructor(swapService: SwapService, wallet: any) {
    this.swapService = swapService
    this.wallet = wallet
    this.loadFromStorage()
  }

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  private notify() {
    this.listeners.forEach((fn) => fn())
  }

  getSchedules(): RecurringSchedule[] {
    return Array.from(this.schedules.values())
  }

  getHistory(scheduleId: string): ExecutionRecord[] {
    try {
      const raw = localStorage.getItem(HISTORY_KEY_PREFIX + scheduleId)
      return raw ? JSON.parse(raw) : []
    } catch {
      return []
    }
  }

  createSchedule(config: {
    fromAsset: ChainAsset
    toAsset: ChainAsset
    amount: string
    protocol: 'Thorchain' | 'Mayachain' | 'Chainflip'
    interval: RecurringInterval
    maxSlippageBps: number
    streaming?: boolean
    streamingInterval?: number
    streamingQuantity?: number
    startPaused?: boolean
  }): RecurringSchedule {
    const amountNum = Number(config.amount)
    if (!Number.isFinite(amountNum) || amountNum <= 0) {
      throw new Error('Recurring swap amount must be a positive number')
    }
    const slippage = Math.max(1, Math.min(config.maxSlippageBps, 10000))
    const streamingInterval = config.streamingInterval ?? 1
    const streamingQuantity = config.streamingQuantity ?? 0

    const schedule: RecurringSchedule = {
      id: crypto.randomUUID(),
      fromAsset: config.fromAsset,
      toAsset: config.toAsset,
      amount: config.amount,
      protocol: config.protocol,
      interval: config.interval,
      maxSlippageBps: slippage,
      streaming: config.streaming ?? true,
      streamingInterval,
      streamingQuantity,
      status: config.startPaused ? 'paused' : 'active',
      createdAt: Date.now(),
      nextExecutionAt: config.startPaused ? null : Date.now() + INTERVAL_MS[config.interval],
      consecutiveFailures: 0,
      totalExecutions: 0,
    }

    this.schedules.set(schedule.id, schedule)
    this.persist()

    if (schedule.status === 'active') {
      this.scheduleNext(schedule)
    }

    this.notify()
    return schedule
  }

  pauseSchedule(id: string) {
    const schedule = this.schedules.get(id)
    if (!schedule || schedule.status !== 'active') return

    schedule.status = 'paused'
    schedule.nextExecutionAt = null
    this.clearTimer(id)
    this.persist()
    this.notify()
  }

  resumeSchedule(id: string) {
    const schedule = this.schedules.get(id)
    if (!schedule || schedule.status !== 'paused') return

    schedule.status = 'active'
    schedule.consecutiveFailures = 0
    schedule.nextExecutionAt = Date.now() + INTERVAL_MS[schedule.interval]
    this.scheduleNext(schedule)
    this.persist()
    this.notify()
  }

  cancelSchedule(id: string) {
    const schedule = this.schedules.get(id)
    if (!schedule) return

    schedule.status = 'cancelled'
    schedule.nextExecutionAt = null
    this.clearTimer(id)
    this.persist()
    this.notify()
  }

  dispose() {
    for (const id of this.timers.keys()) {
      this.clearTimer(id)
    }
    this.listeners.clear()
  }

  private scheduleNext(schedule: RecurringSchedule) {
    this.clearTimer(schedule.id)
    if (schedule.status !== 'active' || schedule.nextExecutionAt === null) return

    const delay = Math.max(0, schedule.nextExecutionAt - Date.now())
    const timer = setTimeout(() => this.executeSchedule(schedule.id), delay)
    this.timers.set(schedule.id, timer)
  }

  private async executeSchedule(id: string) {
    const schedule = this.schedules.get(id)
    if (!schedule || schedule.status !== 'active') return
    if (this.executing.has(id)) return

    this.executing.add(id)

    // Skip if amount is below chain minimum (UTXO dust thresholds)
    const minAmount = !schedule.fromAsset.contractAddress ? CHAIN_MIN_SWAP_AMOUNT[schedule.fromAsset.chainId] : undefined
    const scheduleAmount = parseFloat(schedule.amount)
    if (minAmount !== undefined && scheduleAmount < minAmount) {
      this.addHistory(id, {
        status: 'skipped',
        skipReason: `Amount ${schedule.amount} below minimum ${minAmount} for ${schedule.fromAsset.chainId}`,
      })
      this.executing.delete(id)
      this.handlePostExecution(schedule)
      return
    }

    try {
      const fromAssetObj: AnyAsset = schedule.fromAsset.contractAddress
        ? {
            chain: schedule.fromAsset.chainId,
            symbol: `${schedule.fromAsset.symbol}-${schedule.fromAsset.contractAddress}`,
            ticker: schedule.fromAsset.symbol,
            type: AssetType.TOKEN,
          }
        : {
            chain: schedule.fromAsset.chainId,
            symbol: schedule.fromAsset.symbol,
            ticker: schedule.fromAsset.symbol,
            type: AssetType.NATIVE,
          }
      const toAssetObj: AnyAsset = schedule.toAsset.contractAddress
        ? {
            chain: schedule.toAsset.chainId,
            symbol: `${schedule.toAsset.symbol}-${schedule.toAsset.contractAddress}`,
            ticker: schedule.toAsset.symbol,
            type: AssetType.TOKEN,
          }
        : {
            chain: schedule.toAsset.chainId,
            symbol: schedule.toAsset.symbol,
            ticker: schedule.toAsset.symbol,
            type: AssetType.NATIVE,
          }
      const decimals = schedule.fromAsset.decimals ?? getChainById(schedule.fromAsset.chainId)?.decimals ?? 8
      const amountNum = parseFloat(schedule.amount)
      const cryptoAmount = new CryptoAmount(assetToBase(assetAmount(amountNum, decimals)), fromAssetObj)

      const fromAddress = await this.wallet.getAddress(schedule.fromAsset.chainId)
      const destinationAddress = await this.wallet.getAddress(schedule.toAsset.chainId)

      const streamingParams = schedule.streaming && schedule.protocol !== 'Chainflip'
        ? { streamingInterval: schedule.streamingInterval, streamingQuantity: schedule.streamingQuantity }
        : {}

      const swapParams: SwapParams = {
        fromAsset: fromAssetObj,
        destinationAsset: toAssetObj,
        amount: cryptoAmount,
        fromAddress,
        destinationAddress,
        ...streamingParams,
      }

      // Get quote for the selected protocol
      const quotes = await this.swapService.estimateSwap(swapParams)
      const quote = quotes.find((q: SwapQuote) => q.protocol === schedule.protocol)

      if (!quote) {
        this.addHistory(id, { status: 'skipped', skipReason: `No ${schedule.protocol} quote available` })
        return
      }

      if (!quote.canSwap) {
        this.addHistory(id, { status: 'skipped', skipReason: `Cannot swap: ${quote.errors.join(', ')}` })
        return
      }

      if (quote.slipBasisPoints > schedule.maxSlippageBps) {
        this.addHistory(id, {
          status: 'skipped',
          skipReason: `Slippage ${quote.slipBasisPoints}bps exceeds max ${schedule.maxSlippageBps}bps`,
          slippageBps: quote.slipBasisPoints,
        })
        return
      }

      // Execute the swap
      const result = await this.swapService.doSwap({ ...swapParams, protocol: schedule.protocol })

      schedule.consecutiveFailures = 0
      schedule.totalExecutions++
      this.addHistory(id, {
        status: 'success',
        txHash: result.hash,
        slippageBps: quote.slipBasisPoints,
      })
    } catch (error: any) {
      schedule.consecutiveFailures++
      schedule.totalExecutions++
      this.addHistory(id, {
        status: 'failed',
        error: error.message || 'Unknown error',
      })

      if (schedule.consecutiveFailures >= MAX_CONSECUTIVE_FAILURES) {
        schedule.status = 'paused'
        schedule.nextExecutionAt = null
        this.clearTimer(id)
        console.warn(`[RecurringSwap] Schedule ${id} auto-paused after ${MAX_CONSECUTIVE_FAILURES} consecutive failures`)
      }
    } finally {
      this.executing.delete(id)
      this.handlePostExecution(schedule)
    }
  }

  private handlePostExecution(schedule: RecurringSchedule) {
    if (schedule.status === 'active') {
      // Drift correction: compute next from now, not from scheduled time
      schedule.nextExecutionAt = Date.now() + INTERVAL_MS[schedule.interval]
      this.scheduleNext(schedule)
    }
    this.persist()
    this.notify()
  }

  private addHistory(scheduleId: string, record: Omit<ExecutionRecord, 'id' | 'scheduleId' | 'executedAt'>) {
    const history = this.getHistory(scheduleId)
    history.unshift({
      id: crypto.randomUUID(),
      scheduleId,
      executedAt: Date.now(),
      ...record,
    })

    // Cap history
    if (history.length > MAX_HISTORY) {
      history.length = MAX_HISTORY
    }

    try {
      localStorage.setItem(HISTORY_KEY_PREFIX + scheduleId, JSON.stringify(history))
    } catch {
      // localStorage full — silently drop
    }
  }

  private clearTimer(id: string) {
    const timer = this.timers.get(id)
    if (timer) {
      clearTimeout(timer)
      this.timers.delete(id)
    }
  }

  private persist() {
    try {
      const data = Array.from(this.schedules.values())
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    } catch {
      // localStorage full
    }
  }

  private loadFromStorage() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) return
      const data: RecurringSchedule[] = JSON.parse(raw)
      for (const schedule of data) {
        // All schedules start paused on app restart
        schedule.status = schedule.status === 'cancelled' ? 'cancelled' : 'paused'
        schedule.nextExecutionAt = null
        this.schedules.set(schedule.id, schedule)
      }
    } catch {
      // corrupted data
    }
  }
}
