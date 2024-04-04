/**
 * Import statements
 * Importing the `Client` class from the '@xchainjs/xchain-evm' module
 * Importing the `defaultEthParams` constant from the './const' file
 */
import { KeystoreClient as EVMKeystoreClient } from '@xchainjs/xchain-evm'

import { defaultEthParams } from './const'

/**
 * Class definition for the Ethereum EVM client.
 * Extends the `XchainEvmClient` class.
 */
export class KeystoreClient extends EVMKeystoreClient {
  /**
   * Constructor for the Ethereum EVM client.
   * @param {Object} config - Configuration object for the client (optional).
   *                          Defaults to `defaultEthParams` if not provided.
   */
  constructor(config = defaultEthParams) {
    super(config) // Call the constructor of the parent class with the provided config or the default parameters
  }
}
