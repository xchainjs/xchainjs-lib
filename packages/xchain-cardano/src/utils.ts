import { NetworkInfo } from '@hippocampus-web3/cardano-serialization-lib-asmjs'
import { Network } from '@xchainjs/xchain-client'

export const getCardanoNetwork = (network: Network): NetworkInfo => {
  const networkMap: { [key in Network]: NetworkInfo } = {
    [Network.Mainnet]: NetworkInfo.mainnet(),
    [Network.Stagenet]: NetworkInfo.mainnet(),
    [Network.Testnet]: NetworkInfo.testnet_preprod(),
  }
  return networkMap[network]
}
