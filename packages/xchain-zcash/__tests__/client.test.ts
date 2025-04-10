import { Client, defaultZECParams } from '../src'
// import MockNowNodes from '../__mocks__/nownodes'
import * as bip39 from 'bip39'

function deepSerialize(obj: any): any {
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

  // Casos base: strings, numbers, booleans, null...
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

  // beforeEach(() => {
  //   MockNowNodes.init()
  // })

  // afterEach(() => {
  //   MockNowNodes.restore()
  // })

  it('Should generate address', async () => {
    const address = await client.getAddressAsync()
    expect(address).toBe('t1XVXWCvpMgBvUaed4XDqWtgQgJSu1Ghz7F')
  })

  it('Should get balance', async () => {
    const balance = await client.getBalance('t1eiZYPXWurGMxFwoTu62531s8fAiExFh88')
    expect(balance[0].amount.amount().toString()).toBe("268682490")
    expect(balance[0].asset).toStrictEqual({"chain": "ZEC", "symbol": "ZEC", "ticker": "ZEC", "type": 0})
  })

  it('Should get tx', async () => {
    const tx = await client.getTransactionData('601ead82c513ec0b0e125f86ec5ff50d115a0525786e5d10de38a9c95f61b789')
    const txDeserialize = deepSerialize(tx)
    expect(txDeserialize).toMatchSnapshot('zcash-get-tx')
  })

  it('Should get txs', async () => {
    const txs = await client.getTransactions({
      address: 't1eiZYPXWurGMxFwoTu62531s8fAiExFh88'
    })
    const txsDeserialize = deepSerialize(txs)
    expect(txsDeserialize).toMatchSnapshot('zcash-get-txs')
  })

  it('Should get UTXO confirmed', async () => {
    const utxo = await client.getUtxo('t1eiZYPXWurGMxFwoTu62531s8fAiExFh88')
    const txsDeserialize = deepSerialize(utxo)
    expect(txsDeserialize).toMatchSnapshot('zcash-get-utxo-confirmed')
  })

})
