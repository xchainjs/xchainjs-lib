/**
 * Module importing and providing a customized client for the Binance Smart Chain (BSC).
 */
import { Network } from '@xchainjs/xchain-client'
import { ClientKeystore as EVMClientKeystore, EVMClientParams, KeystoreSigner } from '@xchainjs/xchain-evm' // Importing the base client from xchain-evm library

import { defaultBscParams } from './const' // Importing default parameters for BSC

/**
 * Customized BSC client extending the base XchainEvmClient.
 */
export class ClientKeystore extends EVMClientKeystore {
  /**
   * Constructor for the BSC client.
   *
   * @param {Object} config Configuration parameters for the client. Defaults to defaultBscParams if not provided.
   */
  constructor(config: Omit<EVMClientParams, 'signer'> = defaultBscParams) {
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
