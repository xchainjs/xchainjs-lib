import { describe, it, expect, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useOperation } from './useOperation'

describe('useOperation', () => {
  it('should start with initial state', () => {
    const { result } = renderHook(() => useOperation())
    expect(result.current.loading).toBe(false)
    expect(result.current.error).toBeNull()
    expect(result.current.result).toBeNull()
  })

  it('should handle successful operation', async () => {
    const { result } = renderHook(() => useOperation<string>())

    await act(async () => {
      await result.current.execute(async () => 'success')
    })

    expect(result.current.loading).toBe(false)
    expect(result.current.result).toBe('success')
    expect(result.current.error).toBeNull()
    expect(result.current.duration).toBeGreaterThanOrEqual(0)
  })

  it('should handle failed operation', async () => {
    const { result } = renderHook(() => useOperation())

    await act(async () => {
      await result.current.execute(async () => {
        throw new Error('test error')
      })
    })

    expect(result.current.loading).toBe(false)
    expect(result.current.error?.message).toBe('test error')
    expect(result.current.result).toBeNull()
  })
})
