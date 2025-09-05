import { FeeType } from '@xchainjs/xchain-client'
import { baseAmount } from '@xchainjs/xchain-util'
import * as bip39 from 'bip39'

import MockNowNodes from '../__mocks__/nownodes'
import { AssetZEC, Client, ZEC_DECIMAL, defaultZECParams } from '../src'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function deepSerialize(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(deepSerialize)
  }

  if (obj instanceof Date) {
    return obj.toISOString()
  }

  if (obj && typeof obj === 'object') {
    if (typeof obj.amount === 'function' && 'decimal' in obj && 'type' in obj) {
      return {
        value: obj.amount().toString(),
        decimal: obj.decimal,
        type: obj.type,
      }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const serialized: any = {}
    for (const key in obj) {
      serialized[key] = deepSerialize(obj[key])
    }
    return serialized
  }

  return obj
}

describe('Zcash client', () => {
  let client: Client

  beforeAll(() => {
    const mnemonic = bip39.entropyToMnemonic('00000000000000000000000000000000')
    client = new Client({
      ...defaultZECParams,
      phrase: mnemonic,
    })
  })

  beforeEach(() => {
    MockNowNodes.init()
  })

  afterEach(() => {
    MockNowNodes.restore()
  })

  it('Should get asset info', async () => {
    const asset = client.getAssetInfo()
    expect(asset).toStrictEqual({ asset: AssetZEC, decimal: ZEC_DECIMAL })
  })

  it('Should generate address', async () => {
    const address = await client.getAddressAsync()
    expect(address).toBe('t1XVXWCvpMgBvUaed4XDqWtgQgJSu1Ghz7F')
  })

  it('Should prepareTx TX without memo', async () => {
    const preparedTx = await client.prepareTx({
      sender: 't1XVXWCvpMgBvUaed4XDqWtgQgJSu1Ghz7F',
      recipient: 't1eiZYPXWurGMxFwoTu62531s8fAiExFh88',
      amount: baseAmount(100000000, ZEC_DECIMAL),
      feeRate: 1, // Will be ignored for Zcash
    })

    expect(preparedTx.rawUnsignedTx).toBeDefined()
    expect(preparedTx.utxos).toBeDefined()
    expect(preparedTx.inputs).toBeDefined()
    expect(typeof preparedTx.rawUnsignedTx).toBe('string')
  })

  it('Should generate explorer URL', async () => {
    const url = client.getExplorerUrl()
    expect(url).toBe('https://blockchair.com/zcash/')
  })

  it('Should generate explorer address URL', async () => {
    const url = client.getExplorerAddressUrl('t1eiZYPXWurGMxFwoTu62531s8fAiExFh88')
    expect(url).toBe('https://blockchair.com/zcash/address/t1eiZYPXWurGMxFwoTu62531s8fAiExFh88')
  })

  it('Should generate explorer tx URL', async () => {
    const url = client.getExplorerTxUrl('601ead82c513ec0b0e125f86ec5ff50d115a0525786e5d10de38a9c95f61b789')
    expect(url).toBe(
      'https://blockchair.com/zcash/transaction/601ead82c513ec0b0e125f86ec5ff50d115a0525786e5d10de38a9c95f61b789',
    )
  })

  it('Should validate address', async () => {
    let isValid = client.validateAddress('t1XVXWCvpMgBvUaed4XDqWtgQgJSu1Ghz7F')
    expect(isValid).toBe(true)
    isValid = client.validateAddress('t1XVXWCvpMgBvUaed4XDqWtgQgJSu1Ghz7X')
    expect(isValid).toBe(false)
  })

  it('Should get data tx', async () => {
    const tx = await client.getTransactionData('601ead82c513ec0b0e125f86ec5ff50d115a0525786e5d10de38a9c95f61b789')
    const txDeserialize = deepSerialize(tx)
    expect(txDeserialize).toMatchSnapshot('zcash-get-tx')
  })

  it('Should get all txs', async () => {
    const txs = await client.getTransactions({
      address: 't1eiZYPXWurGMxFwoTu62531s8fAiExFh88',
    })
    const txsDeserialize = deepSerialize(txs)
    expect(txsDeserialize).toMatchSnapshot('zcash-get-txs')
  })

  it('Should get balance', async () => {
    const balance = await client.getBalance('t1eiZYPXWurGMxFwoTu62531s8fAiExFh88')
    expect(balance[0].amount.amount().toString()).toBe('268682490')
    expect(balance[0].asset).toStrictEqual({ chain: 'ZEC', symbol: 'ZEC', ticker: 'ZEC', type: 0 })
  })

  it('Should getFeesWithRates', async () => {
    await expect(client.getFeesWithRates()).rejects.toThrow('Error Zcash has flat fee. Fee rates not supported')
  })

  it('Should getFeeRates', async () => {
    await expect(client.getFeeRates()).rejects.toThrow('Error Zcash has flat fee. Fee rates not supported')
  })

  it('Should broadcast tx', async () => {
    const hash = await client.broadcastTx('fakeTxHex')
    expect(hash).toBe('601ead82c513ec0b0e125f86ec5ff50d115a0525786e5d10de38a9c95f61b789')
  })

  it('Should get fees without memo and without sender', async () => {
    const fees = await client.getFees()
    const expected = {
      type: FeeType.FlatFee,
      average: baseAmount(20000, ZEC_DECIMAL),
      fast: baseAmount(20000, ZEC_DECIMAL),
      fastest: baseAmount(20000, ZEC_DECIMAL),
    }
    expect(deepSerialize(fees)).toEqual(deepSerialize(expected))
  })

  it('Should get fees with memo and without sender', async () => {
    const fees = await client.getFees({ memo: 'test' })
    const expected = {
      type: FeeType.FlatFee,
      average: baseAmount(25000, ZEC_DECIMAL),
      fast: baseAmount(25000, ZEC_DECIMAL),
      fastest: baseAmount(25000, ZEC_DECIMAL),
    }
    expect(deepSerialize(fees)).toEqual(deepSerialize(expected))
  })

  it('Should get fees with four inputs available', async () => {
    const fees = await client.getFees({ sender: 't1eiZYPXWurGMxFwoTu62531s8fAiExFh88' })
    const expected = {
      type: FeeType.FlatFee,
      average: baseAmount(30000, ZEC_DECIMAL),
      fast: baseAmount(30000, ZEC_DECIMAL),
      fastest: baseAmount(30000, ZEC_DECIMAL),
    }
    expect(deepSerialize(fees)).toEqual(deepSerialize(expected))
  })
})
