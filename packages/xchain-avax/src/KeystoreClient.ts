// Import the Client class from '@xchainjs/xchain-evm' module
import { KeystoreClient as EVMKeystoreClient } from '@xchainjs/xchain-evm'

// Import defaultAvaxParams constant from './const' file
import { defaultAvaxParams } from './const'

// Define and export the Client class as the default export
export class KeystoreClient extends EVMKeystoreClient {
  // Constructor function that takes an optional config parameter, defaulting to defaultAvaxParams
  constructor(config = defaultAvaxParams) {
    super(config)
  }
}
