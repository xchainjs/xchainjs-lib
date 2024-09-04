// Import the Client class from '@xchainjs/xchain-evm' module
import { Network } from '@xchainjs/xchain-client'
import { Client as XchainEvmClient, EVMClientParams, KeystoreSigner } from '@xchainjs/xchain-evm'

// Import defaultBaseParams constant from './const' file
import { defaultBaseParams } from './const'

// Create a class called Client that extends the XchainEvmClient class
export class Client extends XchainEvmClient {
  // Constructor function that takes an optional config parameter, defaulting to defaultBaseParams
  constructor(config: Omit<EVMClientParams, 'signer'> = defaultBaseParams) {
    // Call the constructor of the parent class (XchainEvmClient) with the provided config
    super({
      ...config,
      signer: config.phrase
        ? new KeystoreSigner({
            phrase: config.phrase,
            provider: config.providers[config.network || Network.Mainnet],
            derivationPath: config.rootDerivationPaths
              ? config.rootDerivationPaths[config.network || Network.Mainnet]
              : '',
          })
        : undefined,
    })
  }
}
