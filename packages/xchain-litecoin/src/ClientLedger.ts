import AppBtc from '@ledgerhq/hw-app-btc'
import type { Transaction } from '@ledgerhq/hw-app-btc/lib/types'
import { FeeOption, FeeRate, TxHash, checkFeeBounds } from '@xchainjs/xchain-client'
import { Address } from '@xchainjs/xchain-util'
import { TxParams, UTXO, UtxoClientParams, UtxoSelectionPreferences } from '@xchainjs/xchain-utxo'
import * as Litecoin from 'bitcoinjs-lib'

import { Client, NodeUrls } from './client'
import { NodeAuth } from './types'

/**
 * Custom Ledger Litecoin client
 */
class ClientLedger extends Client {
  // Reference to the Ledger transport object
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private transport: any // TODO: Parametrize
  private app: AppBtc | undefined

  // Constructor
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(params: UtxoClientParams & { transport: any; nodeUrls: NodeUrls; nodeAuth?: NodeAuth }) {
    super(params)
    this.transport = params.transport
  }

  // Get the Ledger BTC application instance
  public async getApp(): Promise<AppBtc> {
    if (this.app) {
      return this.app
    }
    this.app = new AppBtc({ transport: this.transport, currency: 'litecoin' })
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
      format: 'bech32',
      verify,
    })
    return result.bitcoinAddress
  }

  // Transfer LTC from Ledger
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
    const psbt = Litecoin.Psbt.fromBase64(rawUnsignedTx)
    // Prepare Ledger inputs
    const ledgerInputs: [Transaction, number, string | null, number | null][] = inputs.map(({ txHex, hash, index }) => {
      if (!txHex) {
        throw Error(`Missing 'txHex' for UTXO (txHash ${hash})`)
      }
      const utxoTx = Litecoin.Transaction.fromHex(txHex)
      const splittedTx = app.splitTransaction(txHex, utxoTx.hasWitnesses())
      return [splittedTx, index, null, null]
    })

    // Prepare associated keysets
    const associatedKeysets = ledgerInputs.map(() => this.getFullDerivationPath(fromAddressIndex))
    // Serialize unsigned transaction
    const unsignedHex = psbt.data.globalMap.unsignedTx.toBuffer().toString('hex')
    const newTx = app.splitTransaction(unsignedHex, true)
    const outputScriptHex = app.serializeTransactionOutputs(newTx).toString('hex')
    // Create payment transaction
    const txHex = await app.createPaymentTransaction({
      inputs: ledgerInputs,
      associatedKeysets,
      outputScriptHex,
      segwit: true,
      useTrustedInputForSegwit: true,
      additionals: ['bech32'],
    })
    // Broadcast transaction
    const txHash = await this.broadcastTx(txHex)
    // Throw error if no transaction hash is received
    if (!txHash) {
      throw Error('No Tx hash')
    }

    return txHash
  }

  // Transfer max LTC from Ledger (sweep transaction)
  async transferMax(params: {
    recipient: Address
    memo?: string
    feeRate?: FeeRate
    walletIndex?: number
    utxoSelectionPreferences?: UtxoSelectionPreferences
    selectedUtxos?: UTXO[]
  }): Promise<{ hash: TxHash; maxAmount: number; fee: number }> {
    const app = await this.getApp()
    const fromAddressIndex = params?.walletIndex || 0
    const feeRate = params.feeRate || (await this.getFeeRates())[FeeOption.Fast]
    checkFeeBounds(this.feeBounds, feeRate)
    const sender = await this.getAddressAsync(fromAddressIndex)

    const { rawUnsignedTx, inputs, maxAmount, fee } = await this.prepareMaxTx({
      sender,
      recipient: params.recipient,
      memo: params.memo,
      feeRate,
      utxoSelectionPreferences: params.utxoSelectionPreferences,
      selectedUtxos: params.selectedUtxos,
    })

    const psbt = Litecoin.Psbt.fromBase64(rawUnsignedTx)
    const ledgerInputs: [Transaction, number, string | null, number | null][] = inputs.map(({ txHex, hash, index }) => {
      if (!txHex) {
        throw Error(`Missing 'txHex' for UTXO (txHash ${hash})`)
      }
      const utxoTx = Litecoin.Transaction.fromHex(txHex)
      const splittedTx = app.splitTransaction(txHex, utxoTx.hasWitnesses())
      return [splittedTx, index, null, null]
    })

    const associatedKeysets = ledgerInputs.map(() => this.getFullDerivationPath(fromAddressIndex))
    const unsignedHex = psbt.data.globalMap.unsignedTx.toBuffer().toString('hex')
    const newTx = app.splitTransaction(unsignedHex, true)
    const outputScriptHex = app.serializeTransactionOutputs(newTx).toString('hex')
    const txHex = await app.createPaymentTransaction({
      inputs: ledgerInputs,
      associatedKeysets,
      outputScriptHex,
      segwit: true,
      useTrustedInputForSegwit: true,
      additionals: ['bech32'],
    })

    const hash = await this.broadcastTx(txHex)
    if (!hash) {
      throw Error('No Tx hash')
    }

    return { hash, maxAmount, fee }
  }
}

export { ClientLedger }
