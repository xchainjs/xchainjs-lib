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

  it('should derive different BTC addresses for legacy vs native segwit formats', async () => {
    const native = createClient('BTC', {
      phrase: TEST_PHRASE,
      network: Network.Mainnet,
      btcAddressFormat: 'p2wpkh',
    })
    const legacy = createClient('BTC', {
      phrase: TEST_PHRASE,
      network: Network.Mainnet,
      btcAddressFormat: 'p2pkh',
    })
    const nested = createClient('BTC', {
      phrase: TEST_PHRASE,
      network: Network.Mainnet,
      btcAddressFormat: 'p2sh-p2wpkh',
    })

    const [nativeAddr, legacyAddr, nestedAddr] = await Promise.all([
      native.getAddressAsync(0),
      legacy.getAddressAsync(0),
      nested.getAddressAsync(0),
    ])

    expect(nativeAddr).not.toEqual(legacyAddr)
    expect(nativeAddr).not.toEqual(nestedAddr)
    expect(legacyAddr.startsWith('1')).toBe(true)
    expect(nestedAddr.startsWith('3')).toBe(true)
    expect(nativeAddr.startsWith('bc1')).toBe(true)
  })

  it('should derive different ETH addresses for Ledger Live path style', async () => {
    const defaultClient = createClient('ETH', {
      phrase: TEST_PHRASE,
      network: Network.Mainnet,
      ethDerivationStyle: 'default',
    })
    const ledgerLive = createClient('ETH', {
      phrase: TEST_PHRASE,
      network: Network.Mainnet,
      ethDerivationStyle: 'ledgerLive',
    })

    // Index 1 differs: default uses address index; Ledger Live uses account index
    const [defaultAddr, liveAddr] = await Promise.all([
      defaultClient.getAddressAsync(1),
      ledgerLive.getAddressAsync(1),
    ])
    expect(defaultAddr.toLowerCase()).not.toEqual(liveAddr.toLowerCase())
  })

  it('should derive different BTC addresses for non-zero account index', async () => {
    const account0 = createClient('BTC', {
      phrase: TEST_PHRASE,
      network: Network.Mainnet,
      btcAddressFormat: 'p2wpkh',
      accountIndex: 0,
    })
    const account1 = createClient('BTC', {
      phrase: TEST_PHRASE,
      network: Network.Mainnet,
      btcAddressFormat: 'p2wpkh',
      accountIndex: 1,
    })

    const [addr0, addr1] = await Promise.all([
      account0.getAddressAsync(0),
      account1.getAddressAsync(0),
    ])
    expect(addr0).not.toEqual(addr1)
    expect(addr0.startsWith('bc1')).toBe(true)
    expect(addr1.startsWith('bc1')).toBe(true)
  })

  it('should honor custom BTC root path', async () => {
    const defaultAccount = createClient('BTC', {
      phrase: TEST_PHRASE,
      network: Network.Mainnet,
      btcAddressFormat: 'p2wpkh',
    })
    const custom = createClient('BTC', {
      phrase: TEST_PHRASE,
      network: Network.Mainnet,
      btcAddressFormat: 'p2wpkh',
      customRootPath: "m/84'/0'/5'/0/",
    })

    const [defaultAddr, customAddr] = await Promise.all([
      defaultAccount.getAddressAsync(0),
      custom.getAddressAsync(0),
    ])
    expect(customAddr).not.toEqual(defaultAddr)
    expect(customAddr.startsWith('bc1')).toBe(true)
  })

  it('should honor custom ETH root path with account slot', async () => {
    const defaultClient = createClient('ETH', {
      phrase: TEST_PHRASE,
      network: Network.Mainnet,
      ethDerivationStyle: 'default',
    })
    const custom = createClient('ETH', {
      phrase: TEST_PHRASE,
      network: Network.Mainnet,
      ethDerivationStyle: 'default',
      customRootPath: "m/44'/60'/3'/0/",
    })

    const [defaultAddr, customAddr] = await Promise.all([
      defaultClient.getAddressAsync(0),
      custom.getAddressAsync(0),
    ])
    expect(customAddr.toLowerCase()).not.toEqual(defaultAddr.toLowerCase())
  })

  it('should throw when custom BTC path purpose mismatches format', () => {
    expect(() =>
      createClient('BTC', {
        phrase: TEST_PHRASE,
        network: Network.Mainnet,
        btcAddressFormat: 'p2tr',
        customRootPath: "m/84'/0'/0'/0/",
      }),
    ).toThrow(/Unsupported derivation paths/i)
  })

  it('should throw for ledger mode without transport', () => {
    expect(() =>
      createClient('BTC', { network: Network.Mainnet, walletType: 'ledger' }),
    ).toThrow(/transport/i)
  })

  it('should throw for unsupported ledger chain', () => {
    // Minimal fake transport — only used to pass the presence check
    const transport = { close: async () => undefined } as never
    expect(() =>
      createClient('THOR', { network: Network.Mainnet, walletType: 'ledger', transport }),
    ).toThrow(/only supported/i)
  })

  it('should throw for unsupported chain', () => {
    expect(() => createClient('UNKNOWN', { phrase: TEST_PHRASE, network: Network.Mainnet })).toThrow(
      'Unsupported chain',
    )
  })
})
