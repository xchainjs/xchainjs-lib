import TransportNodeHid from '@ledgerhq/hw-transport-node-hid'
import { assetAmount, assetToBase } from '@xchainjs/xchain-util'

import { AssetCacao, CACAO_DECIMAL, ClientLedger } from '../src'

describe('Mayachain Ledger', () => {
  let client: ClientLedger

  beforeAll(async () => {
    client = new ClientLedger({
      transport: await TransportNodeHid.create(),
    })
  })

  it('Should get address', async () => {
    const address = await client.getAddressAsync(0)
    console.log('address', address)
  })

  it('Should get address with verification', async () => {
    const address = await client.getAddressAsync(0, true)
    console.log('address', address)
  })

  it('Should transfer offline', async () => {
    const signedTx = await client.transferOffline({
      recipient: await client.getAddressAsync(0),
      amount: assetToBase(assetAmount(1, CACAO_DECIMAL)),
      asset: AssetCacao,
    })
    console.log({ signedTx })
  })

  it('Should make transaction with native asset', async () => {
    const hash = await client.transfer({
      recipient: await client.getAddressAsync(0),
      amount: assetToBase(assetAmount(1, CACAO_DECIMAL)),
      asset: AssetCacao,
    })
    console.log({ hash })
  })

  it('Should make transfer to index 0', async () => {
    const hash = await client.transfer({
      recipient: await client.getAddressAsync(0),
      amount: assetToBase(assetAmount(0.01, CACAO_DECIMAL)),
      asset: AssetCacao,
    })
    console.log({ hash })
  })

  it('Should make deposit', async () => {
    try {
      /**
       * MAKE SURE TO TEST THIS FUNCTION WITH YOUR MAYACHAIN ADDRESS, OTHERWISE, YOU COULD LOSE FUNDS
       */
      const address: string = undefined || 'TO_BE_DEFINED'
      if (address === 'TO_BE_DEFINED') throw Error('Set an address to try the deposit e2e function')
      const memo = `=:THOR.RUNE:${address}`

      const hash = await client.deposit({
        walletIndex: 0,
        amount: assetToBase(assetAmount(10, CACAO_DECIMAL)),
        asset: AssetCacao,
        memo,
      })
      console.log(hash)
    } catch (error) {
      console.log(error)
      throw error
    }
  })
})
