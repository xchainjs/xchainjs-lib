require('dotenv').config()
import * as Bitcoin from 'bitcoinjs-lib'
import { Client } from '../src/client'
import * as xchainCrypto from '@xchainjs/xchain-crypto'
import { baseAmount, AssetBTC } from '@xchainjs/xchain-util'

const NODE_URL = 'https://api.blockchair.com/bitcoin/testnet'
const NODE_API_KEY = process.env.BLOCKCHAIR_API_KEY || ''
const btcClient = new Client({
  network: 'mainnet',
  nodeUrl: NODE_URL,
  nodeApiKey: NODE_API_KEY,
})

jest.setTimeout(30000)

describe('BitcoinClient Test', () => {
  beforeEach(() => btcClient.purgeClient())
  afterEach(() => btcClient.purgeClient())

  const MEMO = 'SWAP:THOR.RUNE'
  // please don't touch the tBTC in these
  // NOTE(kashif) For some reason these phrases and addresses don't match.
  // const phraseOne = 'cycle join secret hospital slim party write price myth okay long slight'
  // const addyOne = 'tb1qvgn58ktpaacpzp6w8fdjgk9dfgv28gytvvhd5a' //actual address seems to be: tb1qfjypmuujfxmqtfudgszc6qrf22mpdskc769qrf
  // const phraseTwo = 'heavy spin someone rice laptop minor dice deal fever praise reject panic'
  // const addyTwo = 'tb1qmyq44gzke8vzzj0npun6xla4anj92ghqn0g0qn' //actual address seems to be: tb1qc74x3y3xzc0gttq7qgkxv230fgjuyaud29vm9m

  const phraseOne = 'foster blouse cattle fiction deputy social brown toast various sock awkward print'
  const addyOne = 'tb1ql5wfzdm6llldgc90wj3uryf0f8pksd4d70p9hg'
  const phraseTwo = 'rubber torch second universe pond fence flat permit tree kiss civil fantasy'
  const addyTwo = 'tb1q75z9ake8lr2aka5t4d4per3jel4n7dg3q7lefn'

  // Third ones is used only for balance verification
  const phraseThree = 'father script wrestle topic better gravity awful robot letter illegal casino laugh'
  const addyThree = 'tb1q59c5s6slg5075y7gngxd5c20rphntd367nfvdh'

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
    btcClient.setNetwork('testnet')
    btcClient.setPhrase(phraseThree)
    const balance = await btcClient.getBalance()
    expect(balance.length).toEqual(1)
    expect(balance[0].amount.amount().toNumber()).toEqual(100000)
  })

  it('should get the right balance when scanUTXOs is called twice', async () => {
    btcClient.setNetwork('testnet')
    btcClient.setPhrase(phraseThree)

    const balance = await btcClient.getBalance()
    expect(balance.length).toEqual(1)
    expect(balance[0].amount.amount().toNumber()).toEqual(100000)

    const newBalance = await btcClient.getBalance()
    expect(newBalance.length).toEqual(1)
    expect(newBalance[0].amount.amount().toNumber()).toEqual(100000)
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
    btcClient.setPhrase(phraseTwo)

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
    expect(balance[0].amount.amount().toNumber()).toEqual(100000)
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

  it('should return estimated fees of a vault tx that are more expensive than a normal tx', async () => {
    btcClient.setNetwork('testnet')
    btcClient.setPhrase(phraseOne)
    const normalTx = await btcClient.getFees()
    const vaultTx = await btcClient.getFeesWithMemo(MEMO)
    expect(vaultTx.fast!.amount().isGreaterThan(normalTx.fast!.amount())).toBeTruthy()
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
    btcClient.setPhrase(phraseTwo)
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
    expect(txPages.total).toEqual(1)
    expect(txPages.txs[0].asset).toEqual(AssetBTC)
    expect(txPages.txs[0].date).toEqual(new Date('2020-10-08T01:28:33.000Z'))
    expect(txPages.txs[0].hash).toEqual('63fe21150a285bd4c4266e6e3aafe5d99cc76eafb8e92a0c0b2896d3c3a21c78')
    expect(txPages.txs[0].type).toEqual('transfer')
    expect(txPages.txs[0].to.length).toEqual(2)
    expect(txPages.txs[0].from.length).toEqual(1)
  })

  it('should get address transactions by offset', async () => {
    btcClient.setNetwork('testnet')
    // Offset should work
    const txPages = await btcClient.getTransactions({ address: addyThree, offset: 1, limit: 1 })
    expect(txPages.total).toEqual(1)
    expect(txPages.txs.length).toEqual(0) //coz addyThree only has one tx so offsetting should give 0
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
    return expect(txPages.total).toEqual(1)
  })

  it('should not get address transactions when limit too high', async () => {
    btcClient.setNetwork('testnet')
    // Limit max should work
    return expect(btcClient.getTransactions({ address: addyThree, limit: 9000000 })).rejects.toThrow(
      'Max limit allowed 10000',
    )
  })
})
