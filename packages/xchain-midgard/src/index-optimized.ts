/**
 * Optimized Midgard API - Selective Loading Approach
 * Reduced API surface with only essential functionality
 */

import { MIDGARD_API_9R_URL } from './config'
import { Configuration, DefaultApi, ConfigurationParameters } from './selective-api-complete'

// Re-export config
export * from './config'

// Re-export optimized API classes and types
export { Configuration, DefaultApi, SpecificationApi } from './selective-api-complete'
export type {
  Pool,
  PoolsResponse,
  PoolDetail,
  PoolDetails,
  SaverDetails,
  SaverPool,
  GetActions200Response,
  ReverseTHORNames,
  THORNameDetails,
  ConfigurationParameters,
  Coin,
  Coins,
  NetworkFees,
  SwapMetadata,
  Transaction,
} from './selective-api-complete'

/**
 * Creates a fresh Configuration instance to avoid shared state mutations
 */
function createDefaultConfig(overrides: Partial<ConfigurationParameters> = {}): Configuration {
  return new Configuration({
    basePath: MIDGARD_API_9R_URL,
    ...overrides,
  })
}

/**
 * Class representing the Midgard API client (optimized).
 */
export class MidgardApi extends DefaultApi {
  /**
   * Constructs a new instance of the Midgard API client with fresh configuration.
   * @param configParams Optional configuration parameters for the API client.
   */
  constructor(configParams?: Partial<ConfigurationParameters>) {
    // Create fresh configuration to avoid shared state mutations
    const config = createDefaultConfig(configParams)
    super(config)
  }
}
