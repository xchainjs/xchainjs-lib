import { Cluster } from '@solana/web3.js'
import { Network } from '@xchainjs/xchain-client'

export const getSolanaNetwork = (network: Network): Cluster => {
  const networkMap: { [key in Network]: Cluster } = {
    [Network.Mainnet]: 'mainnet-beta',
    [Network.Stagenet]: 'mainnet-beta',
    [Network.Testnet]: 'testnet',
  }
  return networkMap[network]
}
