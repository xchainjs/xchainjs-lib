import { Network } from '@xchainjs/xchain-client'
import { baseAmount } from '@xchainjs/xchain-util'

import mockBitgoApi from '../__mocks__/bitgo'
import mockHaskoinApi from '../__mocks__/haskoin'
import mockThornodeApi from '../__mocks__/thornode'
import { Client } from '../src/client'
import { BCH_DECIMAL } from '../src/const'

const bchClient = new Client()

describe('BCHClient Test', () => {
  beforeEach(() => {
    mockHaskoinApi.init()
    mockBitgoApi.init()
    mockThornodeApi.init()
  })
  afterEach(() => {
    mockHaskoinApi.restore()
    mockBitgoApi.restore()
    mockThornodeApi.restore()
    bchClient.purgeClient()
  })

  const phrase = 'atom green various power must another rent imitate gadget creek fat then'
  const testnet_address_path0 = 'qpd7jmj0hltgxux06v9d9u6933vq7zd0kyjlapya0g'
  const testnet_address_path1 = 'qrkd7dhu7zcmn6wwvj3p4aueslycqchj5vxx3stmjz'
  const mainnet_address_path0 = 'qp4kjpk684c3d9qjk5a37vl2xn86wxl0f5j2ru0daj'
  const mainnet_address_path1 = 'qr4jrkhu3usuk8ghv60m7pg9eywuc79yqvd0wxt2lm'

  it('should not throw on a client without a phrase', () => {
    expect(() => {
      new Client()
    }).not.toThrow()
  })
  it('Default network should be mainnet', () => {
    const getNetwork = bchClient.getNetwork()
    const result = Network.Mainnet
    expect(result).toEqual(getNetwork)
  })

  it('set phrase should return correct address', () => {
    bchClient.setNetwork(Network.Testnet)
    expect(bchClient.setPhrase(phrase)).toEqual(testnet_address_path0)

    bchClient.setNetwork(Network.Mainnet)
    expect(bchClient.setPhrase(phrase)).toEqual(mainnet_address_path0)
  })

  it('set phrase with derivation path should return correct address', () => {
    bchClient.setNetwork(Network.Testnet)
    expect(bchClient.setPhrase(phrase)).toEqual(testnet_address_path0)
    expect(bchClient.getAddress(1)).toEqual(testnet_address_path1)

    bchClient.setNetwork(Network.Mainnet)
    expect(bchClient.setPhrase(phrase)).toEqual(mainnet_address_path0)
    expect(bchClient.getAddress(1)).toEqual(mainnet_address_path1)
  })

  it('should throw an error for setting a bad phrase', () => {
    expect(() => bchClient.setPhrase('cat')).toThrow()
  })

  it('should not throw an error for setting a good phrase', () => {
    expect(bchClient.setPhrase(phrase)).toBeUndefined
  })

  it('should validate the right address', () => {
    bchClient.setNetwork(Network.Testnet)
    bchClient.setPhrase(phrase)
    expect(bchClient.getAddress()).toEqual(testnet_address_path0)
    expect(bchClient.validateAddress(testnet_address_path0)).toBeTruthy()

    bchClient.setNetwork(Network.Mainnet)
    expect(bchClient.validateAddress(mainnet_address_path0)).toBeTruthy()
  })

  it('should return valid explorer url', () => {
    bchClient.setNetwork(Network.Mainnet)
    expect(bchClient.getExplorerUrl()).toEqual('https://www.blockchain.com/bch/')

    bchClient.setNetwork(Network.Testnet)
    expect(bchClient.getExplorerUrl()).toEqual('https://www.blockchain.com/bch-testnet/')
  })

  it('should return valid explorer address url', () => {
    bchClient.setNetwork(Network.Mainnet)
    expect(bchClient.getExplorerAddressUrl('testAddressHere')).toEqual(
      'https://www.blockchain.com/bch/address/testAddressHere',
    )
    bchClient.setNetwork(Network.Testnet)
    expect(bchClient.getExplorerAddressUrl('anotherTestAddressHere')).toEqual(
      'https://www.blockchain.com/bch-testnet/address/anotherTestAddressHere',
    )
  })

  it('should return valid explorer tx url', () => {
    bchClient.setNetwork(Network.Mainnet)
    expect(bchClient.getExplorerTxUrl('testTxHere')).toEqual('https://www.blockchain.com/bch/tx/testTxHere')
    bchClient.setNetwork(Network.Testnet)
    expect(bchClient.getExplorerTxUrl('anotherTestTxHere')).toEqual(
      'https://www.blockchain.com/bch-testnet/tx/anotherTestTxHere',
    )
  })

  it('should get the right balance', async () => {
    bchClient.setNetwork(Network.Testnet)
    bchClient.setPhrase(phrase)

    const balance = await bchClient.getBalance(bchClient.getAddress())
    expect(balance.length).toEqual(1)
    expect(balance[0].amount.amount().toString()).toEqual('400000000')
  })

  it('should get transaction data', async () => {
    bchClient.setNetwork(Network.Testnet)
    bchClient.setPhrase(phrase)

    const txData = await bchClient.getTransactionData(
      '0d5764c89d3fbf8bea9b329ad5e0ddb6047e72313c0f7b54dcb14f4d242da64b',
    )
    expect(txData.hash).toEqual('0d5764c89d3fbf8bea9b329ad5e0ddb6047e72313c0f7b54dcb14f4d242da64b')
    expect(txData.from.length).toEqual(1)
    expect(txData.from[0].from).toEqual('bchtest:qzyrvsm6z4ucrhaq4zza3wylre7mavvldgr67jrxt4')
    expect(txData.from[0].amount.amount().isEqualTo(baseAmount(4008203, 8).amount())).toBeTruthy()

    expect(txData.to.length).toEqual(2)
    expect(txData.to[0].to).toEqual('bchtest:qq235k7k9y5cwf3s2vfpxwgu8c5497sxnsdnxv6upc')
    expect(txData.to[0].amount.amount().isEqualTo(baseAmount(4005704, 8).amount())).toBeTruthy()
  })

  it('should get transactions', async () => {
    bchClient.setNetwork(Network.Testnet)
    bchClient.setPhrase(phrase)
    const txs = await bchClient.getTransactions({
      address: 'qz35h5mfa8w2pqma2jq06lp7dnv5fxkp2svtllzmlf',
    })
    expect(txs.total).toEqual(100)
    expect(txs.txs[0].hash).toEqual('0957b51a39d6e67a7a3ced07b49a1102006cb51cea7c82b5a949a8678f3ac35c')
    expect(txs.txs[0].from.length).toEqual(1)
    expect(txs.txs[0].from[0].from).toEqual('bchtest:qzmpc0fz8tdz9kkfhxzmu0rt6d23dvyusugshegndx')
    expect(txs.txs[0].from[0].amount.amount().isEqualTo(baseAmount(3834, 8).amount())).toBeTruthy()
    expect(txs.txs[0].to.length).toEqual(2)
    expect(txs.txs[0].to[0].to).toEqual('bchtest:qz35h5mfa8w2pqma2jq06lp7dnv5fxkp2svtllzmlf')
    expect(txs.txs[0].to[0].amount.amount().isEqualTo(baseAmount(600, 8).amount())).toBeTruthy()
  })

  it('should transfer bch', async () => {
    bchClient.setNetwork(Network.Testnet)
    bchClient.setPhrase(phrase)

    const txId = await bchClient.transfer({
      walletIndex: 0,
      recipient: 'bchtest:qzt6sz836wdwscld0pgq2prcpck2pssmwge9q87pe9',
      amount: baseAmount(100, BCH_DECIMAL),
      feeRate: 1,
    })
    expect(txId).toEqual('mock-txid-haskoin')
  })

  it('should transfer bch to a legacy address format', async () => {
    bchClient.setNetwork(Network.Testnet)
    bchClient.setPhrase(phrase)

    const txId = await bchClient.transfer({
      walletIndex: 0,
      recipient: '2N3oefVeg6stiTb5Kh3ozCSkaqmx91FDbsm',
      amount: baseAmount(100, BCH_DECIMAL),
      feeRate: 1,
    })
    expect(txId).toEqual('mock-txid-haskoin')
  })

  it('returns fees and rates of a normal tx', async () => {
    bchClient.setNetwork(Network.Testnet)
    bchClient.setPhrase(phrase)

    const { fees, rates } = await bchClient.getFeesWithRates()
    // check fees
    expect(fees.fast).toBeDefined()
    expect(fees.fastest).toBeDefined()
    expect(fees.average).toBeDefined()
    // check rates
    expect(rates.fast).toBeDefined()
    expect(rates.fastest).toBeDefined()
    expect(rates.average).toBeDefined()
  })

  it('returns fees and rates(from thornodeAPI) of a normal tx', async () => {
    bchClient.setNetwork(Network.Testnet)
    bchClient.setPhrase(phrase)

    const { fees, rates } = await bchClient.getFeesWithRates()
    // check fees
    expect(fees.fast).toBeDefined()
    expect(fees.fastest).toBeDefined()
    expect(fees.average).toBeDefined()
    // check rates
    expect(rates.fast).toBeDefined()
    expect(rates.fastest).toBeDefined()
    expect(rates.average).toBeDefined()
  })

  it('returns fees and rates of a tx w/ memo', async () => {
    bchClient.setNetwork(Network.Testnet)
    bchClient.setPhrase(phrase)

    const { fees, rates } = await bchClient.getFeesWithRates({ memo: 'SWAP:THOR.RUNE' })
    // check fees
    expect(fees.fast).toBeDefined()
    expect(fees.fastest).toBeDefined()
    expect(fees.average).toBeDefined()
    // check rates
    expect(rates.fast).toBeDefined()
    expect(rates.fastest).toBeDefined()
    expect(rates.average).toBeDefined()
  })

  it('should return estimated fees of a normal tx', async () => {
    bchClient.setNetwork(Network.Testnet)
    bchClient.setPhrase(phrase)

    const estimates = await bchClient.getFees()
    expect(estimates.fast.amount().toString()).toEqual('234')
    expect(estimates.fastest.amount().toString()).toEqual('1170')
    expect(estimates.average.amount().toString()).toEqual('117')

    const estimatesWithSender = await bchClient.getFees({
      sender: bchClient.getAddress(0),
    })
    expect(estimatesWithSender.fast.amount().toString()).toEqual('678')
    expect(estimatesWithSender.fastest.amount().toString()).toEqual('3390')
    expect(estimatesWithSender.average.amount().toString()).toEqual('339')
  })

  it('returns different fee rates for a normal tx', async () => {
    bchClient.setNetwork(Network.Testnet)
    bchClient.setPhrase(phrase)

    const { fast, fastest, average } = await bchClient.getFeeRates()
    expect(fast > average)
    expect(fastest > fast)
  })
})
