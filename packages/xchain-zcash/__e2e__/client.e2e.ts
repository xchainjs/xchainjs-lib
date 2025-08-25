import { Client, defaultZECParams } from '../src'
import { assetAmount, assetToBase } from '@xchainjs/xchain-util'

describe('Zcash client', () => {
  let client: Client

  beforeAll(() => {
    client = new Client({
      ...defaultZECParams,
      phrase: process.env.PHRASE_MAINNET,
    })
  })

  it('Should get address', async () => {
    console.log(await client.getAddressAsync(1))
  })

  it('Should get balance', async () => {
    const address = await client.getAddressAsync(0)
    const balance = await client.getBalance(address)
    console.log('Balance', balance[0].amount.amount().toString())
    console.log(balance[0].asset)
  })

  it('Should transfer TX without memo', async () => {
    const address = await client.getAddressAsync(1)
    const hash = await client.transfer({
      walletIndex: 0,
      amount: assetToBase(assetAmount('0.1', 8)),
      recipient: address,
    })
    console.log('hash', hash)
  })

  it('Should transfer TX with memo', async () => {
    const address = await client.getAddressAsync(1)
    const hash = await client.transfer({
      amount: assetToBase(assetAmount('0.1', 8)),
      recipient: address,
      memo: 'test',
    })
    console.log('hash', hash)
  })
})
