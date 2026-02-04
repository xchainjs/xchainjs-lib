import { useState, useCallback } from 'react'

interface OperationState<T> {
  loading: boolean
  error: Error | null
  result: T | null
  duration: number | null
}

interface UseOperationResult<T> extends OperationState<T> {
  execute: (operation: () => Promise<T>) => Promise<void>
  reset: () => void
}

/**
 * Generic hook for executing async operations with loading, error, and timing tracking.
 */
export function useOperation<T>(): UseOperationResult<T> {
  const [state, setState] = useState<OperationState<T>>({
    loading: false,
    error: null,
    result: null,
    duration: null,
  })

  const execute = useCallback(async (operation: () => Promise<T>) => {
    setState({ loading: true, error: null, result: null, duration: null })
    const start = performance.now()
    try {
      const result = await operation()
      setState({
        loading: false,
        error: null,
        result,
        duration: performance.now() - start,
      })
    } catch (e) {
      setState({
        loading: false,
        error: e as Error,
        result: null,
        duration: performance.now() - start,
      })
    }
  }, [])

  const reset = useCallback(() => {
    setState({
      loading: false,
      error: null,
      result: null,
      duration: null,
    })
  }, [])

  return { ...state, execute, reset }
}
