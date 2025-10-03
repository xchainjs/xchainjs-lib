import AppXrp from '@ledgerhq/hw-app-xrp'
import { FeeRate, TxHash, TxParams } from '@xchainjs/xchain-client'
import { Address } from '@xchainjs/xchain-util'
import { encode, type Payment } from 'xrpl'

import { Client } from './client'
import { SignedTransaction, XRPClientParams, XRPTxParams } from './types'

/**
 * Custom Ledger XRP client extending the base XRP client
 */
class ClientLedger extends Client {
  // Reference to the Ledger transport object
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private transport: any
  private app: AppXrp | undefined

  // Constructor
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(params: XRPClientParams & { transport: any }) {
    super(params)
    this.transport = params.transport
  }

  // Get the Ledger XRP application instance
  public async getApp(): Promise<AppXrp> {
    if (this.app) {
      return this.app
    }
    this.app = new AppXrp(this.transport)
    return this.app
  }

  // Get the current address synchronously - not supported for Ledger
  getAddress(): string {
    throw Error('Sync method not supported for Ledger')
  }

  // Get the current address asynchronously
  async getAddressAsync(index = 0, verify = false): Promise<Address> {
    const app = await this.getApp()
    const derivationPath = this.getFullDerivationPath(index)
    const result = await app.getAddress(derivationPath, verify)
    return result.address
  }

  // Sign transaction with Ledger (required by abstract Client class)
  async signTransaction(payment: Payment, walletIndex: number): Promise<SignedTransaction> {
    const app = await this.getApp()

    // Get derivation path for signing
    const derivationPath = this.getFullDerivationPath(walletIndex)

    // Get the public key first
    const addressInfo = await app.getAddress(derivationPath, false)

    // Prepare transaction with SigningPubKey BEFORE encoding
    const preparedTx = {
      ...payment,
      SigningPubKey: addressInfo.publicKey.toUpperCase(),
    }

    // Encode the prepared transaction
    const txBlob = encode(preparedTx)

    // Sign the transaction with Ledger
    const signature = await app.signTransaction(derivationPath, txBlob)

    // Validate signature exists
    if (!signature) {
      throw new Error('No signature received from Ledger device')
    }

    // Create final signed transaction with signature
    const signedTx = {
      ...preparedTx,
      TxnSignature: signature.toUpperCase(),
    } as Payment

    return { tx_blob: encode(signedTx) }
  }

  // Transfer XRP from Ledger
  async transfer(params: TxParams & XRPTxParams & { feeRate?: FeeRate }): Promise<TxHash> {
    const fromAddressIndex = params?.walletIndex || 0

    // Get sender address
    const sender = await this.getAddressAsync(fromAddressIndex)

    // Build a simple transaction structure like in the Ledger examples
    const xrplClient = await this.getXrplClient()

    // Build basic transaction structure for autofill
    const baseTx: Payment = {
      TransactionType: 'Payment',
      Account: sender,
      Destination: params.recipient,
      Amount: params.amount.amount().toString(),
    }

    // Add destination tag if provided
    if (params.destinationTag !== undefined) {
      baseTx.DestinationTag = params.destinationTag
    }

    // Add memo if provided
    if (params.memo) {
      baseTx.Memos = [
        {
          Memo: {
            MemoData: Buffer.from(params.memo, 'utf8').toString('hex').toUpperCase(),
          },
        },
      ]
    }

    // Use autofill to get the required fields
    const autofilledTx = await xrplClient.autofill(baseTx)

    // Create a clean transaction object for Ledger signing with only the fields it expects
    const ledgerTx: Record<string, unknown> = {
      TransactionType: 'Payment',
      Account: sender,
      Destination: params.recipient,
      Amount: params.amount.amount().toString(),
      Fee: autofilledTx.Fee,
      Sequence: autofilledTx.Sequence,
      LastLedgerSequence: autofilledTx.LastLedgerSequence,
    }

    // Add optional fields
    if (params.destinationTag !== undefined) {
      ledgerTx.DestinationTag = params.destinationTag
    }

    if (params.memo) {
      ledgerTx.Memos = [
        {
          Memo: {
            MemoData: Buffer.from(params.memo, 'utf8').toString('hex').toUpperCase(),
          },
        },
      ]
    }

    const signed = await this.signTransaction(ledgerTx as Payment, fromAddressIndex)

    // Submit the signed transaction blob
    const response = await xrplClient.request({
      command: 'submit',
      tx_blob: signed.tx_blob,
    })

    if (response.result.engine_result !== 'tesSUCCESS') {
      throw new Error(`XRP transaction failed with code: ${response.result.engine_result}`)
    }

    if (!response.result.tx_json.hash) {
      throw new Error('No transaction hash received from XRPL')
    }

    return response.result.tx_json.hash
  }
}

export { ClientLedger }
