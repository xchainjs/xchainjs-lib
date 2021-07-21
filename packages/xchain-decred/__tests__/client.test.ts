import { Network } from '@xchainjs/xchain-client'
import { AssetDCR, baseAmount } from '@xchainjs/xchain-util'

import { Client } from '../src/client'

// this is because dcrdata.org seems to rate limit broadcastTx API to one call every 30 seconds or so.
jest.setTimeout(60000)

function sleep(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

const dcrClient = new Client({ network: 'mainnet' as Network, dcrdataUrl: 'https://dcrdata.decred.org/api/' })

describe('DecredClient Test', () => {
  beforeEach(() => {
    dcrClient.purgeClient()
  })
  afterEach(() => {
    dcrClient.purgeClient()
  })

  const MEMO = 'SWAP:THOR.RUNE'
  const phraseOne = 'atom green various power must another rent imitate gadget creek fat then'

  const addyOnePath0 = 'TsX92kUWoJJj85jKj9Ti7f4uoF8JMETRfch'
  const addyOnePath1 = 'TsRd2wTk2BnDQ2pPTWJRtW3adz9kTz7oFif'

  const addyTwo = 'TsZ6VziAydwjgXm1KuAmb99seXf3vS5MXns'

  const phraseOneMainnet_path0 = 'Dsbo3u3MQnKkxUvhbNyMb3ffzszB9naS8aJ'
  const phraseOneMainnet_path1 = 'DsXFXwmBZBo7xrTDJCM3EubBNSGUzzLBBFx'

  const phraseTwo = 'quantum vehicle print stairs canvas kid erode grass baby orbit lake remove'
  const addyThreePath0 = 'TseVdSHGJJHKMRDUJ8WzAaWmGtbp3pCFkxd'
  const addyThreePath1 = 'TsnuqFn7VNpnbZEktzzBGtMq9s6w6iYMn9j'

  const phraseTwoMainnet_path0 = 'DsTqrTDdPbSCuQR9ZG5ZfFSqSJmNFu3NGmn'
  const phraseTwoMainnet_path1 = 'DsnVFyDpB4B33zY9c5opTxHi5RGPsAVJmvh'

  it('set phrase should return correct address', () => {
    dcrClient.setNetwork('testnet' as Network)
    const result = dcrClient.setPhrase(phraseOne)
    expect(result).toEqual(addyOnePath0)
  })

  it('should throw an error for setting a bad phrase', () => {
    expect(() => dcrClient.setPhrase('cat')).toThrow()
  })

  it('should not throw an error for setting a good phrase', () => {
    expect(dcrClient.setPhrase(phraseOne)).toBeUndefined
  })

  it('should validate the right address', () => {
    dcrClient.setNetwork('testnet' as Network)
    dcrClient.setPhrase(phraseOne)
    const address = dcrClient.getAddress()
    const valid = dcrClient.validateAddress(address)
    expect(address).toEqual(addyOnePath0)
    expect(valid).toBeTruthy()
  })

  it('should get the right balance', async () => {
    const expectedBalance = 33300000
    dcrClient.setNetwork('testnet' as Network)
    dcrClient.setPhrase(phraseTwo)
    const addr = dcrClient.getAddress(1)
    const balance = await dcrClient.getBalance(addr)
    expect(balance.length).toEqual(1)
    expect(balance[0].amount.amount().toNumber()).toEqual(expectedBalance)
  })
  it('should do broadcast a vault transfer with a memo', async () => {
    dcrClient.setNetwork('testnet' as Network)
    dcrClient.setPhrase(phraseOne)
    await sleep(30000)

    const amount = baseAmount(2223)
    try {
      const txid = await dcrClient.transfer({
        asset: AssetDCR,
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
  it('should broadcast a normal transfer', async () => {
    await sleep(30000)
    dcrClient.setNetwork('testnet' as Network)
    dcrClient.setPhrase(phraseOne)
    const amount = baseAmount(2223)
    const txid = await dcrClient.transfer({ walletIndex: 0, asset: AssetDCR, recipient: addyTwo, amount, feeRate: 10 })
    expect(txid).toEqual(expect.any(String))
  })

  it('should broadcast a normal transfer without feeRate option', async () => {
    await sleep(30000)
    dcrClient.setNetwork('testnet' as Network)
    dcrClient.setPhrase(phraseOne)

    const amount = baseAmount(2223)
    const txid = await dcrClient.transfer({ asset: AssetDCR, recipient: addyTwo, amount })
    expect(txid).toEqual(expect.any(String))
  })

  it('should purge phrase and utxos', async () => {
    dcrClient.purgeClient()
    expect(() => dcrClient.getAddress()).toThrow('Phrase must be provided')
  })

  // The following test comes from Bitcoin. In Decred, the scanUTXO does not return
  // unconfirmed UTXOs.
  // it('should prevent spending unconfirmed utxo if memo exists', async () => {
  //   dcrClient.setNetwork('testnet' as Network)
  //   dcrClient.setPhrase(phraseOne)
  //
  //   // mock_getUnspents('https://testnet.dcrdata.org/insight/api', 'TsX92kUWoJJj85jKj9Ti7f4uoF8JMETRfch', [
  //   //   {
  //   //     address: 'TsVaEQxK2iuG4MWPMKVyNh2hzfhFUcoRYZq',
  //   //     txid: '522f90ef7d1da218baa47c3a7628dd7365674417c0c772e582bcdbdb7faf592b',
  //   //     vout: 4,
  //   //     ts: 1627622818,
  //   //     scriptPubKey: '76a91431f2c544006d73d9a771059eccb21133f4f3f00288ac',
  //   //     height: 737103,
  //   //     amount: 0.67108864,
  //   //     satoshis: 67108864,
  //   //     confirmations: 2,
  //   //   },
  //   // ])
  //
  //   const amount = baseAmount(70000000)
  //   return expect(
  //     dcrClient.transfer({
  //       asset: AssetDCR,
  //       recipient: addyThreePath0,
  //       amount,
  //       memo: MEMO,
  //       feeRate: 1,
  //     }),
  //   ).rejects.toThrow('Insufficient Balance for transaction')
  // })

  it('should get the balance of an address without phrase', async () => {
    dcrClient.setNetwork('testnet' as Network)
    dcrClient.purgeClient()
    const balance = await dcrClient.getBalance(addyThreePath1)
    expect(balance.length).toEqual(1)
    expect(balance[0].amount.amount().toNumber()).toEqual(33300000)
  })

  it('should prevent a tx when fees and valueOut exceed balance', async () => {
    dcrClient.setNetwork('testnet' as Network)
    dcrClient.setPhrase(phraseOne)

    const asset = AssetDCR
    const amount = baseAmount(9999999999)
    return expect(dcrClient.transfer({ asset, recipient: addyTwo, amount, feeRate: 1 })).rejects.toThrow(
      'Insufficient Balance for transaction',
    )
  })

  it('returns fees and rates of a normal tx', async () => {
    dcrClient.setNetwork('testnet' as Network)
    dcrClient.setPhrase(phraseOne)
    const { fees, rates } = await dcrClient.getFeesWithRates()
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
    dcrClient.setNetwork('testnet' as Network)
    dcrClient.setPhrase(phraseOne)
    const { fees, rates } = await dcrClient.getFeesWithRates(MEMO)
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
    dcrClient.setNetwork('testnet' as Network)
    dcrClient.setPhrase(phraseOne)
    const estimates = await dcrClient.getFees()
    expect(estimates.fast).toBeDefined()
    expect(estimates.fastest).toBeDefined()
    expect(estimates.average).toBeDefined()
  })

  // it('should return estimated fees of a vault tx that are more expensive than a normal tx (in case of > MIN_TX_FEE only)', async () => {
  //   dcrClient.setNetwork('testnet' as Network)
  //   dcrClient.setPhrase(phraseOne)
  //   const normalTx = await dcrClient.getFees()
  //   const vaultTx = await dcrClient.getFeesWithMemo(MEMO)
  //
  //   if (vaultTx.average.amount().isGreaterThan(MIN_TX_FEE)) {
  //     expect(vaultTx.average.amount().isGreaterThan(normalTx.average.amount())).toBeTruthy()
  //   } else {
  //     expect(vaultTx.average.amount().isEqualTo(MIN_TX_FEE)).toBeTruthy()
  //   }
  //
  //   if (vaultTx.fast.amount().isGreaterThan(MIN_TX_FEE)) {
  //     expect(vaultTx.fast.amount().isGreaterThan(normalTx.fast.amount())).toBeTruthy()
  //   } else {
  //     expect(vaultTx.fast.amount().isEqualTo(MIN_TX_FEE)).toBeTruthy()
  //   }
  //
  //   if (vaultTx.fastest.amount().isGreaterThan(MIN_TX_FEE)) {
  //     expect(vaultTx.fastest.amount().isGreaterThan(normalTx.fastest.amount())).toBeTruthy()
  //   } else {
  //     expect(vaultTx.fastest.amount().isEqualTo(MIN_TX_FEE)).toBeTruthy()
  //   }
  // })

  it('returns different fee rates for a normal tx', async () => {
    dcrClient.setNetwork('testnet' as Network)
    dcrClient.setPhrase(phraseOne)
    const { fast, fastest, average } = await dcrClient.getFeeRates()
    expect(fast > average)
    expect(fastest > fast)
  })

  it('should error when an invalid address is used in getting balance', () => {
    dcrClient.setNetwork('testnet' as Network)
    dcrClient.setPhrase(phraseOne)
    const invalidIndex = -1
    const expectedError = 'index must be greater than zero'
    expect(() => dcrClient.getAddress(invalidIndex)).toThrow(expectedError)
  })
  //
  it('should error when an invalid address is used in transfer', () => {
    dcrClient.setNetwork('testnet' as Network)
    dcrClient.setPhrase(phraseOne)
    const invalidAddress = 'error_address'

    const amount = baseAmount(99000)
    const expectedError = 'Invalid address'

    return expect(
      dcrClient.transfer({ asset: AssetDCR, recipient: invalidAddress, amount, feeRate: 1 }),
    ).rejects.toThrow(expectedError)
  })
  //
  it('should get address transactions', async () => {
    dcrClient.setNetwork('testnet' as Network)

    const txPages = await dcrClient.getTransactions({ address: addyThreePath0, limit: 4 })

    expect(txPages.total).toEqual(4) //there is 1 tx in addyThreePath0
    expect(txPages.txs[0].asset).toEqual(AssetDCR)
    expect(txPages.txs[0].date).toEqual(new Date('2021-07-22T08:17:22.000Z'))
    expect(txPages.txs[0].hash).toEqual('c639788740c05772356fe83684ad7dc06000aa3647ae7af27a539a4f35ae93ce')
    expect(txPages.txs[0].type).toEqual('transfer')
    expect(txPages.txs[0].to.length).toEqual(2)
    expect(txPages.txs[0].from.length).toEqual(1)
  })
  //
  it('should get address transactions with limit', async () => {
    dcrClient.setNetwork('testnet' as Network)
    // Limit should work
    const txPages = await dcrClient.getTransactions({ address: addyThreePath0, limit: 1 })
    return expect(txPages.total).toEqual(1) //there 1 tx in addyThreePath0
  })

  it('should get transaction with hash', async () => {
    dcrClient.setNetwork('testnet' as Network)
    const txData = await dcrClient.getTransactionData(
      'c639788740c05772356fe83684ad7dc06000aa3647ae7af27a539a4f35ae93ce',
    )

    expect(txData.hash).toEqual('c639788740c05772356fe83684ad7dc06000aa3647ae7af27a539a4f35ae93ce')
    expect(txData.from.length).toEqual(1)
    expect(txData.from[0].from).toEqual('TsX92kUWoJJj85jKj9Ti7f4uoF8JMETRfch')
    expect(txData.from[0].amount.amount().isEqualTo(baseAmount(122867216, 8).amount())).toBeTruthy()

    expect(txData.to.length).toEqual(2)
    expect(txData.to[0].to).toEqual('TseVdSHGJJHKMRDUJ8WzAaWmGtbp3pCFkxd')
    expect(txData.to[0].amount.amount().isEqualTo(baseAmount(25000, 8).amount())).toBeTruthy()
    expect(txData.to[1].to).toEqual('TsX92kUWoJJj85jKj9Ti7f4uoF8JMETRfch')
    expect(txData.to[1].amount.amount().isEqualTo(baseAmount(122832216, 8).amount())).toBeTruthy()
  })

  it('should return valid explorer url', () => {
    dcrClient.setNetwork('mainnet' as Network)
    expect(dcrClient.getExplorerUrl()).toEqual('https://dcrdata.decred.org')

    dcrClient.setNetwork('testnet' as Network)
    expect(dcrClient.getExplorerUrl()).toEqual('https://testnet.dcrdata.org')
  })

  it('should retrun valid explorer address url', () => {
    dcrClient.setNetwork('mainnet' as Network)
    expect(dcrClient.getExplorerAddressUrl('testAddressHere')).toEqual(
      'https://dcrdata.decred.org/api/address/testAddressHere',
    )
    dcrClient.setNetwork('testnet' as Network)
    expect(dcrClient.getExplorerAddressUrl('anotherTestAddressHere')).toEqual(
      'https://testnet.dcrdata.org/api/address/anotherTestAddressHere',
    )
  })

  it('should retrun valid explorer tx url', () => {
    dcrClient.setNetwork('mainnet' as Network)
    expect(dcrClient.getExplorerTxUrl('testTxHere')).toEqual('https://dcrdata.decred.org/api/tx/testTxHere')
    dcrClient.setNetwork('testnet' as Network)
    expect(dcrClient.getExplorerTxUrl('anotherTestTxHere')).toEqual(
      'https://testnet.dcrdata.org/api/tx/anotherTestTxHere',
    )
  })

  it('should derivate the address correctly', () => {
    dcrClient.setNetwork('mainnet' as Network)

    dcrClient.setPhrase(phraseOne)
    expect(dcrClient.getAddress(0)).toEqual(phraseOneMainnet_path0)
    expect(dcrClient.getAddress(1)).toEqual(phraseOneMainnet_path1)

    dcrClient.setPhrase(phraseTwo)
    expect(dcrClient.getAddress(0)).toEqual(phraseTwoMainnet_path0)
    expect(dcrClient.getAddress(1)).toEqual(phraseTwoMainnet_path1)

    dcrClient.setNetwork('testnet' as Network)

    dcrClient.setPhrase(phraseOne)
    expect(dcrClient.getAddress(0)).toEqual(addyOnePath0)
    expect(dcrClient.getAddress(1)).toEqual(addyOnePath1)

    dcrClient.setPhrase(phraseTwo)
    expect(dcrClient.getAddress(0)).toEqual(addyThreePath0)
    expect(dcrClient.getAddress(1)).toEqual(addyThreePath1)
  })
})
