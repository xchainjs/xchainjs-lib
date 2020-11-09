require('dotenv').config()
import * as Bitcoin from 'bitcoinjs-lib'
import { Client } from '../src/client'
import { MIN_TX_FEE } from '../src/utils'
import * as xchainCrypto from '@xchainjs/xchain-crypto'
import { baseAmount, AssetBTC } from '@xchainjs/xchain-util'

import mockBlockchairApi from '../__mocks__/block-chair'
mockBlockchairApi.init()

const btcClient = new Client({ network: 'mainnet', nodeUrl: 'mock', nodeApiKey: 'mock' })

describe('BitcoinClient Test', () => {
  beforeEach(() => {
    btcClient.purgeClient()
  })
  afterEach(() => btcClient.purgeClient())

  const MEMO = 'SWAP:THOR.RUNE'
  // please don't touch the tBTC in these
  const phraseOne = 'atom green various power must another rent imitate gadget creek fat then'
  const addyOne = 'tb1qcnlekeq5d259c6x3txenltrc05k2wwwwyfxphe'
  // const phraseTwo = 'north machine wash sister amazing jungle amused shrimp until genuine promote abstract'
  const addyTwo = 'tb1qz8q2lwfmp965cszdd5raq9m7gljs57hkzpw56d'

  // Third ones is used only for balance verification
  const phraseThree = 'quantum vehicle print stairs canvas kid erode grass baby orbit lake remove'
  const addyThree = 'tb1q3a00snh7erczk94k48fe9q5z0fldgnh4twsh29'

  it('should have the correct bitcoin network right prefix', () => {
    btcClient.setNetwork('mainnet')
    const network = btcClient.getNetwork() == 'testnet' ? Bitcoin.networks.testnet : Bitcoin.networks.bitcoin
    expect(network.bech32).toEqual('bc')
  })

  it('should update net', () => {
    btcClient.setNetwork('testnet')
    const network = btcClient.getNetwork() == 'testnet' ? Bitcoin.networks.testnet : Bitcoin.networks.bitcoin
    expect(network.bech32).toEqual('tb')
  })

  it('should generate a valid phrase', () => {
    const _phrase = btcClient.generatePhrase()
    const valid = xchainCrypto.validatePhrase(_phrase)
    expect(valid).toBeTruthy()
  })

  it('set phrase should return correct address', () => {
    const result = btcClient.setPhrase(phraseOne)
    expect(result).toEqual(addyOne)
  })

  it('should throw an error for setting a bad phrase', () => {
    expect(() => btcClient.setPhrase('cat')).toThrow()
  })

  it('should not throw an error for setting a good phrase', () => {
    expect(btcClient.setPhrase(phraseOne)).toBeUndefined
  })

  it('should validate the right address', () => {
    btcClient.setNetwork('testnet')
    btcClient.setPhrase(phraseOne)

    const address = btcClient.getAddress()
    const valid = btcClient.validateAddress(address)
    expect(address).toEqual(addyOne)
    expect(valid).toBeTruthy()
  })

  it('should get the right balance', async () => {
    const expectedBalance = 102000
    btcClient.setNetwork('testnet')
    btcClient.setPhrase(phraseThree)
    const balance = await btcClient.getBalance()
    expect(balance.length).toEqual(1)
    expect(balance[0].amount.amount().toNumber()).toEqual(expectedBalance)
  })

  it('should get the right balance when scanUTXOs is called twice', async () => {
    const expectedBalance = 102000
    btcClient.setNetwork('testnet')
    btcClient.setPhrase(phraseThree)

    const balance = await btcClient.getBalance()
    expect(balance.length).toEqual(1)
    expect(balance[0].amount.amount().toNumber()).toEqual(expectedBalance)

    const newBalance = await btcClient.getBalance()
    expect(newBalance.length).toEqual(1)
    expect(newBalance[0].amount.amount().toNumber()).toEqual(expectedBalance)
  })

  it('should broadcast a normal transfer', async () => {
    btcClient.setNetwork('testnet')
    btcClient.setPhrase(phraseOne)
    const amount = baseAmount(2223)
    try {
      const txid = await btcClient.transfer({ asset: AssetBTC, recipient: addyTwo, amount, feeRate: 1 })
      expect(txid).toEqual(expect.any(String))
    } catch (err) {
      console.log('ERR running test', err)
      throw err
    }
  })

  it('should purge phrase and utxos', async () => {
    btcClient.purgeClient()
    expect(() => btcClient.getAddress()).toThrow('Phrase not set')
    return expect(btcClient.getBalance()).rejects.toThrow('Phrase not set')
  })

  it('should do broadcast a vault transfer with a memo', async () => {
    btcClient.setNetwork('testnet')
    btcClient.setPhrase(phraseThree)

    const amount = baseAmount(2223)
    try {
      const txid = await btcClient.transfer({
        asset: AssetBTC,
        recipient: addyOne,
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
    btcClient.setNetwork('testnet')
    btcClient.purgeClient()
    const balance = await btcClient.getBalance(addyThree)
    expect(balance.length).toEqual(1)
    expect(balance[0].amount.amount().toNumber()).toEqual(102000)
  })

  it('should prevent a tx when fees and valueOut exceed balance', async () => {
    btcClient.setNetwork('testnet')
    btcClient.setPhrase(phraseOne)

    const asset = AssetBTC
    const amount = baseAmount(9999999999)
    return expect(btcClient.transfer({ asset, recipient: addyTwo, amount, feeRate: 1 })).rejects.toThrow(
      'Balance insufficient for transaction',
    )
  })

  it('should return estimated fees of a normal tx', async () => {
    btcClient.setNetwork('testnet')
    btcClient.setPhrase(phraseOne)
    const estimates = await btcClient.getFees()
    expect(estimates.fast).toBeDefined()
    expect(estimates.fastest).toBeDefined()
    expect(estimates.average).toBeDefined()
  })

  it('should return estimated fees of a vault tx that are more expensive than a normal tx (in case of > MIN_TX_FEE only)', async () => {
    btcClient.setNetwork('testnet')
    btcClient.setPhrase(phraseOne)
    const normalTx = await btcClient.getFees()
    const vaultTx = await btcClient.getFeesWithMemo(MEMO)

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
    btcClient.setNetwork('testnet')
    btcClient.setPhrase(phraseOne)
    const { fast, fastest, average } = await btcClient.getFeeRates()
    expect(fast > average)
    expect(fastest > fast)
  })

  it('returns different fee rates for a tx with memo', async () => {
    btcClient.setNetwork('testnet')
    btcClient.setPhrase(phraseOne)
    const { fast, fastest, average } = await btcClient.getFeeRatesWithMemo(MEMO)
    expect(fast > average)
    expect(fastest > fast)
  })

  it('should error when an invalid address is used in getting balance', () => {
    btcClient.setNetwork('testnet')
    btcClient.setPhrase(phraseOne)
    const invalidAddress = 'error_address'
    const expectedError = 'Invalid address'
    return expect(btcClient.getBalance(invalidAddress)).rejects.toThrow(expectedError)
  })

  it('should error when an invalid address is used in transfer', () => {
    btcClient.setNetwork('testnet')
    btcClient.setPhrase(phraseOne)
    const invalidAddress = 'error_address'

    const amount = baseAmount(99000)
    const expectedError = 'Invalid address'

    return expect(
      btcClient.transfer({ asset: AssetBTC, recipient: invalidAddress, amount, feeRate: 1 }),
    ).rejects.toThrow(expectedError)
  })

  it('should get address transactions', async () => {
    btcClient.setNetwork('testnet')

    const txPages = await btcClient.getTransactions({ address: addyThree, limit: 4 })
    expect(txPages.total).toEqual(2) //there are 2 tx in addyThree
    expect(txPages.txs[0].asset).toEqual(AssetBTC)
    expect(txPages.txs[0].date).toEqual(new Date('2020-10-29T06:55:52.000Z'))
    expect(txPages.txs[0].hash).toEqual('b660ee07167cfa32681e2623f3a29dc64a089cabd9a3a07dd17f9028ac956eb8')
    expect(txPages.txs[0].type).toEqual('transfer')
    expect(txPages.txs[0].to.length).toEqual(2)
    expect(txPages.txs[0].from.length).toEqual(1)
  })

  it('should not get address transactions when offset too high', async () => {
    btcClient.setNetwork('testnet')
    // Offset max should work
    return expect(btcClient.getTransactions({ address: addyThree, offset: 9000000 })).rejects.toThrow(
      'Max offset allowed 1000000',
    )
  })

  it('should get address transactions with limit', async () => {
    btcClient.setNetwork('testnet')
    // Limit should work
    const txPages = await btcClient.getTransactions({ address: addyThree, limit: 1 })
    return expect(txPages.total).toEqual(2) //there are 2 tx in addyThree
  })

  it('should not get address transactions when limit too high', async () => {
    btcClient.setNetwork('testnet')
    // Limit max should work
    return expect(btcClient.getTransactions({ address: addyThree, limit: 9000000 })).rejects.toThrow(
      'Max limit allowed 10000',
    )
  })

  it('should get transaction with hash', async () => {
    btcClient.setNetwork('testnet')
    const txData = await btcClient.getTransactionData(
      'b660ee07167cfa32681e2623f3a29dc64a089cabd9a3a07dd17f9028ac956eb8',
    )

    expect(txData.hash).toEqual('b660ee07167cfa32681e2623f3a29dc64a089cabd9a3a07dd17f9028ac956eb8')
    expect(txData.from.length).toEqual(1)
    expect(txData.from[0].from).toEqual('2N4nhhJpjauDekVUVgA1T51M5gVg4vzLzNC')
    expect(txData.from[0].amount.amount().isEqualTo(baseAmount(8898697, 8).amount())).toBeTruthy()

    expect(txData.to.length).toEqual(2)
    expect(txData.to[0].to).toEqual('tb1q3a00snh7erczk94k48fe9q5z0fldgnh4twsh29')
    expect(txData.to[0].amount.amount().isEqualTo(baseAmount(100000, 8).amount())).toBeTruthy()
    expect(txData.to[1].to).toEqual('tb1qxx4azx0lw4tc6ylurc55ak5hl7u2ws0w9kw9h3')
    expect(txData.to[1].amount.amount().isEqualTo(baseAmount(8798533, 8).amount())).toBeTruthy()
  })

  it('should return valid explorer url', () => {
    btcClient.setNetwork('mainnet')
    expect(btcClient.getExplorerUrl()).toEqual('https://blockstream.info')

    btcClient.setNetwork('testnet')
    expect(btcClient.getExplorerUrl()).toEqual('https://blockstream.info/testnet')
  })

  it('should retrun valid explorer address url', () => {
    btcClient.setNetwork('mainnet')
    expect(btcClient.getExplorerAddressUrl('testAddressHere')).toEqual(
      'https://blockstream.info/address/testAddressHere',
    )
    btcClient.setNetwork('testnet')
    expect(btcClient.getExplorerAddressUrl('anotherTestAddressHere')).toEqual(
      'https://blockstream.info/testnet/address/anotherTestAddressHere',
    )
  })

  it('should retrun valid explorer tx url', () => {
    btcClient.setNetwork('mainnet')
    expect(btcClient.getExplorerTxUrl('testTxHere')).toEqual('https://blockstream.info/tx/testTxHere')
    btcClient.setNetwork('testnet')
    expect(btcClient.getExplorerTxUrl('anotherTestTxHere')).toEqual(
      'https://blockstream.info/testnet/tx/anotherTestTxHere',
    )
  })
})
