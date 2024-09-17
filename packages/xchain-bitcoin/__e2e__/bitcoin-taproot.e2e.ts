import TransportNodeHid from '@ledgerhq/hw-transport-node-hid'
import { assetAmount, assetToBase } from '@xchainjs/xchain-util'

import { Client, ClientLedger, defaultBTCParams } from '../src'

describe('Bitcoin Taproot', () => {
  describe('Keystore', () => {
    let client: Client
    let tapRootClient: Client

    beforeAll(() => {
      client = new Client({
        ...defaultBTCParams,
        phrase: process.env.PHRASE_MAINNET,
      })
      tapRootClient = new Client({
        ...defaultBTCParams,
        useTapRoot: true,
        phrase: process.env.PHRASE_MAINNET,
      })
    })

    it('Should get taproot address', async () => {
      console.log(await tapRootClient.getAddressAsync())
    })

    it('Should get balance of taproot address', async () => {
      const balance = await tapRootClient.getBalance(await tapRootClient.getAddressAsync())
      console.log(balance[0].amount.amount().toString())
    })

    it('Should send amount to TapRoot address', async () => {
      const hash = await client.transfer({
        recipient: await tapRootClient.getAddressAsync(),
        amount: assetToBase(assetAmount(0.00002)),
        memo: 'test',
      })

      console.log({ hash })
    })

    it('Should send amount from TapRoot address', async () => {
      const hash = await tapRootClient.transfer({
        recipient: await client.getAddressAsync(),
        amount: assetToBase(assetAmount(0.00002)),
        memo: 'test',
      })

      console.log({ hash })
    })
  })

  describe('Ledger', () => {
    let tapRootClient: ClientLedger
    beforeAll(async () => {
      const transport = await TransportNodeHid.create()
      tapRootClient = new ClientLedger({
        ...defaultBTCParams,
        transport,
        useTapRoot: true,
      })
    })

    it('Should get taproot address', async () => {
      console.log(await tapRootClient.getAddressAsync())
    })

    it('Should get balance of taproot address', async () => {
      const balance = await tapRootClient.getBalance(await tapRootClient.getAddressAsync())
      console.log(balance[0].amount.amount().toString())
    })
  })
})
