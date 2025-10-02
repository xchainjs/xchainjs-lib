import AppXrp from '@ledgerhq/hw-app-xrp'
import { FeeRate, TxHash, TxParams } from '@xchainjs/xchain-client'
import { Address } from '@xchainjs/xchain-util'
import { encode } from 'ripple-binary-codec'
import type { Payment } from 'xrpl'

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

    // Create final signed transaction with signature
    const signedTx = {
      ...preparedTx,
      TxnSignature: signature.toUpperCase(),
    } as Payment

    return {
      tx_blob: encode(signedTx),
      hash: undefined, // Hash will be calculated when broadcasting
    }
  }

  // Transfer XRP from Ledger
  async transfer(params: TxParams & XRPTxParams & { feeRate?: FeeRate }): Promise<TxHash> {
    const fromAddressIndex = params?.walletIndex || 0

    // Get sender address
    const sender = await this.getAddressAsync(fromAddressIndex)

    // Build a simple transaction structure like in the Ledger examples
    const xrplClient = await this.getXrplClient()

    // Ensure client is connected
    if (!xrplClient.isConnected()) {
      await xrplClient.connect()
    }

    // Get account info for sequence number
    const accountInfo = await xrplClient.request({
      command: 'account_info',
      account: sender,
      ledger_index: 'validated',
    })

    // Get current ledger for LastLedgerSequence
    const ledgerInfo = await xrplClient.request({
      command: 'ledger',
      ledger_index: 'validated',
    })

    // Get proper fee from the base client
    const fees = await this.getFees()
    const fee = fees.average.amount().toString()

    // Build basic transaction structure following Ledger examples
    const transaction: Record<string, unknown> = {
      TransactionType: 'Payment',
      Account: sender,
      Destination: params.recipient,
      Amount: params.amount.amount().toString(),
      Fee: fee,
      Sequence: accountInfo.result.account_data.Sequence,
      LastLedgerSequence: ledgerInfo.result.ledger.ledger_index + 10,
    }

    // Add destination tag if provided
    if (params.destinationTag !== undefined) {
      transaction.DestinationTag = params.destinationTag
    }

    // Add memo if provided
    if (params.memo) {
      transaction.Memos = [
        {
          Memo: {
            MemoData: Buffer.from(params.memo, 'utf8').toString('hex').toUpperCase(),
          },
        },
      ]
    }

    const signed = await this.signTransaction(transaction as Payment, fromAddressIndex)

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
