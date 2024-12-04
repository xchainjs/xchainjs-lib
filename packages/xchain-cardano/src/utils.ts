import { NetworkInfo } from '@emurgo/cardano-serialization-lib-nodejs'
import { Network } from '@xchainjs/xchain-client'

export const getCardanoNetwork = (network: Network): NetworkInfo => {
  const networkMap: { [key in Network]: NetworkInfo } = {
    [Network.Mainnet]: NetworkInfo.mainnet(),
    [Network.Stagenet]: NetworkInfo.mainnet(),
    [Network.Testnet]: NetworkInfo.testnet_preprod(),
  }
  return networkMap[network]
}
