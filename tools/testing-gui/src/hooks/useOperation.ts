import { useState, useCallback } from 'react'

interface OperationState<T> {
  loading: boolean
  error: Error | null
  result: T | null
  duration: number | null
}

interface UseOperationResult<T> extends OperationState<T> {
  execute: (operation: () => Promise<T>, context?: OperationContext) => Promise<void>
  reset: () => void
}

/** Context for error logging - helps with issue reproduction */
interface OperationContext {
  chainId?: string
  operation?: string
  params?: Record<string, unknown>
}

/** Log errors in a structured format for the self-feedback loop workflow */
function logOperationError(error: Error, context: OperationContext, duration: number) {
  const errorLog = {
    timestamp: new Date().toISOString(),
    chainId: context.chainId || 'unknown',
    operation: context.operation || 'unknown',
    error: error.message,
    stack: error.stack?.split('\n').slice(0, 5).join('\n'), // First 5 lines of stack
    params: context.params,
    duration: Math.round(duration),
  }
  // Log to console in a format that can be parsed for automated issue creation
  console.error('[XChainJS Error]', JSON.stringify(errorLog, null, 2))
}

/**
 * Generic hook for executing async operations with loading, error, and timing tracking.
 * Supports optional context for structured error logging (see SELF_FEEDBACK_LOOP.md).
 */
export function useOperation<T>(): UseOperationResult<T> {
  const [state, setState] = useState<OperationState<T>>({
    loading: false,
    error: null,
    result: null,
    duration: null,
  })

  const execute = useCallback(async (operation: () => Promise<T>, context: OperationContext = {}) => {
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
      const duration = performance.now() - start
      const error = e as Error
      logOperationError(error, context, duration)
      setState({
        loading: false,
        error,
        result: null,
        duration,
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
