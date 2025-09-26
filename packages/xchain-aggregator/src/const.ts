import { Network } from '@xchainjs/xchain-client'
import { Config, Protocol } from './types'

export const SupportedProtocols: Protocol[] = ['Thorchain', 'Mayachain', 'Chainflip']

export const DEFAULT_CONFIG: Required<Omit<Config, 'wallet' | 'affiliate'>> = {
  protocols: SupportedProtocols,
  network: Network.Mainnet,
}
