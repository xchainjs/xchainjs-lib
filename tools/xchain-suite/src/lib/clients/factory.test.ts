import { describe, it, expect } from 'vitest'
import { createClient } from './factory'
import { Network } from '@xchainjs/xchain-client'
import { AddressFormat } from '@xchainjs/xchain-bitcoin'

// Use a test mnemonic (DO NOT use real funds)
const TEST_PHRASE = 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about'

describe('Client Factory', () => {
  it('should create BTC client', () => {
    const client = createClient('BTC', { phrase: TEST_PHRASE, network: Network.Mainnet })
    expect(client).toBeDefined()
    expect(client.getNetwork()).toBe(Network.Mainnet)
  })

  it('should default the BTC client to native SegWit (P2WPKH) addresses', async () => {
    const client = createClient('BTC', { phrase: TEST_PHRASE, network: Network.Mainnet })
    const address = await client.getAddressAsync(0)
    expect(address.startsWith('bc1q')).toBe(true)
  })

  it('should create a BTC client with Taproot (P2TR) addresses when requested', async () => {
    const client = createClient('BTC', {
      phrase: TEST_PHRASE,
      network: Network.Mainnet,
      addressFormat: AddressFormat.P2TR,
    })
    const address = await client.getAddressAsync(0)
    expect(address.startsWith('bc1p')).toBe(true)
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
