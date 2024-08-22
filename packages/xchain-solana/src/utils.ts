import { Cluster } from '@solana/web3.js'
import { Network } from '@xchainjs/xchain-client'

export const getSolanaNetwork = (network: Network): Cluster => {
  switch (network) {
    case Network.Mainnet:
    case Network.Stagenet:
      return 'mainnet-beta'
    case Network.Testnet:
      return 'testnet'
  }
}
