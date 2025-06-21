import TransportNodeHid from '@ledgerhq/hw-transport-node-hid'
import { Network } from '@xchainjs/xchain-client'
import { assetAmount, assetToBase } from '@xchainjs/xchain-util'
import { UtxoClientParams } from '@xchainjs/xchain-utxo'

import { ClientLedger } from '../src/clientLedger'
import {
  AssetBTC,
  BlockcypherDataProviders,
  LOWER_FEE_BOUND,
  UPPER_FEE_BOUND,
  blockstreamExplorerProviders,
} from '../src/const'

jest.setTimeout(200000)

const defaultBTCParams: UtxoClientParams = {
  network: Network.Mainnet,
  phrase: '',
  explorerProviders: blockstreamExplorerProviders,
  dataProviders: [BlockcypherDataProviders],
  rootDerivationPaths: {
    [Network.Mainnet]: `m/84'/0'/0'/0/`,
    [Network.Testnet]: `m/84'/1'/0'/0/`,
    [Network.Stagenet]: `m/84'/0'/0'/0/`,
  },
  feeBounds: {
    lower: LOWER_FEE_BOUND,
    upper: UPPER_FEE_BOUND,
  },
}

describe('Bitcoin Client Ledger', () => {
  let btcClient: ClientLedger
  beforeAll(async () => {
    const transport = await TransportNodeHid.create()

    btcClient = new ClientLedger({
      transport,
      ...defaultBTCParams,
    })
  })
  it('get address async without verification', async () => {
    const address = await btcClient.getAddressAsync()
    console.log('address', address)
    expect(address).toContain('b')
  })

  it('get address async with verification', async () => {
    const address = await btcClient.getAddressAsync(0, true)
    console.log('address', address)
    expect(address).toContain('b')
  })

  it('get balance', async () => {
    const address = await btcClient.getAddressAsync()
    const balance = await btcClient.getBalance(address)
    console.log('balance', balance[0].amount.amount().toString())
  })

  it('transfer', async () => {
    try {
      const to = await btcClient.getAddressAsync(1)
      const amount = assetToBase(assetAmount('0.00002'))
      const txid = await btcClient.transfer({
        asset: AssetBTC,
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
