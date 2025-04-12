import { AssetZEC, Client, defaultZECParams, ZEC_DECIMAL } from '../src'
import MockNowNodes from '../__mocks__/nownodes'
import * as bip39 from 'bip39'
import { FeeType } from '@xchainjs/xchain-client/lib'
import { baseAmount } from '@xchainjs/xchain-util/lib'

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
    const mnemonic = bip39.entropyToMnemonic('00000000000000000000000000000000');
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
    const asset = await client.getAssetInfo()
    expect(asset).toStrictEqual({asset: AssetZEC, decimal: ZEC_DECIMAL})
  })

  it('Should generate address', async () => {
    const address = await client.getAddressAsync()
    expect(address).toBe('t1XVXWCvpMgBvUaed4XDqWtgQgJSu1Ghz7F')
  })

  it('Should prepareTx TX without memo', async () => {
    await expect(client.prepareTx()).rejects.toThrow('Prepare unsiged TX not supported for Zcash. Request functionality if you need it.')
  })

  it('Should generate explorer URL', async () => {
    const url = await client.getExplorerUrl()
    expect(url).toBe('https://mainnet.zcashexplorer.app/')
  })

  it('Should generate explorer address URL', async () => {
    const url = await client.getExplorerAddressUrl('t1eiZYPXWurGMxFwoTu62531s8fAiExFh88')
    expect(url).toBe('https://mainnet.zcashexplorer.app/address/t1eiZYPXWurGMxFwoTu62531s8fAiExFh88')
  })

  it('Should generate explorer tx URL', async () => {
    const url = await client.getExplorerTxUrl('601ead82c513ec0b0e125f86ec5ff50d115a0525786e5d10de38a9c95f61b789')
    expect(url).toBe('https://mainnet.zcashexplorer.app/transactions/601ead82c513ec0b0e125f86ec5ff50d115a0525786e5d10de38a9c95f61b789')
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
      address: 't1eiZYPXWurGMxFwoTu62531s8fAiExFh88'
    })
    const txsDeserialize = deepSerialize(txs)
    expect(txsDeserialize).toMatchSnapshot('zcash-get-txs')
  })

  it('Should get balance', async () => {
    const balance = await client.getBalance('t1eiZYPXWurGMxFwoTu62531s8fAiExFh88')
    expect(balance[0].amount.amount().toString()).toBe("268682490")
    expect(balance[0].asset).toStrictEqual({ "chain": "ZEC", "symbol": "ZEC", "ticker": "ZEC", "type": 0 })
  })

  it('Should getFeesWithRates', async () => {
    await expect(client.getFeesWithRates()).rejects.toThrow('Error Zcash has flat fee. Fee rates not supported')
  })

  it('Should getFeeRates', async () => {
    await expect(client.getFeeRates()).rejects.toThrow('Error Zcash has flat fee. Fee rates not supported')
  })
  
  it('Should get fees without memo and without sender', async () => {
    const fees = await client.getFees()
    const expected = {
      type: FeeType.FlatFee,
      average: baseAmount(10000, ZEC_DECIMAL),
      fast: baseAmount(10000, ZEC_DECIMAL),
      fastest: baseAmount(10000, ZEC_DECIMAL),
    }
    expect(deepSerialize(fees)).toEqual(deepSerialize(expected))
  })

  it('Should get fees with memo and without sender', async () => {
    const fees = await client.getFees({ memo: 'test' })
    const expected = {
      type: FeeType.FlatFee,
      average: baseAmount(15000, ZEC_DECIMAL),
      fast: baseAmount(15000, ZEC_DECIMAL),
      fastest: baseAmount(15000, ZEC_DECIMAL),
    }
    expect(deepSerialize(fees)).toEqual(deepSerialize(expected))
  })

  it('Should get fees with four inputs available', async () => {
    const fees = await client.getFees({ sender: 't1eiZYPXWurGMxFwoTu62531s8fAiExFh88' })
    const expected = {
      type: FeeType.FlatFee,
      average: baseAmount(20000, ZEC_DECIMAL),
      fast: baseAmount(20000, ZEC_DECIMAL),
      fastest: baseAmount(20000, ZEC_DECIMAL),
    }
    expect(deepSerialize(fees)).toEqual(deepSerialize(expected))
  })
})
