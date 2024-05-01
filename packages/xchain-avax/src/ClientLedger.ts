/**
 * Import statements
 * Importing the `Client` class from the '@xchainjs/xchain-evm' module
 * Importing the `defaultEthParams` constant from the './const' file
 */
import type Transport from '@ledgerhq/hw-transport'
import { Network } from '@xchainjs/xchain-client'
import { ClientLedger as EVMClientLedger, EVMClientParams, LedgerSigner } from '@xchainjs/xchain-evm'
/**
 * Class definition for the Avalanche EVM client.
 * Extends the `XchainEvmClient` class.
 */
export class ClientLedger extends EVMClientLedger {
  /**
   * Constructor for the Avalanche EVM client.
   * @param {Object} config - Configuration object for the client (optional).
   *                          Defaults to `defaultEthParams` if not provided.
   */
  constructor(config: Omit<EVMClientParams, 'signer' | 'phrase'> & { transport: Transport }) {
    // Call the constructor of the parent class with the provided config or the default parameters
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
