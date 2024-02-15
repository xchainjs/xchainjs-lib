import { MIDGARD_API_9R_URL } from './config'
import { Configuration, DefaultApi } from './generated/midgardApi'

/**
 * The base URL for the Midgard API.
 */
const baseUrl = MIDGARD_API_9R_URL

/**
 * Default configuration for the Midgard API client.
 */
const defaultConfig = new Configuration({ basePath: baseUrl })

/**
 * Exports generated Midgard API clients and configuration.
 */
export * from './generated/midgardApi'
export * from './config'

/**
 * Class representing the Midgard API client.
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
