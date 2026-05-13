import { Network } from '@xchainjs/xchain-client'
import { Config, Protocol } from './types'

export const SupportedProtocols: Protocol[] = ['Thorchain', 'Mayachain', 'Chainflip', 'OneClick']

export const DEFAULT_CONFIG: Required<Omit<Config, 'wallet' | 'affiliate' | 'brokerUrl' | 'oneClickApiKey'>> = {
  protocols: SupportedProtocols,
  network: Network.Mainnet,
  affiliateBrokers: [],
}
