import { KeepKeyHDWallet } from '@shapeshiftoss/hdwallet-keepkey'
import { Network } from '@xchainjs/xchain-client'
import { UtxoClientParams } from '@xchainjs/xchain-utxo'

import { ClientKeepKey } from '../src/clientKeepKey'
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

describe('Bitcoin Client KeepKey', () => {
  let btcClient: ClientKeepKey
  beforeAll(async () => {
    const transport = await KeepKeyHDWallet.create()
    btcClient = new ClientKeepKey({
      transport,
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
