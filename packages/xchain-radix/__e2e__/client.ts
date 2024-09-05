import { Network } from '@xchainjs/xchain-client'
import { assetAmount, assetToBase } from '@xchainjs/xchain-util'

import { Client } from '../src'

describe('Radix', () => {
  let client: Client

  beforeAll(() => {
    client = new Client({
      network: Network.Mainnet,
      phrase: process.env.PHRASE_MAINNET,
    })
  })

  it('Should make transfer', async () => {
    const hash = await client.transfer({
      amount: assetToBase(assetAmount(200, 18)),
      recipient: await client.getAddressAsync(0),
    })
    console.log(hash)
  })
})
