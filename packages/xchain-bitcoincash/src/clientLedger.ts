import AppBtc from '@ledgerhq/hw-app-btc'
import type { Transaction } from '@ledgerhq/hw-app-btc/lib/types'
import * as bitcash from '@psf/bitcoincashjs-lib'
import { FeeOption, FeeRate, TxHash, checkFeeBounds } from '@xchainjs/xchain-client'
import { Address } from '@xchainjs/xchain-util'
import { TxParams, UtxoClientParams } from '@xchainjs/xchain-utxo'

import { Client } from './client'

/**
 * Custom Ledger BitcoinCash client
 */
class ClientLedger extends Client {
  // Reference to the Ledger transport object
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private transport: any // TODO: Parametrize
  private app: AppBtc | undefined

  // Constructor
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(params: UtxoClientParams & { transport: any }) {
    super(params)
    this.transport = params.transport
  }

  // Get the Ledger BTCCash application instance
  public async getApp(): Promise<AppBtc> {
    if (this.app) {
      return this.app
    }
    this.app = new AppBtc({ transport: this.transport, currency: 'bitcoin_cash' })
    return this.app
  }

  // Get the current address synchronously
  getAddress(): string {
    throw Error('Sync method not supported for Ledger')
  }

  // Get the current address asynchronously
  async getAddressAsync(index = 0, verify = false): Promise<Address> {
    const app = await this.getApp()
    const result = await app.getWalletPublicKey(this.getFullDerivationPath(index), {
      format: 'cashaddr',
      verify,
    })
    return result.bitcoinAddress
  }

  // Transfer BTCCash from Ledger
  async transfer(params: TxParams & { feeRate?: FeeRate }): Promise<TxHash> {
    const app = await this.getApp()
    const fromAddressIndex = params?.walletIndex || 0
    // Get fee rate
    const feeRate = params.feeRate || (await this.getFeeRates())[FeeOption.Fast]
    checkFeeBounds(this.feeBounds, feeRate)
    // Get sender address
    const sender = await this.getAddressAsync(fromAddressIndex)
    // Prepare transaction
    const { rawUnsignedTx, inputs } = await this.prepareTx({ ...params, sender, feeRate })

    const ledgerInputs: Array<[Transaction, number, string | null, number | null]> = inputs.map(
      ({ txHex, hash, index }) => {
        if (!txHex) {
          throw Error(`Missing 'txHex' for UTXO (txHash ${hash})`)
        }
        const utxoTx = bitcash.Transaction.fromHex(txHex)
        const splittedTx = app.splitTransaction(txHex, utxoTx.hasWitnesses())
        return [splittedTx, index, null, null]
      },
    )
    // Prepare associated keysets
    const associatedKeysets = ledgerInputs.map(() => this.getFullDerivationPath(fromAddressIndex))
    // Convert the raw unsigned transaction to a Transaction object
    const newTx: Transaction = app.splitTransaction(rawUnsignedTx)
    const outputScriptHex = app.serializeTransactionOutputs(newTx).toString('hex')
    const txHex = await app.createPaymentTransaction({
      inputs: ledgerInputs,
      associatedKeysets,
      outputScriptHex,
      // 'abc' for BCH
      // @see https://github.com/LedgerHQ/ledgerjs/tree/v6.7.0/packages/hw-app-btc#createpaymenttransactionnew
      // Under the hood `hw-app-btc` uses `bip143` then
      // @see https://github.com/LedgerHQ/ledgerjs/blob/90360f1b00a11af4e64a7fc9d980a153ee6f092a/packages/hw-app-btc/src/createTransaction.ts#L120-L123
      additionals: ['abc'],
      sigHashType: 0x41, // If not set, Ledger will throw LEDGER DEVICE: INVALID DATA RECEIVED (0X6A80)
    })

    const txHash = await this.broadcastTx(txHex)

    // Throw error if no transaction hash is received
    if (!txHash) {
      throw Error('No Tx hash')
    }

    return txHash
  }
}

export { ClientLedger }
