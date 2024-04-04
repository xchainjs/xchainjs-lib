/**
 * Module importing and providing a customized client for the Binance Smart Chain (BSC).
 */
import { Client as EVMKeystoreClient } from '@xchainjs/xchain-evm' // Importing the base client from xchain-evm library

import { defaultBscParams } from './const' // Importing default parameters for BSC

/**
 * Customized BSC client extending the base XchainEvmClient.
 */
export class KeystoreClient extends EVMKeystoreClient {
  /**
   * Constructor for the BSC client.
   *
   * @param {Object} config Configuration parameters for the client. Defaults to defaultBscParams if not provided.
   */
  constructor(config = defaultBscParams) {
    super(config) // Calling the constructor of the base client with the provided configuration or default parameters
  }
}
