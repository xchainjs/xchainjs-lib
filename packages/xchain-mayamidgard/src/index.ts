import { Configuration, DefaultApi } from './generated/midgardApi'

/**
 * Import all exports from the generated Midgard API.
 */
export * from './generated/midgardApi'

/**
 * Import the configuration for the Midgard API.
 */
export * from './config'

/**
 * Represents the Midgard API client, extending the DefaultApi class.
 */
export class MidgardApi extends DefaultApi {
  /**
   * Constructs a new instance of the Midgard API client.
   * @param config Optional configuration for the API client.
   */
  constructor(config = new Configuration({ basePath: 'https://midgard.mayachain.info' })) {
    super(config)
  }
}
