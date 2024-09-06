// Import the Client class from '@xchainjs/xchain-evm' module
import Transport from '@ledgerhq/hw-transport'
import { Network } from '@xchainjs/xchain-client'
import { ClientLedger as EVMClientLedger, EVMClientParams, LedgerSigner } from '@xchainjs/xchain-evm'

// Create a class called Client that extends the EVMClientLedger class
export class ClientLedger extends EVMClientLedger {
  /**
   * Constructor for the Avalanche EVM client
   * @param {Object} config - configuration object for the client
   *                          Transport
   */
  constructor(config: Omit<EVMClientParams, 'signer' | 'phrase'> & { transport: Transport }) {
    // Call the constructor of the parent class (XchainEvmClient) with the provided config
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
