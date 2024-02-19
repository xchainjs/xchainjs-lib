// Import the Client class from '@xchainjs/xchain-evm' module
import { Client as XchainEvmClient } from '@xchainjs/xchain-evm'

// Import defaultArbParams constant from './const' file
import { defaultArbParams } from './const'

// Create a class called Client that extends the XchainEvmClient class
export class Client extends XchainEvmClient {
  // Constructor function that takes an optional config parameter, defaulting to defaultArbParams
  constructor(config = defaultArbParams) {
    // Call the constructor of the parent class (XchainEvmClient) with the provided config
    super(config)
  }
}
