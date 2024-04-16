import { Network } from '@xchainjs/xchain-client'
import { baseAmount } from '@xchainjs/xchain-util'

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
    expect(dashClient.setPhrase(phrase)).toBeUndefined
  })

  it('should validate the right address', async () => {
    expect(await dashClient.getAddressAsync()).toEqual(testnet_address_path0)
    expect(dashClient.validateAddress(testnet_address_path0)).toBeTruthy()

    dashClient.setNetwork(Network.Mainnet)
    expect(dashClient.validateAddress(mainnet_address_path0)).toBeTruthy()
  })

  it('should return valid explorer url', () => {
    dashClient.setNetwork(Network.Mainnet)
    expect(dashClient.getExplorerUrl()).toEqual('https://insight.dash.org/insight')

    dashClient.setNetwork(Network.Testnet)
    expect(dashClient.getExplorerUrl()).toEqual('https://blockexplorer.one/dash/testnet/')
  })

  it('should return valid explorer address url', () => {
    dashClient.setNetwork(Network.Mainnet)
    expect(dashClient.getExplorerAddressUrl('testAddressHere')).toEqual(
      'https://insight.dash.org/insight/address/testAddressHere',
    )
    dashClient.setNetwork(Network.Testnet)
    expect(dashClient.getExplorerAddressUrl('anotherTestAddressHere')).toEqual(
      'https://blockexplorer.one/dash/testnet/address/anotherTestAddressHere',
    )
  })

  it('should return valid explorer tx url', () => {
    dashClient.setNetwork(Network.Mainnet)
    expect(dashClient.getExplorerTxUrl('testTxHere')).toEqual('https://insight.dash.org/insight/tx/testTxHere')
    dashClient.setNetwork(Network.Testnet)
    expect(dashClient.getExplorerTxUrl('anotherTestTxHere')).toEqual(
      'https://blockexplorer.one/dash/testnet/tx/anotherTestTxHere',
    )
  })

  it('should get the right balance', async () => {
    const balance = await dashClient.getBalance(dashClient.getAddress())
    expect(balance.length).toEqual(1)
    expect(balance[0].amount.amount().toString()).toEqual('100831726070')
  })

  it('should get transaction data', async () => {
    const txid = '7176e32e34e83b28c8491fdadd06270bfd21635c8f75004e1792ab7cc68aa4d2'
    const txData = await dashClient.getTransactionData(txid)

    expect(txData.hash).toEqual(txid)
    expect(txData.from.length).toEqual(1)
    expect(txData.from[0].from).toEqual('yQonuFGw7Yd781ScM7JPMmQJxWeiFyMx57')
    expect(txData.from[0].amount.amount().isEqualTo(baseAmount(659692410624).amount())).toBeTruthy()
    expect(txData.to.length).toEqual(2)
    expect(txData.to[0].to).toEqual('yMypNRrzi3otv866sFDDuDc3JD3pAge5kd')
    expect(txData.to[0].amount.amount().isEqualTo(baseAmount(10925300000).amount())).toBeTruthy()
    expect(txData.to[1].to).toEqual('yWcytKfuGwZ3hkGEmfuCH2VkGAuLdFp1PU')
    expect(txData.to[1].amount.amount().isEqualTo(baseAmount(648767110380).amount())).toBeTruthy()
  })

  it('should get transactions', async () => {
    const txs = await dashClient.getTransactions({
      address: 'yLhzaEXappHzG1C7fkEhEWQTzMQhjn18Rb',
      limit: 1,
    })
    expect(txs.total).toEqual(2)
    expect(txs.txs[0].hash).toEqual('52f0be2139c95ee67696b91b523f2c6cbf2ccf813916b728aa3d46a62b0ab021')
    expect(txs.txs[0].from.length).toEqual(1)
    expect(txs.txs[0].from[0].from).toEqual('yLhzaEXappHzG1C7fkEhEWQTzMQhjn18Rb')
    expect(txs.txs[0].from[0].amount.amount().isEqualTo(baseAmount(40000).amount())).toBeTruthy()
    expect(txs.txs[0].to.length).toEqual(2)
    expect(txs.txs[0].to[1].to).toEqual('yN6hx8QEiwiDcMfPKFEgaLWBK9trBX1vVX')
    expect(txs.txs[0].to[1].amount.amount().isEqualTo(baseAmount(38997).amount())).toBeTruthy()
  })

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
