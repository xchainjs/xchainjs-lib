import { Client } from '../src/client'
import { MIN_TX_FEE } from '../src/const'
import { baseAmount, AssetLTC } from '@xchainjs/xchain-util'

import mockSochainApi from '../__mocks__/sochain'
mockSochainApi.init()

const ltcClient = new Client({ network: 'testnet' })

describe('LitecoinClient Test', () => {
  beforeEach(() => {
    ltcClient.purgeClient()
  })
  afterEach(() => ltcClient.purgeClient())

  const MEMO = 'SWAP:THOR.RUNE'
  const phraseOne = 'atom green various power must another rent imitate gadget creek fat then'
  const addyOne = 'tltc1q2pkall6rf6v6j0cvpady05xhy37erndv05de7g'

  // const phraseTwo = 'green atom various power must another rent imitate gadget creek fat then'
  const addyTwo = 'tltc1ql68zjjdjx37499luueaw09avednqtge4u23q36'

  // Third ones is used only for balance verification
  const phraseThree = 'quantum vehicle print stairs canvas kid erode grass baby orbit lake remove'
  const addyThree = 'tltc1q04y2lnt0ausy07vq9dg5w2rnn9yjl3rz364adu'

  it('set phrase should return correct address', () => {
    ltcClient.setNetwork('testnet')
    const result = ltcClient.setPhrase(phraseOne)
    expect(result).toEqual(addyOne)
  })

  it('should throw an error for setting a bad phrase', () => {
    expect(() => ltcClient.setPhrase('cat')).toThrow()
  })

  it('should not throw an error for setting a good phrase', () => {
    expect(ltcClient.setPhrase(phraseOne)).toBeUndefined
  })

  it('should validate the right address', () => {
    ltcClient.setNetwork('testnet')
    ltcClient.setPhrase(phraseOne)
    const address = ltcClient.getAddress()
    const valid = ltcClient.validateAddress(address)
    expect(address).toEqual(addyOne)
    expect(valid).toBeTruthy()
  })

  it('should get the right balance', async () => {
    const expectedBalance = 2223
    ltcClient.setNetwork('testnet')
    ltcClient.setPhrase(phraseThree)
    const balance = await ltcClient.getBalance()
    expect(balance.length).toEqual(1)
    expect(balance[0].amount.amount().toNumber()).toEqual(expectedBalance)
  })

  it('should get the right balance when scanUTXOs is called twice', async () => {
    const expectedBalance = 2223
    ltcClient.setNetwork('testnet')
    ltcClient.setPhrase(phraseThree)

    const balance = await ltcClient.getBalance()
    expect(balance.length).toEqual(1)
    expect(balance[0].amount.amount().toNumber()).toEqual(expectedBalance)

    const newBalance = await ltcClient.getBalance()
    expect(newBalance.length).toEqual(1)
    expect(newBalance[0].amount.amount().toNumber()).toEqual(expectedBalance)
  })

  it('should broadcast a normal transfer', async () => {
    ltcClient.setNetwork('testnet')
    ltcClient.setPhrase(phraseOne)
    const amount = baseAmount(2223)
    const txid = await ltcClient.transfer({ asset: AssetLTC, recipient: addyTwo, amount, feeRate: 1 })
    expect(txid).toEqual(expect.any(String))
  })

  it('should broadcast a normal transfer without feeRate', async () => {
    ltcClient.setNetwork('testnet')
    ltcClient.setPhrase(phraseOne)
    const amount = baseAmount(2223)
    const txid = await ltcClient.transfer({ asset: AssetLTC, recipient: addyTwo, amount })
    expect(txid).toEqual(expect.any(String))
  })

  it('should purge phrase and utxos', async () => {
    ltcClient.purgeClient()
    expect(() => ltcClient.getAddress()).toThrow('Phrase must be provided')
    return expect(ltcClient.getBalance()).rejects.toThrow('Phrase must be provided')
  })

  it('should do broadcast a vault transfer with a memo', async () => {
    ltcClient.setNetwork('testnet')
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
    ltcClient.setNetwork('testnet')
    ltcClient.purgeClient()
    const balance = await ltcClient.getBalance(addyThree)
    expect(balance.length).toEqual(1)
    expect(balance[0].amount.amount().toNumber()).toEqual(2223)
  })

  it('should prevent a tx when fees and valueOut exceed balance', async () => {
    ltcClient.setNetwork('testnet')
    ltcClient.setPhrase(phraseOne)

    const asset = AssetLTC
    const amount = baseAmount(9999999999)
    return expect(ltcClient.transfer({ asset, recipient: addyTwo, amount, feeRate: 1 })).rejects.toThrow(
      'Balance insufficient for transaction',
    )
  })

  it('returns fees and rates of a normal tx', async () => {
    ltcClient.setNetwork('testnet')
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
    ltcClient.setNetwork('testnet')
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
    ltcClient.setNetwork('testnet')
    ltcClient.setPhrase(phraseOne)
    const estimates = await ltcClient.getFees()
    expect(estimates.fast).toBeDefined()
    expect(estimates.fastest).toBeDefined()
    expect(estimates.average).toBeDefined()
  })

  it('should return estimated fees of a vault tx that are more expensive than a normal tx (in case of > MIN_TX_FEE only)', async () => {
    ltcClient.setNetwork('testnet')
    ltcClient.setPhrase(phraseOne)
    const normalTx = await ltcClient.getFees()
    const vaultTx = await ltcClient.getFeesWithMemo(MEMO)

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
    ltcClient.setNetwork('testnet')
    ltcClient.setPhrase(phraseOne)
    const { fast, fastest, average } = await ltcClient.getFeeRates()
    expect(fast > average)
    expect(fastest > fast)
  })

  it('should error when an invalid address is used in getting balance', () => {
    ltcClient.setNetwork('testnet')
    ltcClient.setPhrase(phraseOne)
    const invalidAddress = 'error_address'
    const expectedError = 'Invalid address'
    return expect(ltcClient.getBalance(invalidAddress)).rejects.toThrow(expectedError)
  })

  it('should error when an invalid address is used in transfer', () => {
    ltcClient.setNetwork('testnet')
    ltcClient.setPhrase(phraseOne)
    const invalidAddress = 'error_address'

    const amount = baseAmount(99000)
    const expectedError = 'Invalid address'

    return expect(
      ltcClient.transfer({ asset: AssetLTC, recipient: invalidAddress, amount, feeRate: 1 }),
    ).rejects.toThrow(expectedError)
  })

  it('should get address transactions', async () => {
    ltcClient.setNetwork('testnet')

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
    ltcClient.setNetwork('testnet')
    // Limit should work
    const txPages = await ltcClient.getTransactions({ address: addyThree, limit: 1 })
    return expect(txPages.total).toEqual(1) //there 1 tx in addyThree
  })

  it('should get transaction with hash', async () => {
    const hash = 'b0422e9a4222f0f2b030088ee5ccd33ac0d3c59e7178bf3f4626de71b0e376d3'
    ltcClient.setNetwork('testnet')
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
    ltcClient.setNetwork('mainnet')
    expect(ltcClient.getExplorerUrl()).toEqual('https://blockstream.info')

    ltcClient.setNetwork('testnet')
    expect(ltcClient.getExplorerUrl()).toEqual('https://blockstream.info/testnet')
  })

  it('should retrun valid explorer address url', () => {
    ltcClient.setNetwork('mainnet')
    expect(ltcClient.getExplorerAddressUrl('testAddressHere')).toEqual(
      'https://blockstream.info/address/testAddressHere',
    )
    ltcClient.setNetwork('testnet')
    expect(ltcClient.getExplorerAddressUrl('anotherTestAddressHere')).toEqual(
      'https://blockstream.info/testnet/address/anotherTestAddressHere',
    )
  })

  it('should retrun valid explorer tx url', () => {
    ltcClient.setNetwork('mainnet')
    expect(ltcClient.getExplorerTxUrl('testTxHere')).toEqual('https://blockstream.info/tx/testTxHere')
    ltcClient.setNetwork('testnet')
    expect(ltcClient.getExplorerTxUrl('anotherTestTxHere')).toEqual(
      'https://blockstream.info/testnet/tx/anotherTestTxHere',
    )
  })
})
