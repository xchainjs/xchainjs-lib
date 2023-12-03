import { Network, UtxoClientParams } from '@xchainjs/xchain-client'
import { assetAmount, assetToBase } from '@xchainjs/xchain-util'

import { ClientLedger, TRANSPORT_TYPES } from '../src/clientLedger'
import {
  AssetBTC,
  BlockcypherDataProviders,
  LOWER_FEE_BOUND,
  UPPER_FEE_BOUND,
  blockstreamExplorerProviders,
} from '../src/const'

jest.setTimeout(200000)

const defaultBTCParams: UtxoClientParams = {
  network: Network.Testnet,
  phrase: '',
  explorerProviders: blockstreamExplorerProviders,
  dataProviders: [BlockcypherDataProviders],
  rootDerivationPaths: {
    [Network.Mainnet]: `84'/0'/0'/0/`,
    [Network.Testnet]: `84'/1'/0'/0/`,
    [Network.Stagenet]: `84'/0'/0'/0/`,
  },
  feeBounds: {
    lower: LOWER_FEE_BOUND,
    upper: UPPER_FEE_BOUND,
  },
}

const btcClient = new ClientLedger({
  transportType: TRANSPORT_TYPES.NODE,
  ...defaultBTCParams,
})

describe('Bitcoin Client Ledger', () => {
  it('get address async', async () => {
    const address = await btcClient.getAddressAsync()
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
      const amount = assetToBase(assetAmount('0.000011'))
      const txid = await btcClient.transfer({
        asset: AssetBTC,
        recipient: to,
        amount,
        memo: 'test',
        feeRate: 1,
      })
      console.log(JSON.stringify(txid, null, 2))
    } catch (err) {
      console.error('ERR running test', err)
      fail()
    }
  })
})
