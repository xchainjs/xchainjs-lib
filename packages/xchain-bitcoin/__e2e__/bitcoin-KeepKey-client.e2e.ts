/*
    KK rest api
    - view swagger docs at
      http://localhost:1646/docs

    - Docs: https://medium.com/@highlander_35968/building-on-the-keepkey-sdk-2023fda41f38

*/

// import { KeepKeySdk } from '@keepkey/keepkey-sdk'
import { Network } from '@xchainjs/xchain-client'
import { assetAmount, assetToBase } from '@xchainjs/xchain-util'
import { UtxoClientParams } from '@xchainjs/xchain-utxo'

import { ClientKeepKey } from '../src/clientKeepKey'
import {
  AssetBTC,
  BlockcypherDataProviders,
  HaskoinDataProviders,
  LOWER_FEE_BOUND,
  UPPER_FEE_BOUND,
  blockstreamExplorerProviders,
} from '../src/const'

jest.setTimeout(200000)

const defaultBTCParams: UtxoClientParams = {
  network: Network.Mainnet,
  phrase: '',
  explorerProviders: blockstreamExplorerProviders,
  dataProviders: [HaskoinDataProviders, BlockcypherDataProviders],
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

//this spec url is static
const spec = 'http://localhost:1646/spec/swagger.json'

const apiKey = process.env['KK_API_KEY'] || '1234' // sample access_token in raw is the api key
// config for xchainjs test
const kkConfig = {
  apiKey,
  pairingInfo: {
    name: 'xchain-js e2e test',
    imageUrl: 'https://xchainjs.org/logos/xchainjs.svg',
    basePath: spec,
    url: 'https://xchainjs.org',
  },
}

describe('Bitcoin Client KeepKey', () => {
  let btcClient: ClientKeepKey
  beforeAll(async () => {
    btcClient = new ClientKeepKey({
      config: kkConfig,
      ...defaultBTCParams,
    })
  })

  it('get keepkey address async without verification', async () => {
    const address1 = await btcClient.getAddressAsync(0)
    const address2 = await btcClient.getAddressAsync(1)
    const address3 = await btcClient.getAddressAsync(2)
    console.log('address1', address1)
    console.log('address2', address2)
    console.log('address3', address3)
    expect(address1).toContain('b')
  })

  it('get address async with verification', async () => {
    const address = await btcClient.getAddressAsync(0, true)
    console.log('address', address)
    expect(address).toContain('b')
  })

  it('get balance keepKey', async () => {
    const address = await btcClient.getAddressAsync()
    const balance = await btcClient.getBalance(address)
    console.log('balance', balance[0].amount.amount().toString())
  })

  it('transfer from KeepKey without memo', async () => {
    try {
      const address = await btcClient.getAddressAsync()
      const balance = await btcClient.getBalance(address)
      console.log('balance', balance[0].amount.amount().toString())
      const to = await btcClient.getAddressAsync(1)
      console.log(to)
      const amount = assetToBase(assetAmount('0.001'))
      const txid = await btcClient.transfer({
        asset: AssetBTC,
        recipient: to,
        amount,
        feeRate: 1,
      })
      console.log(JSON.stringify(txid, null, 2))
    } catch (err) {
      console.error('ERR running test', err)
      fail()
    }
  })
  it('transfer from KeepKey with memo', async () => {
    try {
      const to = await btcClient.getAddressAsync(1)
      const amount = assetToBase(assetAmount('0.001'))
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
