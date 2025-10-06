import TronLedgerApp from '@ledgerhq/hw-app-trx'
import { Address } from '@xchainjs/xchain-util'

import { Client, defaultTRONParams } from './client'
import { TronTransaction, TronSignedTransaction, TRONClientLedgerParams } from './types'

/**
 * Custom Tron Ledger client extending the base Tron client
 */
class ClientLedger extends Client {
  // Reference to the Ledger transport object
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private transport: any
  private ledgerApp: TronLedgerApp | undefined

  constructor(params: TRONClientLedgerParams) {
    const clientParams = { ...defaultTRONParams, ...params }

    super(clientParams)

    this.transport = params.transport
    this.ledgerApp = new TronLedgerApp(this.transport)
  }

  // Get the current address synchronously - not supported for Ledger Client
  getAddress(): string {
    throw Error('Sync method not supported for Ledger')
  }

  // Get the current address asynchronously
  async getAddressAsync(index = 0, verify = false): Promise<Address> {
    if (!this.ledgerApp) throw Error('ledger not connected')

    const derivationPath = this.getFullDerivationPath(index)
    const result = await this.ledgerApp.getAddress(derivationPath, verify)
    return result.address
  }

  // Sign transaction using Ledger
  async signTransaction(transaction: TronTransaction, walletIndex = 0): Promise<TronSignedTransaction> {
    if (!this.ledgerApp) throw Error('ledger not connected')

    const derivationPath = this.getFullDerivationPath(walletIndex)

    const rawTxHex = transaction.raw_data_hex

    const signature = await this.ledgerApp.signTransaction(
      derivationPath,
      rawTxHex,
      [], // No token signatures for basic TRX/TRC20 sends, just pass [].
    )

    if (!signature) {
      throw new Error('failed signing tx by ledger')
    }

    return {
      ...transaction,
      signature: [signature],
    }
  }
}

export { ClientLedger }
