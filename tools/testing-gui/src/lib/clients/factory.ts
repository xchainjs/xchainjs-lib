import { Network } from '@xchainjs/xchain-client'
import type { XChainClient } from '@xchainjs/xchain-client'

import { ClientKeystore as BtcClient, defaultBTCParams } from '@xchainjs/xchain-bitcoin'
import { ClientKeystore as LtcClient, defaultLtcParams } from '@xchainjs/xchain-litecoin'
import { ClientKeystore as DogeClient, defaultDogeParams } from '@xchainjs/xchain-doge'
import { ClientKeystore as EthClient, defaultEthParams } from '@xchainjs/xchain-ethereum'
import { ClientKeystore as ThorClient, defaultClientConfig as defaultThorParams } from '@xchainjs/xchain-thorchain'

export interface ClientConfig {
  phrase: string
  network: Network
}

export function createClient(chainId: string, config: ClientConfig): XChainClient {
  const { phrase, network } = config

  switch (chainId) {
    case 'BTC':
      return new BtcClient({ ...defaultBTCParams, network, phrase })
    case 'LTC':
      return new LtcClient({ ...defaultLtcParams, network, phrase })
    case 'DOGE':
      return new DogeClient({ ...defaultDogeParams, network, phrase })
    case 'ETH':
      return new EthClient({ ...defaultEthParams, network, phrase })
    case 'THOR':
      return new ThorClient({ ...defaultThorParams, network, phrase })
    default:
      throw new Error(`Unsupported chain: ${chainId}`)
  }
}
