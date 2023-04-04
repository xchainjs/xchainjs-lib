import { Network, UtxoClientParams } from '@xchainjs/xchain-client'
import { baseAmount } from '@xchainjs/xchain-util'

import mockSochainApi from '../__mocks__/sochain'
import mockThornodeApi from '../__mocks__/thornode-api'
import { Client, NodeUrls } from '../src/client'
import {
  AssetLTC,
  LOWER_FEE_BOUND,
  MIN_TX_FEE,
  UPPER_FEE_BOUND,
  explorerProviders,
  sochainDataProviders,
} from '../src/const'
import { NodeAuth } from '../src/types'

export const defaultLTCParams: UtxoClientParams & {
  nodeUrls: NodeUrls
  nodeAuth?: NodeAuth
} = {
  network: Network.Mainnet,
  phrase: '',
  explorerProviders: explorerProviders,
  dataProviders: [sochainDataProviders],
  rootDerivationPaths: {
    [Network.Mainnet]: `m/84'/2'/0'/0/`,
    [Network.Testnet]: `m/84'/1'/0'/0/`,
    [Network.Stagenet]: `m/84'/2'/0'/0/`,
  },
  feeBounds: {
    lower: LOWER_FEE_BOUND,
    upper: UPPER_FEE_BOUND,
  },
  nodeUrls: {
    [Network.Mainnet]: 'https://litecoin.ninerealms.com',
    [Network.Stagenet]: 'https://litecoin.ninerealms.com',
    [Network.Testnet]: 'https://testnet.ltc.thorchain.info',
  },
}

const ltcClient = new Client({ ...defaultLTCParams })

describe('LitecoinClient Test', () => {
  beforeEach(() => {
    mockSochainApi.init()
    mockThornodeApi.init()
    ltcClient.purgeClient()
  })
  afterEach(() => {
    mockSochainApi.restore()
    mockThornodeApi.restore()
    ltcClient.purgeClient()
  })

  const MEMO = 'SWAP:THOR.RUNE'
  const phraseOne = 'atom green various power must another rent imitate gadget creek fat then'
  const addyOne = 'tltc1q2pkall6rf6v6j0cvpady05xhy37erndv05de7g'

  const testnet_address_path0 = 'tltc1q2pkall6rf6v6j0cvpady05xhy37erndv05de7g'
  const testnet_address_path1 = 'tltc1qut59ufcscqnkp8fgac68pj2ps5dzjjg4eggfqd'
  const mainnet_address_path0 = 'ltc1qll0eutk38yy3jms0c85v4ey68z83c78h3fmsh3'
  const mainnet_address_path1 = 'ltc1qsr5wh2sudyc7axh087lg7py6dsagphef63acgq'

  // const phraseTwo = 'green atom various power must another rent imitate gadget creek fat then'
  const addyTwo = 'tltc1ql68zjjdjx37499luueaw09avednqtge4u23q36'

  // Third ones is used only for balance verification
  const phraseThree = 'quantum vehicle print stairs canvas kid erode grass baby orbit lake remove'
  const addyThree = 'tltc1q04y2lnt0ausy07vq9dg5w2rnn9yjl3rz364adu'

  it('Default network should be mainnet', () => {
    const getNetwork = ltcClient.getNetwork()
    const result = Network.Mainnet
    expect(result).toEqual(getNetwork)
  })

  it('set phrase should return correct address', () => {
    ltcClient.setNetwork(Network.Testnet)
    const result = ltcClient.setPhrase(phraseOne)
    expect(result).toEqual(addyOne)
  })

  it('should throw an error for setting a bad phrase', () => {
    expect(() => ltcClient.setPhrase('cat')).toThrow()
  })

  it('should not throw an error for setting a good phrase', () => {
    expect(ltcClient.setPhrase(phraseOne)).toBeUndefined
  })

  it('should not throw on a client without a phrase', () => {
    expect(() => {
      new Client()
    }).not.toThrow()
  })

  it('should validate the right address', () => {
    ltcClient.setNetwork(Network.Testnet)
    ltcClient.setPhrase(phraseOne)
    const address = ltcClient.getAddress()
    const valid = ltcClient.validateAddress(address)
    expect(address).toEqual(addyOne)
    expect(valid).toBeTruthy()
  })

  it('set phrase should return correct address', () => {
    ltcClient.setNetwork(Network.Testnet)
    expect(ltcClient.setPhrase(phraseOne)).toEqual(testnet_address_path0)
    expect(ltcClient.getAddress(1)).toEqual(testnet_address_path1)

    ltcClient.setNetwork(Network.Mainnet)
    expect(ltcClient.setPhrase(phraseOne)).toEqual(mainnet_address_path0)
    expect(ltcClient.getAddress(1)).toEqual(mainnet_address_path1)
  })

  it('should get the right balance', async () => {
    const expectedBalance = 2223
    ltcClient.setNetwork(Network.Testnet)
    ltcClient.setPhrase(phraseThree)
    const balance = await ltcClient.getBalance(ltcClient.getAddress())
    expect(balance.length).toEqual(1)
    expect(balance[0].amount.amount().toNumber()).toEqual(expectedBalance)
  })

  it('should get the right balance when scanUTXOs is called twice', async () => {
    const expectedBalance = 2223
    ltcClient.setNetwork(Network.Testnet)
    ltcClient.setPhrase(phraseThree)

    const balance = await ltcClient.getBalance(ltcClient.getAddress())
    expect(balance.length).toEqual(1)
    expect(balance[0].amount.amount().toNumber()).toEqual(expectedBalance)

    const newBalance = await ltcClient.getBalance(ltcClient.getAddress())
    expect(newBalance.length).toEqual(1)
    expect(newBalance[0].amount.amount().toNumber()).toEqual(expectedBalance)
  })

  it('should broadcast a normal transfer', async () => {
    ltcClient.setNetwork(Network.Testnet)
    ltcClient.setPhrase(phraseOne)
    const amount = baseAmount(2223)
    const txid = await ltcClient.transfer({ asset: AssetLTC, recipient: addyTwo, amount, feeRate: 1 })
    expect(txid).toEqual('mock-txid')
  })

  it('should broadcast a normal transfer without feeRate', async () => {
    ltcClient.setNetwork(Network.Testnet)
    ltcClient.setPhrase(phraseOne)
    const amount = baseAmount(2223)
    const txid = await ltcClient.transfer({ asset: AssetLTC, recipient: addyTwo, amount })
    expect(txid).toEqual('mock-txid')
  })

  it('should purge phrase and utxos', async () => {
    ltcClient.purgeClient()
    expect(() => ltcClient.getAddress()).toThrow('Phrase must be provided')
  })

  it('should do broadcast a vault transfer with a memo', async () => {
    ltcClient.setNetwork(Network.Testnet)
    ltcClient.setPhrase(phraseOne)

    const amount = baseAmount(2223)
    try {
      const txid = await ltcClient.transfer({
        asset: AssetLTC,
        recipient: addyTwo,
        amount,
        memo: MEMO,
        feeRate: 1,
      })
      expect(txid).toEqual(expect.any(String))
    } catch (err) {
      console.log('ERR running test', err)
      throw err
    }
  })

  it('should get the balance of an address without phrase', async () => {
    ltcClient.setNetwork(Network.Testnet)
    ltcClient.purgeClient()
    const balance = await ltcClient.getBalance(addyThree)
    expect(balance.length).toEqual(1)
    expect(balance[0].amount.amount().toNumber()).toEqual(2223)
  })

  it('should prevent a tx when fees and valueOut exceed balance', async () => {
    ltcClient.setNetwork(Network.Testnet)
    ltcClient.setPhrase(phraseOne)

    const asset = AssetLTC
    const amount = baseAmount(9999999999)
    return expect(
      ltcClient.transfer({ walletIndex: 0, asset, recipient: addyTwo, amount, feeRate: 1 }),
    ).rejects.toThrow('Insufficient Balance for transaction')
  })

  it('returns fees and rates of a normal tx', async () => {
    ltcClient.setNetwork(Network.Testnet)
    ltcClient.setPhrase(phraseOne)
    const { fees, rates } = await ltcClient.getFeesWithRates()
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
    ltcClient.setNetwork(Network.Testnet)
    ltcClient.setPhrase(phraseOne)
    const { fees, rates } = await ltcClient.getFeesWithRates(MEMO)
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
    ltcClient.setNetwork(Network.Testnet)
    ltcClient.setPhrase(phraseOne)
    const estimates = await ltcClient.getFees()
    expect(estimates.fast).toBeDefined()
    expect(estimates.fastest).toBeDefined()
    expect(estimates.average).toBeDefined()
  })

  it('should return estimated fees of a vault tx that are more expensive than a normal tx (in case of > MIN_TX_FEE only)', async () => {
    ltcClient.setNetwork(Network.Testnet)
    ltcClient.setPhrase(phraseOne)
    const normalTx = await ltcClient.getFees()
    const vaultTx = await ltcClient.getFees(MEMO)

    if (vaultTx.average.amount().isGreaterThan(MIN_TX_FEE)) {
      expect(vaultTx.average.amount().isGreaterThan(normalTx.average.amount())).toBeTruthy()
    } else {
      expect(vaultTx.average.amount().isEqualTo(MIN_TX_FEE)).toBeTruthy()
    }

    if (vaultTx.fast.amount().isGreaterThan(MIN_TX_FEE)) {
      expect(vaultTx.fast.amount().isGreaterThan(normalTx.fast.amount())).toBeTruthy()
    } else {
      expect(vaultTx.fast.amount().isEqualTo(MIN_TX_FEE)).toBeTruthy()
    }

    if (vaultTx.fastest.amount().isGreaterThan(MIN_TX_FEE)) {
      expect(vaultTx.fastest.amount().isGreaterThan(normalTx.fastest.amount())).toBeTruthy()
    } else {
      expect(vaultTx.fastest.amount().isEqualTo(MIN_TX_FEE)).toBeTruthy()
    }
  })

  it('returns different fee rates for a normal tx', async () => {
    ltcClient.setNetwork(Network.Testnet)
    ltcClient.setPhrase(phraseOne)
    const { fast, fastest, average } = await ltcClient.getFeeRates()
    expect(fast > average)
    expect(fastest > fast)
  })

  it('should error when an invalid address is used in getting balance', () => {
    ltcClient.setNetwork(Network.Testnet)
    ltcClient.setPhrase(phraseOne)
    const invalidAddress = 'error_address'
    const expectedError = 'no provider able to get balance'
    return expect(ltcClient.getBalance(invalidAddress)).rejects.toThrow(expectedError)
  })

  it('should error when an invalid address is used in transfer', () => {
    ltcClient.setNetwork(Network.Testnet)
    ltcClient.setPhrase(phraseOne)
    const invalidAddress = 'error_address'

    const amount = baseAmount(99000)
    const expectedError = 'Invalid address'

    return expect(
      ltcClient.transfer({ asset: AssetLTC, recipient: invalidAddress, amount, feeRate: 1 }),
    ).rejects.toThrow(expectedError)
  })

  it('should get address transactions', async () => {
    ltcClient.setNetwork(Network.Testnet)

    const txPages = await ltcClient.getTransactions({ address: addyThree, limit: 4 })
    expect(txPages.total).toEqual(1) //there is 1 tx in addyThree
    expect(txPages.txs[0].asset).toEqual(AssetLTC)
    expect(txPages.txs[0].date).toEqual(new Date('2021-01-29T03:36:36.000Z'))
    expect(txPages.txs[0].hash).toEqual('b0422e9a4222f0f2b030088ee5ccd33ac0d3c59e7178bf3f4626de71b0e376d3')
    expect(txPages.txs[0].type).toEqual('transfer')
    expect(txPages.txs[0].to.length).toEqual(2)
    expect(txPages.txs[0].from.length).toEqual(1)
  })

  it('should get address transactions with limit', async () => {
    ltcClient.setNetwork(Network.Testnet)
    // Limit should work
    const txPages = await ltcClient.getTransactions({ address: addyThree, limit: 1 })
    return expect(txPages.total).toEqual(1) //there 1 tx in addyThree
  })

  it('should get transaction with hash', async () => {
    const hash = 'b0422e9a4222f0f2b030088ee5ccd33ac0d3c59e7178bf3f4626de71b0e376d3'
    ltcClient.setNetwork(Network.Testnet)
    const txData = await ltcClient.getTransactionData(hash)

    expect(txData.hash).toEqual(hash)
    expect(txData.from.length).toEqual(1)
    expect(txData.from[0].from).toEqual(addyOne)
    expect(txData.from[0].amount.amount().isEqualTo(baseAmount(860368562, 8).amount())).toBeTruthy()

    expect(txData.to.length).toEqual(2)
    expect(txData.to[0].to).toEqual(addyThree)
    expect(txData.to[0].amount.amount().isEqualTo(baseAmount(2223, 8).amount())).toBeTruthy()
    expect(txData.to[1].to).toEqual(addyOne)
    expect(txData.to[1].amount.amount().isEqualTo(baseAmount(860365339, 8).amount())).toBeTruthy()
  })

  it('should return valid explorer url', () => {
    ltcClient.setNetwork(Network.Mainnet)
    expect(ltcClient.getExplorerUrl()).toEqual('https://blockchair.com/litecoin/')

    ltcClient.setNetwork(Network.Testnet)
    expect(ltcClient.getExplorerUrl()).toEqual('https://blockexplorer.one/litecoin/testnet/')
  })

  it('should retrun valid explorer address url', () => {
    ltcClient.setNetwork(Network.Mainnet)
    expect(ltcClient.getExplorerAddressUrl('testAddressHere')).toEqual(
      'https://blockchair.com/litecoin/address/testAddressHere',
    )
    ltcClient.setNetwork(Network.Testnet)
    expect(ltcClient.getExplorerAddressUrl('anotherTestAddressHere')).toEqual(
      'https://blockexplorer.one/litecoin/testnet/address/anotherTestAddressHere',
    )
  })

  it('should retrun valid explorer tx url', () => {
    ltcClient.setNetwork(Network.Mainnet)
    expect(ltcClient.getExplorerTxUrl('testTxHere')).toEqual('https://blockchair.com/litecoin/transaction/testTxHere')
    ltcClient.setNetwork(Network.Testnet)
    expect(ltcClient.getExplorerTxUrl('anotherTestTxHere')).toEqual(
      'https://blockexplorer.one/litecoin/testnet/blockHash/anotherTestTxHere',
    )
  })
})
