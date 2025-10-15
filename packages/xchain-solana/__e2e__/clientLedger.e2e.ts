import { TokenAsset, assetAmount, assetFromStringEx, assetToBase } from '@xchainjs/xchain-util'
import TransportNodeHid from '@ledgerhq/hw-transport-node-hid'

import { ClientLedger, defaultSolanaParams } from '../src'
import { Network } from '@xchainjs/xchain-client/lib'

jest.deepUnmock('@solana/web3.js')

describe('Solana Ledger client', () => {
  let client: ClientLedger

  beforeAll(async () => {
    const transport = await TransportNodeHid.create()

    client = new ClientLedger({
      ...defaultSolanaParams,
      transport,
      clientUrls: {
        [Network.Mainnet]: ['RPC_URL'], // NOTE: Pass Solana RPC URL here
        [Network.Stagenet]: [''],
        [Network.Testnet]: [''],
      },
    })
  })

  it('Should get address with index 0', async () => {
    const address = await client.getAddressAsync(0)
    console.log(address)
  })

  it('Should send native transaction', async () => {
    const hash = await client.transfer({
      recipient: await client.getAddressAsync(1),
      amount: assetToBase(assetAmount(0.001, 9)),
    })

    console.log(hash)
  })

  it('Should do token transaction with no Token account creation transfer', async () => {
    const hash = await client.transfer({
      recipient: await client.getAddressAsync(1),
      amount: assetToBase(assetAmount(0.1, 6)),
      asset: assetFromStringEx('SOL.USDT-Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB') as TokenAsset,
    })

    console.log(hash)
  })

  it('Should do token transaction with Token account creation transfer', async () => {
    const hash = await client.transfer({
      recipient: await client.getAddressAsync(1),
      amount: assetToBase(assetAmount(0.1, 6)),
      asset: assetFromStringEx('SOL.USDT-Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB') as TokenAsset,
    })

    console.log(hash)
  })
})
