import { Network } from '@xchainjs/xchain-client'
import { ClientKeystore as EVMClientKeystore, EVMClientParams, KeystoreSigner } from '@xchainjs/xchain-evm'

import { defaultBscParams } from './const'

export class ClientKeystore extends EVMClientKeystore {
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
