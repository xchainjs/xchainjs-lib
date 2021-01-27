import { Client } from '../src/client'

const bchClient = new Client({ network: 'mainnet', nodeUrl: 'mock', nodeApiKey: 'mock' })

describe('BCHClient Test', () => {
  beforeEach(() => bchClient.purgeClient())
  afterEach(() => bchClient.purgeClient())

  const phrase = 'atom green various power must another rent imitate gadget creek fat then'
  const testnet_address = 'bchtest:qpgxmhllgd8fn2flps84537s6uj8mywd4s0w0up43e'
  const mainnet_address = 'bitcoincash:qrqwc4dxav4dzltr97q8u2245rz7wlxu3ye8c6x99u'

  it('set phrase should return correct address', () => {
    bchClient.setNetwork('testnet')
    expect(bchClient.setPhrase(phrase)).toEqual(testnet_address)

    bchClient.setNetwork('mainnet')
    expect(bchClient.setPhrase(phrase)).toEqual(mainnet_address)
  })

  it('should throw an error for setting a bad phrase', () => {
    expect(() => bchClient.setPhrase('cat')).toThrow()
  })

  it('should not throw an error for setting a good phrase', () => {
    expect(bchClient.setPhrase(phrase)).toBeUndefined
  })

  it('should validate the right address', () => {
    bchClient.setNetwork('testnet')
    bchClient.setPhrase(phrase)
    expect(bchClient.getAddress()).toEqual(testnet_address)
    expect(bchClient.validateAddress(testnet_address)).toBeTruthy()
    expect(bchClient.validateAddress(mainnet_address)).toBeTruthy()
  })

  it('should return valid explorer url', () => {
    bchClient.setNetwork('mainnet')
    expect(bchClient.getExplorerUrl()).toEqual('https://explorer.bitcoin.com/bch')

    bchClient.setNetwork('testnet')
    expect(bchClient.getExplorerUrl()).toEqual('https://explorer.bitcoin.com/tbch')
  })

  it('should retrun valid explorer address url', () => {
    bchClient.setNetwork('mainnet')
    expect(bchClient.getExplorerAddressUrl('testAddressHere')).toEqual(
      'https://explorer.bitcoin.com/bch/address/testAddressHere',
    )
    bchClient.setNetwork('testnet')
    expect(bchClient.getExplorerAddressUrl('anotherTestAddressHere')).toEqual(
      'https://explorer.bitcoin.com/tbch/address/anotherTestAddressHere',
    )
  })

  it('should retrun valid explorer tx url', () => {
    bchClient.setNetwork('mainnet')
    expect(bchClient.getExplorerTxUrl('testTxHere')).toEqual('https://explorer.bitcoin.com/bch/tx/testTxHere')
    bchClient.setNetwork('testnet')
    expect(bchClient.getExplorerTxUrl('anotherTestTxHere')).toEqual(
      'https://explorer.bitcoin.com/tbch/tx/anotherTestTxHere',
    )
  })
})
