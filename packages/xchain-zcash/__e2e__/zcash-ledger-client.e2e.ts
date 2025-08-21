import TransportNodeHid from '@ledgerhq/hw-transport-node-hid'
import { Network } from '@xchainjs/xchain-client'
import { assetAmount, assetToBase } from '@xchainjs/xchain-util'
import { UtxoClientParams } from '@xchainjs/xchain-utxo'

import { ClientLedger } from '../src/clientLedger'
import { AssetZEC, LOWER_FEE_BOUND, NownodesProviders, UPPER_FEE_BOUND, zcashExplorerProviders } from '../src/const'

jest.setTimeout(200000)

const defaultZECParams: UtxoClientParams = {
  network: Network.Mainnet,
  phrase: '',
  explorerProviders: zcashExplorerProviders,
  dataProviders: [NownodesProviders],
  rootDerivationPaths: {
    [Network.Mainnet]: `m/44'/133'/0'/0/`,
    [Network.Testnet]: `m/44'/1'/0'/0/`,
    [Network.Stagenet]: `m/44'/133'/0'/0/`,
  },
  feeBounds: {
    lower: LOWER_FEE_BOUND,
    upper: UPPER_FEE_BOUND,
  },
}

describe('Zcash Client Ledger', () => {
  let zcashClient: ClientLedger
  beforeAll(async () => {
    const transport = await TransportNodeHid.create()

    zcashClient = new ClientLedger({
      transport,
      ...defaultZECParams,
    })
  })
  it('get address async without verification', async () => {
    const address = await zcashClient.getAddressAsync()
    console.log('address', address)
    expect(address).toMatch(/^t/) // Transparent addresses start with t
  })

  it('get address async with verification', async () => {
    const address = await zcashClient.getAddressAsync(0, true)
    console.log('address', address)
    expect(address).toMatch(/^t/) // Transparent addresses start with t
  })

  it('get balance', async () => {
    const address = await zcashClient.getAddressAsync()
    const balance = await zcashClient.getBalance(address)
    console.log('balance', balance[0].amount.amount().toString())
  })

  it('transfer', async () => {
    try {
      const to = await zcashClient.getAddressAsync(1)
      const amount = assetToBase(assetAmount('0.00002'))
      const txid = await zcashClient.transfer({
        asset: AssetZEC,
        recipient: to,
        amount,
        memo: 'test',
      })
      console.log(JSON.stringify(txid, null, 2))
    } catch (err) {
      console.error('ERR running test', err)
      fail()
    }
  })
})
