import type Transport from '@ledgerhq/hw-transport'
import { Network } from '@xchainjs/xchain-client'
import { ClientLedger as EVMClientLedger, EVMClientParams, LedgerSigner } from '@xchainjs/xchain-evm'

export class ClientLedger extends EVMClientLedger {
  constructor(config: Omit<EVMClientParams, 'signer' | 'phrase'> & { transport: Transport }) {
    super({
      ...config,
      signer: new LedgerSigner({
        transport: config.transport,
        provider: config.providers[config.network || Network.Mainnet],
        derivationPath: config.rootDerivationPaths ? config.rootDerivationPaths[config.network || Network.Mainnet] : '',
      }),
    })
  }
}
