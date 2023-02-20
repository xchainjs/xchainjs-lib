import { BlockcypherProvider } from '@xchainjs/xchain-providers'

import { AssetBTC, BTCChain } from '../../xchain-bitcoin/src/const'
import { BlockcypherNetwork } from '../lib/providers/blockcypher/blockcypher-api-types'

const blockcypherProvider = new BlockcypherProvider(
  'https://api.blockcypher.com/v1',
  '',
  BTCChain,
  AssetBTC,
  8,
  BlockcypherNetwork.BTC,
)

describe('blockcypher api tests', () => {
  it(`Should fetch the balance for an address`, async () => {
    const address = '1DEP8i3QJCsomS4BSMY2RpU1upv62aGvhD'
    const bal = await blockcypherProvider.getBalance(address)
    console.log(bal)
  })
})
