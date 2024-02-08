// Import the Client class from '@xchainjs/xchain-evm' module
import { Client as XchainEvmClient } from '@xchainjs/xchain-evm'

// Import defaultAvaxParams constant from './const' file
import { defaultAvaxParams } from './const'

// Define and export the Client class as the default export
export default class Client extends XchainEvmClient {
  // Constructor function that takes an optional config parameter, defaulting to defaultAvaxParams
  constructor(config = defaultAvaxParams) {
    // Call the constructor of the parent class (XchainEvmClient) with the provided config
    super(config)
  }
}

// Export the Client class explicitly (not as a default export)
export { Client }
