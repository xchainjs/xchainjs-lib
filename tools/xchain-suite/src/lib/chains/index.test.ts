import { describe, it, expect } from 'vitest'
import { SUPPORTED_CHAINS, getChainById, getChainsByCategory } from './index'

describe('Chain Registry', () => {
  it('should have supported chains defined', () => {
    expect(SUPPORTED_CHAINS.length).toBeGreaterThan(0)
  })

  it('should find chain by id', () => {
    const btc = getChainById('BTC')
    expect(btc).toBeDefined()
    expect(btc?.name).toBe('Bitcoin')
  })

  it('should filter chains by category', () => {
    const utxoChains = getChainsByCategory('utxo')
    expect(utxoChains.length).toBeGreaterThan(0)
    utxoChains.forEach((chain) => {
      expect(chain.category).toBe('utxo')
    })
  })

  it('should return undefined for unknown chain', () => {
    expect(getChainById('UNKNOWN')).toBeUndefined()
  })
})
