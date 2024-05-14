// Import the Client class from '@xchainjs/xchain-evm' module
import { Network } from '@xchainjs/xchain-client'
import { ClientKeystore as EVMClientKeystore, EVMClientParams, KeystoreSigner } from '@xchainjs/xchain-evm'

// Import defaultAvaxParams constant from './const' file
import { defaultAvaxParams } from './const'

// Define and export the Client class as the default exportClientKeystore
export class ClientKeystore extends EVMClientKeystore {
  // Constructor function that takes an optional config parameter, defaulting to defaultAvaxParams
  constructor(config: Omit<EVMClientParams, 'signer'> = defaultAvaxParams) {
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
