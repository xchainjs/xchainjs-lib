import { assetAmount, assetToBase } from '@xchainjs/xchain-util'

import { ClientKeystore, defaultZECParams } from '../src'

/**
 * Zcash E2E tests
 *
 * To run these tests:
 * 1. Set PHRASE_MAINNET environment variable with a mnemonic phrase that has Zcash funds
 * 2. Set NOWNODES_API_KEY environment variable with your NowNodes API key
 * 3. Run: PHRASE_MAINNET="your phrase here" NOWNODES_API_KEY="your-api-key" yarn e2e
 *
 * Note: These tests will perform real transactions on mainnet
 *
 * To get a NowNodes API key:
 * - Sign up at https://nownodes.io/
 * - Create a free API key (up to 100,000 requests/month)
 */
describe('Zcash ClientKeystore E2E', () => {
  let client: ClientKeystore

  beforeAll(() => {
    const phrase = process.env.PHRASE_MAINNET
    if (!phrase) {
      throw new Error('PHRASE_MAINNET environment variable is required for e2e tests')
    }

    client = new ClientKeystore({
      ...defaultZECParams,
      phrase,
    })
  })

  it('Should get address', async () => {
    console.log(await client.getAddressAsync(0))
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
      memo: '=:c:maya1a7gg93dgwlulsrqf6qtage985ujhpu068zllw7',
    })
    console.log('hash', hash)
  })
})
