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
    const address = await client.getAddressAsync(1)
    const balance = await client.getBalance(address)
    console.log('Balance', balance[0].amount.amount().toString())
    console.log(balance[0].asset)
  })

  it('Should prepareTx TX without memo', async () => {
    const address = await client.getAddressAsync()
    const addressIndexOne = await client.getAddressAsync(1)
    const preparedTx = await client.prepareTx({
      sender: addressIndexOne,
      amount: assetToBase(assetAmount('0.1', 8)),
      recipient: address,
      feeRate: 1,
    })
    console.log('preparedTx', preparedTx)
  })

  it('Should transfer TX without memo', async () => {
    const address = await client.getAddressAsync()
    console.log('address', address)
    const addressIndexOne = await client.getAddressAsync(1)
    console.log('addressIndexOne', addressIndexOne)
    const preparedTx = await client.transfer({
      walletIndex: 1,
      amount: assetToBase(assetAmount('0.1', 8)),
      recipient: address,
      feeRate: 100,
    })
    console.log('preparedTx', preparedTx)
  })

})
