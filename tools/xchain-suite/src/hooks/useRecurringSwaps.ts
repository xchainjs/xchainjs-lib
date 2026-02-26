import { useState, useEffect, useRef, useCallback } from 'react'
import {
  RecurringSwapScheduler,
  type RecurringSchedule,
  type ExecutionRecord,
  type RecurringInterval,
} from '../lib/swap/RecurringSwapScheduler'
import type { ChainAsset } from '../lib/types'
import type { SwapService } from '../lib/swap/SwapService'

export interface UseRecurringSwapsResult {
  schedules: RecurringSchedule[]
  isReady: boolean
  createSchedule: (config: {
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
    destinationAddress?: string
  }) => RecurringSchedule | null
  pauseSchedule: (id: string) => void
  resumeSchedule: (id: string) => void
  cancelSchedule: (id: string) => void
  getHistory: (id: string) => ExecutionRecord[]
  activeCount: number
}

export function useRecurringSwaps(swapService: SwapService | null, wallet: any): UseRecurringSwapsResult {
  const schedulerRef = useRef<RecurringSwapScheduler | null>(null)
  const [schedules, setSchedules] = useState<RecurringSchedule[]>([])
  const [isReady, setIsReady] = useState(false)

  // Initialize or dispose scheduler when swapService/wallet change
  useEffect(() => {
    if (!swapService || !wallet) {
      if (schedulerRef.current) {
        schedulerRef.current.dispose()
        schedulerRef.current = null
      }
      setSchedules([])
      setIsReady(false)
      return
    }

    const scheduler = new RecurringSwapScheduler(swapService, wallet)
    schedulerRef.current = scheduler
    setSchedules(scheduler.getSchedules())
    setIsReady(true)

    const unsub = scheduler.subscribe(() => {
      setSchedules(scheduler.getSchedules())
    })

    return () => {
      unsub()
      scheduler.dispose()
      schedulerRef.current = null
    }
  }, [swapService, wallet])

  const createSchedule = useCallback(
    (config: Parameters<UseRecurringSwapsResult['createSchedule']>[0]) => {
      if (!schedulerRef.current) return null
      try {
        return schedulerRef.current.createSchedule(config)
      } catch (error) {
        console.warn('[useRecurringSwaps] Failed to create schedule:', error)
        return null
      }
    },
    [],
  )

  const pauseSchedule = useCallback((id: string) => {
    schedulerRef.current?.pauseSchedule(id)
  }, [])

  const resumeSchedule = useCallback((id: string) => {
    schedulerRef.current?.resumeSchedule(id)
  }, [])

  const cancelSchedule = useCallback((id: string) => {
    schedulerRef.current?.cancelSchedule(id)
  }, [])

  const getHistory = useCallback((id: string): ExecutionRecord[] => {
    return schedulerRef.current?.getHistory(id) ?? []
  }, [])

  const activeCount = schedules.filter((s) => s.status === 'active').length

  return {
    schedules,
    isReady,
    createSchedule,
    pauseSchedule,
    resumeSchedule,
    cancelSchedule,
    getHistory,
    activeCount,
  }
}
