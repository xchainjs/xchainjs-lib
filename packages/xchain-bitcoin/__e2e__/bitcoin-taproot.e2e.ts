import { assetAmount, assetToBase } from '@xchainjs/xchain-util'

import { Client, defaultBTCParams } from '../src'

describe('Bitcoin', () => {
  describe('Keystore', () => {
    it('Should send amount to TapRoot address', async () => {
      const client = new Client({
        ...defaultBTCParams,
        phrase: process.env.PHRASE_MAINNET,
      })
      const tapRootClient = new Client({
        ...defaultBTCParams,
        useTapRoot: true,
        phrase: process.env.PHRASE_MAINNET,
      })

      const hash = await client.transfer({
        recipient: await tapRootClient.getAddressAsync(),
        amount: assetToBase(assetAmount(0.0005)),
        memo: 'test',
      })

      console.log({ hash: hash })
    })

    it('Should send amount from TapRoot address', async () => {
      const client = new Client({
        ...defaultBTCParams,
        phrase: process.env.PHRASE_MAINNET,
      })
      const tapRootClient = new Client({
        ...defaultBTCParams,
        useTapRoot: true,
        phrase: process.env.PHRASE_MAINNET,
      })

      const hash = await tapRootClient.transfer({
        recipient: await client.getAddressAsync(),
        amount: assetToBase(assetAmount(0.00002)),
        memo: 'test',
      })

      console.log({ hash: hash })
    })

    it('Should get balance of taproot address', async () => {
      const tapRootClient = new Client({
        ...defaultBTCParams,
        useTapRoot: true,
        phrase: process.env.PHRASE_MAINNET,
      })

      const balance = await tapRootClient.getBalance(await tapRootClient.getAddressAsync())

      console.log(balance[0].amount.amount().toString())
    })
  })
})
