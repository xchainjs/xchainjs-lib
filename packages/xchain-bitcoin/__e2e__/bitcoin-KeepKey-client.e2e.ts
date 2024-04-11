/*
    KK rest api
    - view swagger docs at
      http://localhost:1646/docs

    - Docs: https://medium.com/@highlander_35968/building-on-the-keepkey-sdk-2023fda41f38

*/

import { KeepKeySdk } from '@keepkey/keepkey-sdk'
import { Network } from '@xchainjs/xchain-client'
import { UtxoClientParams } from '@xchainjs/xchain-utxo'
import { ClientKeepKey } from '../src/clientKeepKey'

// import { ClientKeepKey } from '../src/clientKeepKey'
import { BlockcypherDataProviders, LOWER_FEE_BOUND, UPPER_FEE_BOUND, blockstreamExplorerProviders } from '../src/const'

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

//this spec url is static
const spec = 'http://localhost:1646/spec/swagger.json'

let apiKey = process.env['KK_API_KEY'] || '1234'
let kkConfig = {
  apiKey,
  pairingInfo: {
    name: "xchain-js e2e test",
    imageUrl:
      "https://xchainjs.org/logos/xchainjs.svg",
    basePath: spec,
    url: "https://xchainjs.org",
  },
};


describe('Bitcoin Client KeepKey', () => {
  let btcClient: ClientKeepKey
  beforeAll(async () => {
    btcClient = new ClientKeepKey({
      config: kkConfig,
      ...defaultBTCParams,
    })
  })

  it('get keepkey address async without verification', async () => {
    const address = await btcClient.getAddressAsync()
    console.log('address', address)
    expect(address).toContain('b')
  })

  it('get address async with verification', async () => {
    const address = await btcClient.getAddressAsync(0, true)
    console.log('address', address)
    expect(address).toContain('b')
  })
})
