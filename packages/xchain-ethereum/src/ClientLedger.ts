/**
 * Import statements
 * Importing the `Client` class from the '@xchainjs/xchain-evm' module
 * Importing the `defaultEthParams` constant from the './const' file
 */
import { ClientLedger as EVMClientLedger, EVMClientParams } from '@xchainjs/xchain-evm'

/**
 * Class definition for the Ethereum EVM client.
 * Extends the `XchainEvmClient` class.
 */
export class ClientLedger extends EVMClientLedger {
  /**
   * Constructor for the Ethereum EVM client.
   * @param {Object} config - Configuration object for the client (optional).
   *                          Defaults to `defaultEthParams` if not provided.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(config: EVMClientParams & { transport: any }) {
    super(config) // Call the constructor of the parent class with the provided config or the default parameters
  }
}
