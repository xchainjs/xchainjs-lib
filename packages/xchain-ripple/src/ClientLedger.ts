import AppXrp from '@ledgerhq/hw-app-xrp'
import { FeeRate, TxHash, TxParams } from '@xchainjs/xchain-client'
import { Address } from '@xchainjs/xchain-util'
import { encode, type Payment } from 'xrpl'

import { Client } from './client'
import { SignedTransaction, XRPClientParams, XRPTxParams } from './types'

class ClientLedger extends Client {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private transport: any
  private app: AppXrp | undefined

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(params: XRPClientParams & { transport: any }) {
    super(params)
    this.transport = params.transport
  }

  public async getApp(): Promise<AppXrp> {
    if (this.app) {
      return this.app
    }
    this.app = new AppXrp(this.transport)
    return this.app
  }

  getAddress(): string {
    throw Error('Sync method not supported for Ledger')
  }

  async getAddressAsync(index = 0, verify = false): Promise<Address> {
    const app = await this.getApp()
    const derivationPath = this.getFullDerivationPath(index)
    const result = await app.getAddress(derivationPath, verify)
    return result.address
  }

  async signTransaction(payment: Payment, walletIndex: number): Promise<SignedTransaction> {
    const app = await this.getApp()

    const derivationPath = this.getFullDerivationPath(walletIndex)

    const addressInfo = await app.getAddress(derivationPath, false)

    // SigningPubKey must be set before encode.
    const preparedTx = {
      ...payment,
      SigningPubKey: addressInfo.publicKey.toUpperCase(),
    }

    const txBlob = encode(preparedTx)

    const signature = await app.signTransaction(derivationPath, txBlob)

    if (!signature) {
      throw new Error('No signature received from Ledger device')
    }

    const signedTx = {
      ...preparedTx,
      TxnSignature: signature.toUpperCase(),
    } as Payment

    return { tx_blob: encode(signedTx) }
  }

  async transfer(params: TxParams & XRPTxParams & { feeRate?: FeeRate }): Promise<TxHash> {
    const fromAddressIndex = params?.walletIndex || 0

    const sender = await this.getAddressAsync(fromAddressIndex)

    const xrplClient = await this.getXrplClient()

    const baseTx: Payment = {
      TransactionType: 'Payment',
      Account: sender,
      Destination: params.recipient,
      Amount: params.amount.amount().toString(),
    }

    if (params.destinationTag !== undefined) {
      baseTx.DestinationTag = params.destinationTag
    }

    if (params.memo) {
      baseTx.Memos = [
        {
          Memo: {
            MemoData: Buffer.from(params.memo, 'utf8').toString('hex').toUpperCase(),
          },
        },
      ]
    }

    const autofilledTx = await xrplClient.autofill(baseTx)

    // Ledger signs only these fields.
    const ledgerTx: Record<string, unknown> = {
      TransactionType: 'Payment',
      Account: sender,
      Destination: params.recipient,
      Amount: params.amount.amount().toString(),
      Fee: autofilledTx.Fee,
      Sequence: autofilledTx.Sequence,
      LastLedgerSequence: autofilledTx.LastLedgerSequence,
    }

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
