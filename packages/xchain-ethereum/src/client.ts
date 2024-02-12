/**
 * Import statements
 * Importing the `Client` class from the '@xchainjs/xchain-evm' module
 * Importing the `defaultEthParams` constant from the './const' file
 */
import { Client as XchainEvmClient } from '@xchainjs/xchain-evm'

import { defaultEthParams } from './const'

/**
 * Class definition for the Dogecoin EVM client.
 * Extends the `XchainEvmClient` class.
 */
export default class Client extends XchainEvmClient {
  /**
   * Constructor for the Dogecoin EVM client.
   * @param {Object} config - Configuration object for the client (optional).
   *                          Defaults to `defaultEthParams` if not provided.
   */
  constructor(config = defaultEthParams) {
    super(config) // Call the constructor of the parent class with the provided config or the default parameters
  }
}

/**
 * Export statement
 * Exporting the `Client` class from this file.
 */
export { Client }
