/**
 * Import statements
 * Importing the `Client` class from the '@xchainjs/xchain-evm' module
 * Importing the `defaultEthParams` constant from the './const' file
 */
import { Network } from '@xchainjs/xchain-client'
import { ClientKeystore as EVMClientKeystore, EVMClientParams, KeystoreSigner } from '@xchainjs/xchain-evm'

import { defaultEthParams } from './const'

/**
 * Class definition for the Ethereum EVM client.
 * Extends the `XchainEvmClient` class.
 */
export class ClientKeystore extends EVMClientKeystore {
  /**
   * Constructor for the Ethereum EVM client.
   * @param {Object} config - Configuration object for the client (optional).
   *                          Defaults to `defaultEthParams` if not provided.
   */
  constructor(config: Omit<EVMClientParams, 'signer'> = defaultEthParams) {
    // Call the constructor of the parent class with the provided config or the default parameters
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
