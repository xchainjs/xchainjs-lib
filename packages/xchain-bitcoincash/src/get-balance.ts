import { Network } from '@thorwallet/xchain-client'
import * as utils from './utils'

export const getBalance = (address: string, network: Network) => {
  return utils.getBalance({
    haskoinUrl: {
      testnet: 'https://api.haskoin.com/bchtest',
      mainnet: 'https://api.haskoin.com/bch',
    }[network],
    address,
  })
}
