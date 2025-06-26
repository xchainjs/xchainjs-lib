import TransportNodeHid from '@ledgerhq/hw-transport-node-hid'
import { Network } from '@xchainjs/xchain-client'
import { assetAmount, assetToBase } from '@xchainjs/xchain-util'
import { UtxoClientParams } from '@xchainjs/xchain-utxo'

import { ClientLedger } from '../src/clientLedger'
import {
  AssetBCH,
  BitgoProviders,
  HaskoinDataProviders,
  LOWER_FEE_BOUND,
  UPPER_FEE_BOUND,
  explorerProviders,
} from '../src/const'
jest.setTimeout(200000)

// Default parameters for Bitcoin Cash (BCH) client
const defaultBchParams: UtxoClientParams = {
  network: Network.Mainnet, // Default network is Mainnet
  phrase: '', // Default empty phrase
  explorerProviders: explorerProviders, // Default explorer providers
  dataProviders: [HaskoinDataProviders, BitgoProviders], // Default data providers
  rootDerivationPaths: {
    [Network.Mainnet]: `m/44'/145'/0'/0/`, // Default root derivation path for Mainnet
    [Network.Testnet]: `m/44'/1'/0'/0/`, // Default root derivation path for Testnet
    [Network.Stagenet]: `m/44'/145'/0'/0/`, // Default root derivation path for Stagenet
  },
  feeBounds: {
    lower: LOWER_FEE_BOUND, // Default lower fee bound
    upper: UPPER_FEE_BOUND, // Default upper fee bound
  },
}

describe('BitcoinCash Client Ledger', () => {
  let btcCashClient: ClientLedger
  beforeAll(async () => {
    const transport = await TransportNodeHid.create()

    btcCashClient = new ClientLedger({
      transport,
      ...defaultBchParams,
    })
  })
  it('get ledger address async without verification', async () => {
    const address = await btcCashClient.getAddressAsync()
    console.log('address', address)
    expect(address).toContain('q')
  })

  it('get ledger address async with verification', async () => {
    const address = await btcCashClient.getAddressAsync(0, true)
    console.log('address', address)
    expect(address).toContain('q')
  })

  it('get ledger balance', async () => {
    const address = await btcCashClient.getAddressAsync()
    const balance = await btcCashClient.getBalance(address)
    console.log('balance', balance[0].amount.amount().toString())
  })

  it('transfer Ledger test amount', async () => {
    try {
      const to = await btcCashClient.getAddressAsync(1)
      const amount = assetToBase(assetAmount('0.001'))
      const txid = await btcCashClient.transfer({
        asset: AssetBCH,
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
