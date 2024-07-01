import { ExplorerProvider } from './explorer-provider'
import { Network } from './types'

/**
 * Type alias for explorer providers.
 */
export type ExplorerProviders = Record<Network, ExplorerProvider>
