import { Network, UtxoClientParams } from '@xchainjs/xchain-client'
import { baseAmount } from '@xchainjs/xchain-util'

import mockHaskoinApi from '../__mocks__/haskoin'
import mocktxId from '../__mocks__/response/broadcast_tx/broadcast_transaction.json'
import mockSochainApi from '../__mocks__/sochain'
import { Client } from '../src/client'
import {
  AssetBTC,
  LOWER_FEE_BOUND,
  MIN_TX_FEE,
  SochainDataProviders,
  UPPER_FEE_BOUND,
  blockstreamExplorerProviders,
} from '../src/const'

export const defaultBTCParams: UtxoClientParams = {
  network: Network.Mainnet,
  phrase: '',
  explorerProviders: blockstreamExplorerProviders,
  dataProviders: [SochainDataProviders],
  rootDerivationPaths: {
    [Network.Mainnet]: `84'/0'/0'/0/`, //note this isn't bip44 compliant, but it keeps the wallets generated compatible to pre HD wallets
    [Network.Testnet]: `84'/1'/0'/0/`,
    [Network.Stagenet]: `84'/0'/0'/0/`,
  },
  feeBounds: {
    lower: LOWER_FEE_BOUND,
    upper: UPPER_FEE_BOUND,
  },
}

const btcClient = new Client({ ...defaultBTCParams })

describe('BitcoinClient Test', () => {
  beforeEach(() => {
    mockHaskoinApi.init()
    mockSochainApi.init()
    btcClient.purgeClient()
  })
  afterEach(() => {
    mockHaskoinApi.restore()
    mockSochainApi.restore()
    btcClient.purgeClient()
  })

  const MEMO = 'SWAP:THOR.RUNE'
  // please don't touch the tBTC in these
  const phraseOne = 'atom green various power must another rent imitate gadget creek fat then'
  // https://iancoleman.io/bip39/
  // Select BTC - Bitcoin Testnet; BIP84
  // m/84'/1'/0'/0/0
  const addyOnePath0 = 'tb1q2pkall6rf6v6j0cvpady05xhy37erndvku08wp'
  // m/84'/1'/0'/0/1
  const addyOnePath1 = 'tb1qut59ufcscqnkp8fgac68pj2ps5dzjjg4qq2hsy'
  const addyTwo = 'tb1qz8q2lwfmp965cszdd5raq9m7gljs57hkzpw56d'

  const phraseOneMainnet_path0 = 'bc1qvdux5606j2zh5f4724wvnywe6gcj2tcrzz7wdl'
  const phraseOneMainnet_path1 = 'bc1qnnkssp3sgfjjk2m0z9thjay0psp6ehlt6dzd97'

  // Third ones is used only for balance verification
  const phraseTwo = 'quantum vehicle print stairs canvas kid erode grass baby orbit lake remove'
  // m/84'/1'/0'/0/0
  const addyThreePath0 = 'tb1q04y2lnt0ausy07vq9dg5w2rnn9yjl3rzgjhra4'
  // m/84'/1'/0'/0/1
  const addyThreePath1 = 'tb1q99peqcxyhu4f2fehxxn6k5v704qe84y0nkcl5t'

  const phraseTwoMainnet_path0 = 'bc1qsn4ujsja3ukdlzjmc9tcgpeaxeauq0ga83xmds'
  const phraseTwoMainnet_path1 = 'bc1q7c58pf87g73pk07ryq996jfa5nqkx2ppzjz8kq'

  it('Default network should be mainnet', () => {
    const getNetwork = btcClient.getNetwork()
    const result = Network.Mainnet
    expect(result).toEqual(getNetwork)
  })

  it('set phrase should return correct address', () => {
    btcClient.setNetwork(Network.Testnet)
    const result = btcClient.setPhrase(phraseOne)
    expect(result).toEqual(addyOnePath0)
  })

  it('should not throw on a client without a phrase', () => {
    expect(() => {
      new Client()
    }).not.toThrow()
  })

  it('should throw an error for setting a bad phrase', () => {
    expect(() => btcClient.setPhrase('cat')).toThrow()
  })

  it('should not throw an error for setting a good phrase', () => {
    expect(btcClient.setPhrase(phraseOne)).toBeUndefined
  })

  it('should validate the right address', () => {
    btcClient.setNetwork(Network.Testnet)
    btcClient.setPhrase(phraseOne)
    const address = btcClient.getAddress()
    const valid = btcClient.validateAddress(address)
    expect(address).toEqual(addyOnePath0)
    expect(valid).toBeTruthy()
  })

  it('all balances test', async () => {
    btcClient.setNetwork(Network.Testnet)
    btcClient.setPhrase(phraseOne)
    const balance = await btcClient.getBalance(btcClient.getAddress())
    expect(balance.length).toEqual(1)
    expect(balance[0].amount.amount().toNumber()).toEqual(384776)
  })

  it('confirmed balances only', async () => {
    btcClient.setNetwork(Network.Testnet)
    btcClient.setPhrase(phraseOne)
    const balance = await btcClient.getBalance(btcClient.getAddress(), undefined, true)
    expect(balance.length).toEqual(1)
    expect(balance[0].amount.amount().toNumber()).toEqual(384776)
  })

  it('all balances of an address, but without phrase', async () => {
    btcClient.setNetwork(Network.Testnet)
    btcClient.purgeClient()
    const balance = await btcClient.getBalance(addyThreePath0)
    expect(balance.length).toEqual(1)
    expect(balance[0].amount.amount().toNumber()).toEqual(21462)
  })

  it('confirmed balances of an address, but without phrase', async () => {
    btcClient.setNetwork(Network.Testnet)
    btcClient.purgeClient()
    const balance = await btcClient.getBalance(addyThreePath0, undefined, true)
    expect(balance.length).toEqual(1)
    expect(balance[0].amount.amount().toNumber()).toEqual(21462)
  })

  it('should broadcast a normal transfer', async () => {
    btcClient.setNetwork(Network.Testnet)
    btcClient.setPhrase(phraseOne)
    const amount = baseAmount(2223)
    const txid = await btcClient.transfer({ walletIndex: 0, asset: AssetBTC, recipient: addyTwo, amount, feeRate: 1 })
    expect(txid).toEqual(mocktxId.tx_hex)
  })

  it('should broadcast a normal transfer without feeRate option', async () => {
    btcClient.setNetwork(Network.Testnet)
    btcClient.setPhrase(phraseOne)
    const amount = baseAmount(2223)
    const txid = await btcClient.transfer({ asset: AssetBTC, recipient: addyTwo, amount })
    expect(txid).toEqual(mocktxId.tx_hex)
  })

  it('should do broadcast a vault transfer with a memo', async () => {
    btcClient.setNetwork(Network.Testnet)
    btcClient.setPhrase(phraseOne)

    /**
     * All UTXO values: 384776
     * Confirmed UTXO values: 8800 + 15073 = 23873
     * Spend amount: 2223
     * Expected: Successful
     */

    const amount = baseAmount(2223)
    try {
      const txid = await btcClient.transfer({
        asset: AssetBTC,
        recipient: addyThreePath0,
        amount,
        memo: MEMO,
        feeRate: 1,
      })
      expect(txid).toEqual(mocktxId.tx_hex)
    } catch (err) {
      console.error('ERR running test', err)
      throw err
    }
  })
  it('should fail with memo too long exception', async () => {
    btcClient.setNetwork(Network.Testnet)
    btcClient.setPhrase(phraseOne)

    const amount = baseAmount(2223)
    try {
      await btcClient.transfer({
        asset: AssetBTC,
        recipient: addyThreePath0,
        amount,
        memo: 'too long too long too long too long too long too long too long too long too long too long',
        feeRate: 1,
      })
      fail()
    } catch (err: any) {
      const message = err.message as string
      expect(message.includes('memo too long')).toBeTruthy()
    }
  })

  it('should purge phrase and utxos', async () => {
    btcClient.purgeClient()
    expect(() => btcClient.getAddress()).toThrow('Phrase must be provided')
  })

  it('should fail with out of bound fees', async () => {
    btcClient.setNetwork(Network.Testnet)
    btcClient.setPhrase(phraseOne)

    const amount = baseAmount(2223)
    expect(
      btcClient.transfer({
        asset: AssetBTC,
        recipient: addyThreePath0,
        amount,
        memo: MEMO,
        feeRate: 99999999,
      }),
    ).rejects.toThrow()
  })

  it('should prevent spending unconfirmed utxo if memo exists', async () => {
    btcClient.setNetwork(Network.Testnet)
    btcClient.setPhrase(phraseOne)

    /**
     * All UTXO values: 519650 (confirmed) + 10350 (unconfirmed)
     * ^ defined in mock file `balances/{address}.json`)
     * Spend amount: 520000 (> `confirmed` balances)
     * Expected: Insufficient Balance
     */

    const amount = baseAmount(520000)
    return expect(
      btcClient.transfer({
        asset: AssetBTC,
        recipient: addyThreePath0,
        amount,
        memo: MEMO,
        feeRate: 1,
      }),
    ).rejects.toThrow('Insufficient Balance for transaction')
  })

  it('should prevent a tx when fees and valueOut exceed balance', async () => {
    btcClient.setNetwork(Network.Testnet)
    btcClient.setPhrase(phraseOne)

    const asset = AssetBTC
    const amount = baseAmount(9999999999)
    return expect(btcClient.transfer({ asset, recipient: addyTwo, amount, feeRate: 1 })).rejects.toThrow(
      'Insufficient Balance for transaction',
    )
  })

  it('returns fees and rates of a normal tx', async () => {
    btcClient.setNetwork(Network.Testnet)
    btcClient.setPhrase(phraseOne)
    const { fees, rates } = await btcClient.getFeesWithRates()
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
    btcClient.setNetwork(Network.Testnet)
    btcClient.setPhrase(phraseOne)
    const { fees, rates } = await btcClient.getFeesWithRates(MEMO)
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
    btcClient.setNetwork(Network.Testnet)
    btcClient.setPhrase(phraseOne)
    const estimates = await btcClient.getFees()
    expect(estimates.fast).toBeDefined()
    expect(estimates.fastest).toBeDefined()
    expect(estimates.average).toBeDefined()
  })

  it('should return estimated fees of a vault tx that are more expensive than a normal tx (in case of > MIN_TX_FEE only)', async () => {
    btcClient.setNetwork(Network.Testnet)
    btcClient.setPhrase(phraseOne)
    const normalTx = await btcClient.getFees()
    const vaultTx = await btcClient.getFees(MEMO)

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
    btcClient.setNetwork(Network.Testnet)
    btcClient.setPhrase(phraseOne)
    const { fast, fastest, average } = await btcClient.getFeeRates()
    expect(fast > average)
    expect(fastest > fast)
  })

  it('should error when an invalid address is used in getting balance', () => {
    btcClient.setNetwork(Network.Testnet)
    btcClient.setPhrase(phraseOne)
    const invalidIndex = -1
    const expectedError = 'index must be greater than zero'
    expect(() => btcClient.getAddress(invalidIndex)).toThrow(expectedError)
  })

  it('should error when an invalid address is used in transfer', () => {
    btcClient.setNetwork(Network.Testnet)
    btcClient.setPhrase(phraseOne)
    const invalidAddress = 'error_address'

    const amount = baseAmount(99000)
    const expectedError = 'Invalid address'

    return expect(
      btcClient.transfer({ asset: AssetBTC, recipient: invalidAddress, amount, feeRate: 1 }),
    ).rejects.toThrow(expectedError)
  })

  it('should get address transactions with default limit =10', async () => {
    btcClient.setNetwork(Network.Testnet)

    const txPages = await btcClient.getTransactions({ address: addyThreePath0 })
    // console.log(JSON.stringify(txPages, null, 2))
    expect(txPages.total).toEqual(4) //there is 4 tx in addyThreePath0
    expect(txPages.txs[0].asset).toEqual(AssetBTC)
    expect(txPages.txs[0].date).toEqual(new Date('2021-05-01T18:50:26.000Z'))
    expect(txPages.txs[0].hash).toEqual('ffd3cfa80cc766257b96b445c5bf8c3ffb58a33a725cb97727293a7c1fc9ba12')
    expect(txPages.txs[0].type).toEqual('transfer')
    expect(txPages.txs[0].to.length).toEqual(2)
    expect(txPages.txs[0].from.length).toEqual(1)
  })

  it('should get address transactions with limit', async () => {
    btcClient.setNetwork(Network.Testnet)
    // Limit should work
    const txPages = await btcClient.getTransactions({ address: addyThreePath0, limit: 3 })
    return expect(txPages.total).toEqual(3) //there 4 tx in addyThreePath0
  })

  it('should get transaction with hash', async () => {
    btcClient.setNetwork(Network.Testnet)
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
    btcClient.setNetwork(Network.Mainnet)
    expect(btcClient.getExplorerUrl()).toEqual('https://blockstream.info/')

    btcClient.setNetwork(Network.Testnet)
    expect(btcClient.getExplorerUrl()).toEqual('https://blockstream.info/testnet/')
  })

  it('should return valid explorer address url', () => {
    btcClient.setNetwork(Network.Mainnet)
    expect(btcClient.getExplorerAddressUrl('testAddressHere')).toEqual(
      'https://blockstream.info/address/testAddressHere',
    )
    btcClient.setNetwork(Network.Testnet)
    expect(btcClient.getExplorerAddressUrl('anotherTestAddressHere')).toEqual(
      'https://blockstream.info/testnet/address/anotherTestAddressHere',
    )
  })

  it('should return valid explorer tx url', () => {
    btcClient.setNetwork(Network.Mainnet)
    expect(btcClient.getExplorerTxUrl('testTxHere')).toEqual('https://blockstream.info/tx/testTxHere')
    btcClient.setNetwork(Network.Testnet)
    expect(btcClient.getExplorerTxUrl('anotherTestTxHere')).toEqual(
      'https://blockstream.info/testnet/tx/anotherTestTxHere',
    )
  })

  it('should derivate the address correctly', () => {
    btcClient.setNetwork(Network.Mainnet)

    btcClient.setPhrase(phraseOne)
    expect(btcClient.getAddress(0)).toEqual(phraseOneMainnet_path0)
    expect(btcClient.getAddress(1)).toEqual(phraseOneMainnet_path1)

    btcClient.setPhrase(phraseTwo)
    expect(btcClient.getAddress(0)).toEqual(phraseTwoMainnet_path0)
    expect(btcClient.getAddress(1)).toEqual(phraseTwoMainnet_path1)

    btcClient.setNetwork(Network.Testnet)

    btcClient.setPhrase(phraseOne)
    expect(btcClient.getAddress(0)).toEqual(addyOnePath0)
    expect(btcClient.getAddress(1)).toEqual(addyOnePath1)

    btcClient.setPhrase(phraseTwo)
    expect(btcClient.getAddress(0)).toEqual(addyThreePath0)
    expect(btcClient.getAddress(1)).toEqual(addyThreePath1)
  })
})
