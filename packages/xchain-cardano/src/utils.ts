import { type NetworkInfo } from '@emurgo/cardano-serialization-lib-browser'
import { Network } from '@xchainjs/xchain-client'

import { getCardano } from './wasm'

export const getCardanoNetwork = async (network: Network): Promise<NetworkInfo> => {
  const cardanoLib = await getCardano()
  const networkMap: { [key in Network]: NetworkInfo } = {
    [Network.Mainnet]: cardanoLib.NetworkInfo.mainnet(),
    [Network.Stagenet]: cardanoLib.NetworkInfo.mainnet(),
    [Network.Testnet]: cardanoLib.NetworkInfo.testnet_preprod(),
  }
  return networkMap[network]
}
export const getCardanoPrefix = (network: Network): string => {
  switch (network) {
    case Network.Mainnet:
      return 'addr'
    case Network.Testnet:
    case Network.Stagenet:
      return 'addr_test'
  }
}
