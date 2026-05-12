import { Network } from '@xchainjs/xchain-client'

import dashMocks from '../__mocks__/dash-mocks'
import { Client } from '../src'

const dashClient = new Client()

describe('DashClient Test', () => {
  const phrase = 'atom green various power must another rent imitate gadget creek fat then'
  const testnet_address_path0 = 'yUhRyiu6gTAQyRqwsd2cQ9SUo2m5cbyfHD'
  const testnet_address_path1 = 'yhuuiiCAEJWe4vMnf8HS9jQjNkeiev35H4'
  const mainnet_address_path0 = 'XpwaA7GdJRXdTc4xi72gAKMez8z1Ub1vxf'
  const mainnet_address_path1 = 'XxMov5baZykNHPy1fbvkwQuLFKz41soFNs'

  beforeEach(() => {
    dashMocks.init()
    dashClient.purgeClient()
    dashClient.setNetwork(Network.Testnet)
    dashClient.setPhrase(phrase)
  })

  afterEach(() => {
    dashMocks.restore()
    dashClient.purgeClient()
  })

  it('should not throw on a client without a phrase', () => {
    expect(() => {
      new Client()
    }).not.toThrow()
  })

  it('set phrase should return correct address', () => {
    dashClient.setNetwork(Network.Testnet)
    expect(dashClient.setPhrase(phrase)).toEqual(testnet_address_path0)

    dashClient.setNetwork(Network.Mainnet)
    expect(dashClient.setPhrase(phrase)).toEqual(mainnet_address_path0)
  })

  it('set phrase with derivation path should return correct address', async () => {
    dashClient.setNetwork(Network.Testnet)
    expect(dashClient.setPhrase(phrase)).toEqual(testnet_address_path0)
    expect(await dashClient.getAddressAsync(1)).toEqual(testnet_address_path1)

    dashClient.setNetwork(Network.Mainnet)
    expect(dashClient.setPhrase(phrase)).toEqual(mainnet_address_path0)
    expect(await dashClient.getAddressAsync(1)).toEqual(mainnet_address_path1)
  })

  it('should throw an error for setting a bad phrase', () => {
    expect(() => dashClient.setPhrase('cat')).toThrow()
  })

  it('should not throw an error for setting a good phrase', () => {
    expect(dashClient.setPhrase(phrase)).toBeTruthy()
  })

  it('should validate the right address', async () => {
    expect(await dashClient.getAddressAsync()).toEqual(testnet_address_path0)
    expect(dashClient.validateAddress(testnet_address_path0)).toBeTruthy()

    dashClient.setNetwork(Network.Mainnet)
    expect(dashClient.validateAddress(mainnet_address_path0)).toBeTruthy()
  })

  it('should return valid explorer url', () => {
    dashClient.setNetwork(Network.Mainnet)
    expect(dashClient.getExplorerUrl()).toEqual('https://blockchair.com/dash')

    dashClient.setNetwork(Network.Testnet)
    expect(dashClient.getExplorerUrl()).toEqual('https://blockexplorer.one/dash/testnet/')
  })

  it('should return valid explorer address url', () => {
    dashClient.setNetwork(Network.Mainnet)
    expect(dashClient.getExplorerAddressUrl('testAddressHere')).toEqual(
      'https://blockchair.com/dash/address/testAddressHere',
    )
    dashClient.setNetwork(Network.Testnet)
    expect(dashClient.getExplorerAddressUrl('anotherTestAddressHere')).toEqual(
      'https://blockexplorer.one/dash/testnet/address/anotherTestAddressHere',
    )
  })

  it('should return valid explorer tx url', () => {
    dashClient.setNetwork(Network.Mainnet)
    expect(dashClient.getExplorerTxUrl('testTxHere')).toEqual('https://blockchair.com/dash/transaction/testTxHere')
    dashClient.setNetwork(Network.Testnet)
    expect(dashClient.getExplorerTxUrl('anotherTestTxHere')).toEqual(
      'https://blockexplorer.one/dash/testnet/tx/anotherTestTxHere',
    )
  })

  // Balance, getTransactionData, and getTransactions tests previously relied on
  // insight.dash.org responses. Those calls are now delegated to the configured
  // dataProviders (Blockcypher → Bitgo) via the UTXOClient base class, whose
  // round-robin transport is covered in xchain-utxo-providers.

  // it('should transfer dash', async () => {
  //   const txId = await dashClient.transfer({
  //     walletIndex: 0,
  //     recipient: 'yP8A3cbdxRtLRduy5mXDsBnJtMzHWs6ZXr',
  //     amount: assetToBase(assetAmount(0.07)),
  //     feeRate: 1,
  //   })
  //   expect(txId).toEqual('mock-txid-thorchain-node')
  // })

  it('returns fees and rates of a normal tx', async () => {
    const { fees, rates } = await dashClient.getFeesWithRates()

    expect(fees.fast).toBeDefined()
    expect(fees.fastest).toBeDefined()
    expect(fees.average).toBeDefined()

    expect(rates.fast).toBeDefined()
    expect(rates.fastest).toBeDefined()
    expect(rates.average).toBeDefined()
  })

  it('returns fees and rates(from thornodeAPI) of a normal tx', async () => {
    const { fees, rates } = await dashClient.getFeesWithRates()

    expect(fees.fast).toBeDefined()
    expect(fees.fastest).toBeDefined()
    expect(fees.average).toBeDefined()

    expect(rates.fast).toBeDefined()
    expect(rates.fastest).toBeDefined()
    expect(rates.average).toBeDefined()
  })

  it('returns fees and rates of a tx w/ memo', async () => {
    const { fees, rates } = await dashClient.getFeesWithRates({ memo: 'SWAP:THOR.RUNE' })

    expect(fees.fast).toBeDefined()
    expect(fees.fastest).toBeDefined()
    expect(fees.average).toBeDefined()

    expect(rates.fast).toBeDefined()
    expect(rates.fastest).toBeDefined()
    expect(rates.average).toBeDefined()
  })

  it('should return estimated fees of a normal tx', async () => {
    const estimates = await dashClient.getFees()
    expect(estimates.fast).toBeDefined()
    expect(estimates.fastest).toBeDefined()
    expect(estimates.average).toBeDefined()
  })

  it('returns different fee rates for a normal tx', async () => {
    const { fast, fastest, average } = await dashClient.getFeeRates()
    expect(fast > average)
    expect(fastest > fast)
  })
})
