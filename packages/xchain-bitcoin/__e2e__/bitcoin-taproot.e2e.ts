import TransportNodeHid from '@ledgerhq/hw-transport-node-hid'
import { assetAmount, assetToBase } from '@xchainjs/xchain-util'

import { AddressFormat, Client, ClientLedger, defaultBTCParams, tapRootDerivationPaths } from '../src'

jest.setTimeout(60000)

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
        addressFormat: AddressFormat.P2TR,
        rootDerivationPaths: tapRootDerivationPaths,
        phrase:
          process.env.PHRASE_MAINNET ||
          'buddy suffer hint evolve hover jump cherry magic hawk easy vital label usual amazing network siege click grocery erosion language scissors crop crack chaos',
      })
    })

    it('Should get Taproot address', async () => {
      console.log(await tapRootClient.getAddressAsync())
    })

    it('Should get balance of Taproot address', async () => {
      const balance = await tapRootClient.getBalance(await tapRootClient.getAddressAsync())
      console.log(balance[0].amount.amount().toString())
    })

    it('Should send amount to Taproot address', async () => {
      const hash = await client.transfer({
        recipient: await tapRootClient.getAddressAsync(),
        amount: assetToBase(assetAmount(0.0005)),
      })

      console.log({ hash })
    })

    it('Should send amount from Taproot address', async () => {
      const hash = await tapRootClient.transfer({
        recipient: 'bc1qp5uvv80k6h399fxd9pl7d4kxszcln7dst8hr77',
        amount: assetToBase(assetAmount(0.00004)),
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
      })
    })

    it('Should get Taproot address', async () => {
      console.log(await tapRootClient.getAddressAsync())
    })

    it('Should get balance of Taproot address', async () => {
      const balance = await tapRootClient.getBalance(await tapRootClient.getAddressAsync())
      console.log(balance[0].amount.amount().toString())
    })

    it('Should send amount to Taproot address', async () => {
      const hash = await tapRootClient.transfer({
        recipient: 'bc1pkk9s0qup5l40hl55h34c8gneelyms3udrsw6vqws4a06htuym8dsrpam0r',
        amount: assetToBase(assetAmount(0.00002)),
      })

      console.log({ hash })
    })

    it('Should send amount from Taproot address', async () => {
      const hash = await tapRootClient.transfer({
        recipient: await tapRootClient.getAddressAsync(),
        amount: assetToBase(assetAmount(0.00003)),
        memo: 'test',
      })

      console.log({ hash })
    })
  })
})
