import { describe, it, expect } from 'vitest'
import { createClient } from './factory'
import { Network } from '@xchainjs/xchain-client'

// Use a test mnemonic (DO NOT use real funds)
const TEST_PHRASE = 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about'

describe('Client Factory', () => {
  it('should create BTC client', () => {
    const client = createClient('BTC', { phrase: TEST_PHRASE, network: Network.Mainnet })
    expect(client).toBeDefined()
    expect(client.getNetwork()).toBe(Network.Mainnet)
  })

  it('should create ETH client', () => {
    const client = createClient('ETH', { phrase: TEST_PHRASE, network: Network.Mainnet })
    expect(client).toBeDefined()
  })

  it('should throw for unsupported chain', () => {
    expect(() => createClient('UNKNOWN', { phrase: TEST_PHRASE, network: Network.Mainnet })).toThrow(
      'Unsupported chain',
    )
  })
})
