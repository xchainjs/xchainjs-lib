import TransportNodeHid from '@ledgerhq/hw-transport-node-hid'
import { Network } from '@xchainjs/xchain-client'
import { assetAmount, assetToBase } from '@xchainjs/xchain-util'
import { UtxoClientParams } from '@xchainjs/xchain-utxo'

import { ClientLedger } from '../src/clientLedger'
import {
  AssetDOGE,
  LOWER_FEE_BOUND,
  UPPER_FEE_BOUND,
  blockcypherDataProviders,
  blockstreamExplorerProviders,
} from '../src/const'

const defaultDogeParams: UtxoClientParams = {
  network: Network.Mainnet, // Default network is Mainnet
  phrase: '', // Default empty phrase
  explorerProviders: blockstreamExplorerProviders, // Default explorer providers
  dataProviders: [blockcypherDataProviders], // Default data providers
  rootDerivationPaths: {
    [Network.Mainnet]: `m/44'/3'/0'/0/`, // Default root derivation path for Mainnet
    [Network.Stagenet]: `m/44'/3'/0'/0/`, // Default root derivation path for Stagenet
    [Network.Testnet]: `m/44'/1'/0'/0/`, // Default root derivation path for Testnet
  },
  feeBounds: {
    lower: LOWER_FEE_BOUND, // Default lower fee bound
    upper: UPPER_FEE_BOUND, // Default upper fee bound
  },
}

jest.setTimeout(200000)

describe('BitcoinCash Client Ledger', () => {
  let dogeClient: ClientLedger
  beforeAll(async () => {
    const transport = await TransportNodeHid.create()

    dogeClient = new ClientLedger({
      transport,
      ...defaultDogeParams,
    })
  })
  it('get ledger address async without verification', async () => {
    const address = await dogeClient.getAddressAsync()
    console.log('address', address)
    expect(address).toContain('D')
  })

  it('get ledger address async with verification', async () => {
    const address = await dogeClient.getAddressAsync(0, true)
    console.log('address', address)
    expect(address).toContain('D')
  })

  it('get ledger balance', async () => {
    const address = await dogeClient.getAddressAsync()
    const balance = await dogeClient.getBalance(address)
    console.log('balance', balance[0].amount.amount().toString())
  })

  it('transfer Ledger test amount', async () => {
    try {
      const to = await dogeClient.getAddressAsync(1)
      const amount = assetToBase(assetAmount('1'))
      const txid = await dogeClient.transfer({
        asset: AssetDOGE,
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
  it('transfer Ledger test amount long memo', async () => {
    try {
      const to = await dogeClient.getAddressAsync(1)
      const amount = assetToBase(assetAmount('1'))
      const txid = await dogeClient.transfer({
        asset: AssetDOGE,
        recipient: to,
        amount,
        memo: '=:r:thor1tqpyn3athvuj8dj7nu5fp0xm76ut86sjcl3pqu:0/1/0:dx:0',
        feeRate: 1,
      })
      console.log(JSON.stringify(txid, null, 2))
    } catch (err) {
      console.error('ERR running test', err)
      fail()
    }
  })
})
