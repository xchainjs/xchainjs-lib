import { Network, UtxoClientParams } from '@xchainjs/xchain-client'

import { ClientLedger } from '../src/clientLedger'
import { BlockcypherDataProviders, LOWER_FEE_BOUND, UPPER_FEE_BOUND, blockstreamExplorerProviders } from '../src/const'

jest.setTimeout(60000)

const defaultBTCParams: UtxoClientParams = {
  network: Network.Testnet,
  phrase: '',
  explorerProviders: blockstreamExplorerProviders,
  dataProviders: [BlockcypherDataProviders],
  rootDerivationPaths: {
    [Network.Mainnet]: `84'/0'/0'/0/`, //note this isn't bip44 compliant, but it keeps the wallets generated compatible to pre HD wallets
    [Network.Testnet]: `84'/1'/0'/0/`,
    [Network.Stagenet]: `84'/0'/0'/0/`,
  },
  feeBounds: {
    lower: LOWER_FEE_BOUND,
    upper: UPPER_FEE_BOUND,
  },
}

const btcClient = new ClientLedger({
  ...defaultBTCParams,
})

describe('Bitcoin Client Ledger', () => {
  beforeAll(async () => {
    await btcClient.initialize()
  })

  it('get address', async () => {
    // NOT FINAL CODE ONLY POC PORPUSE
    const address = await btcClient.getAddress()
    console.log('address', address)
    expect(address).toContain('b')
  })

  it('get balance', async () => {
    // NOT FINAL CODE ONLY POC PORPUSE
    const address = await btcClient.getAddress()
    const balance = await btcClient.getBalance(address)
    console.log('balance', balance[0].amount.amount().toString())
    expect(balance).toContain('b')
  })
})
