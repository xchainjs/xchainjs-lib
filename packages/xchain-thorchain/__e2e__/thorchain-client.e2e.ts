import { assetToString, baseToAsset } from '@xchainjs/xchain-util'

import { Client } from '..'

describe('Thorchain client e2e', () => {
  let client: Client

  beforeAll(() => {
    client = new Client({
      phrase: process.env.PHRASE_MAINNET,
    })
  })

  it('Should get address', async () => {
    const address = await client.getAddressAsync()
    console.log(address)
  })

  it('Should get address balances', async () => {
    const balances = await client.getBalance(await client.getAddressAsync())
    console.log(
      balances.map((balance) => {
        return {
          asset: assetToString(balance.asset),
          amount: baseToAsset(balance.amount).amount().toString(),
        }
      }),
    )
  })
})
