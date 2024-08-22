import { assetToString, baseToAsset } from '@xchainjs/xchain-util'

import { Client, defaultSolanaParams } from '../src'

describe('Solana client', () => {
  let client: Client

  beforeAll(() => {
    client = new Client({
      ...defaultSolanaParams,
      phrase: process.env.PHRASE_MAINNET,
    })
  })

  it('Should get address with no index', async () => {
    const address = await client.getAddressAsync()
    console.log(address)
  })

  it('Should get address with index 1', async () => {
    const address = await client.getAddressAsync(1)
    console.log(address)
  })

  it('Should get address balance', async () => {
    const balances = await client.getBalance('94bPUbh8iazbg2UgUDrmMkgWoZz9Q1H813JZifZRB35v')

    balances.forEach((balance) => {
      console.log(`${assetToString(balance.asset)}: ${baseToAsset(balance.amount).amount().toString()}`)
    })
  })
})
