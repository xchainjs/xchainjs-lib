/**
 * Optimized Mayamidgard API - Selective Loading Approach
 * Reduced API surface with only essential functionality
 */

import { MIDGARD_API_9R_URL } from './config'
import { Configuration, DefaultApi } from './selective-api-complete'

// Re-export config
export * from './config'

// Re-export optimized API classes and types
export { Configuration, DefaultApi, SpecificationApi } from './selective-api-complete'
export type { Pool, PoolsResponse, ConfigurationParameters } from './selective-api-complete'

/**
 * The base URL for the Mayamidgard API.
 */
const baseUrl = MIDGARD_API_9R_URL

/**
 * Default configuration for the Mayamidgard API client.
 */
const defaultConfig = new Configuration({ basePath: baseUrl })

/**
 * Class representing the Mayamidgard API client (optimized).
 */
export class MayamidgardApi extends DefaultApi {
  /**
   * Constructs a new instance of the Mayamidgard API client with the provided configuration.
   * @param config Optional configuration for the API client. Defaults to the default configuration.
   */
  constructor(config = defaultConfig) {
    super(config)
  }
}