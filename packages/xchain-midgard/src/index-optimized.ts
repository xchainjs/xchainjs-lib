/**
 * Optimized Midgard API - Selective Loading Approach
 * Reduced API surface with only essential functionality
 */

import { MIDGARD_API_9R_URL } from './config'
import { Configuration, DefaultApi } from './selective-api-complete'

// Re-export config
export * from './config'

// Re-export optimized API classes and types
export { Configuration, DefaultApi, SpecificationApi } from './selective-api-complete'
export type { Pool, PoolsResponse, PoolDetail, PoolDetails, SaverDetails, SaverPool, ConfigurationParameters } from './selective-api-complete'

/**
 * The base URL for the Midgard API.
 */
const baseUrl = MIDGARD_API_9R_URL

/**
 * Default configuration for the Midgard API client.
 */
const defaultConfig = new Configuration({ basePath: baseUrl })

/**
 * Class representing the Midgard API client (optimized).
 */
export class MidgardApi extends DefaultApi {
  /**
   * Constructs a new instance of the Midgard API client with the provided configuration.
   * @param config Optional configuration for the API client. Defaults to the default configuration.
   */
  constructor(config = defaultConfig) {
    super(config)
  }
}