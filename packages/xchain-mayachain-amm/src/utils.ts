import { BTCChain, Client as BtcClient, defaultBTCParams as defaultBtcParams } from '@xchainjs/xchain-bitcoin'
import { Network } from '@xchainjs/xchain-client'
import { Client as DashClient, DASHChain, defaultDashParams } from '@xchainjs/xchain-dash'
import { Client as EthClient, ETHChain, defaultEthParams } from '@xchainjs/xchain-ethereum'
import { Client as KujiraClient, KUJIChain, defaultKujiParams } from '@xchainjs/xchain-kujira'
import { Client as MayaClient, MAYAChain } from '@xchainjs/xchain-mayachain'
import { Client as ThorClient, THORChain } from '@xchainjs/xchain-thorchain'
import { Address, Chain } from '@xchainjs/xchain-util'

export const validateAddress = (network: Network, chain: Chain, address: Address): boolean => {
  switch (chain) {
    case BTCChain:
      return new BtcClient({ ...defaultBtcParams, network }).validateAddress(address)
    case ETHChain:
      return new EthClient({ ...defaultEthParams, network }).validateAddress(address)
    case DASHChain:
      return new DashClient({ ...defaultDashParams, network }).validateAddress(address)
    case KUJIChain:
      return new KujiraClient({ ...defaultKujiParams, network }).validateAddress(address)
    case THORChain:
      return new ThorClient({ network }).validateAddress(address)
    case MAYAChain:
      return new MayaClient({ network }).validateAddress(address)
    default:
      throw Error('Unsupported chain')
  }
}
