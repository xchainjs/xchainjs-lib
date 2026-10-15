import AppBtc from '@ledgerhq/hw-app-btc'
import type { Transaction } from '@ledgerhq/hw-app-btc/lib/types'
import { FeeOption, FeeRate, TxHash, checkFeeBounds } from '@xchainjs/xchain-client'
import { Address } from '@xchainjs/xchain-util'
import { TxParams, UTXO, UtxoClientParams, UtxoSelectionPreferences } from '@xchainjs/xchain-utxo'

import { Client } from './client'

class ClientLedger extends Client {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private transport: any // TODO: Parametrize
  private app: AppBtc | undefined

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(params: UtxoClientParams & { transport: any }) {
    super(params)
    this.transport = params.transport
  }

  public async getApp(): Promise<AppBtc> {
    if (this.app) {
      return this.app
    }
    this.app = new AppBtc({ transport: this.transport, currency: 'bitcoin_cash' })
    return this.app
  }

  getAddress(): string {
    throw Error('Sync method not supported for Ledger')
  }

  async getAddressAsync(index = 0, verify = false): Promise<Address> {
    const app = await this.getApp()
    const result = await app.getWalletPublicKey(this.getFullDerivationPath(index), {
      format: 'cashaddr',
      verify,
    })
    return result.bitcoinAddress
  }

  async transfer(
    params: TxParams & {
      feeRate?: FeeRate
      utxoSelectionPreferences?: UtxoSelectionPreferences
      selectedUtxos?: UTXO[]
    },
  ): Promise<TxHash> {
    const app = await this.getApp()
    const fromAddressIndex = params?.walletIndex || 0
    const feeRate = params.feeRate || (await this.getFeeRates())[FeeOption.Fast]
    checkFeeBounds(this.feeBounds, feeRate)
    const sender = await this.getAddressAsync(fromAddressIndex)

    const defaults = {
      minimizeFee: true,
      avoidDust: true,
      minimizeInputs: false,
    }
    const mergedUtxoSelectionPreferences = {
      ...defaults,
      ...params.utxoSelectionPreferences,
    }

    const { rawUnsignedTx, inputs } = await this.prepareTxEnhanced({
      ...params,
      sender,
      feeRate,
      utxoSelectionPreferences: mergedUtxoSelectionPreferences,
    })

    const ledgerInputs: Array<[Transaction, number, string | null, number | null]> = inputs.map(
      ({ txHex, hash, index }) => {
        if (!txHex) {
          throw Error(`Missing 'txHex' for UTXO (txHash ${hash})`)
        }
        const splittedTx = app.splitTransaction(txHex, false)
        return [splittedTx, index, null, null]
      },
    )
    const associatedKeysets = ledgerInputs.map(() => this.getFullDerivationPath(fromAddressIndex))
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

    if (!txHash) {
      throw Error('No Tx hash')
    }

    return txHash
  }

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

    const ledgerInputs: Array<[Transaction, number, string | null, number | null]> = inputs.map(
      ({ txHex, hash, index }) => {
        if (!txHex) {
          throw Error(`Missing 'txHex' for UTXO (txHash ${hash})`)
        }
        const splittedTx = app.splitTransaction(txHex, false)
        return [splittedTx, index, null, null]
      },
    )

    const associatedKeysets = ledgerInputs.map(() => this.getFullDerivationPath(fromAddressIndex))
    const newTx: Transaction = app.splitTransaction(rawUnsignedTx)
    const outputScriptHex = app.serializeTransactionOutputs(newTx).toString('hex')
    const txHex = await app.createPaymentTransaction({
      inputs: ledgerInputs,
      associatedKeysets,
      outputScriptHex,
      additionals: ['abc'],
      sigHashType: 0x41,
    })

    const hash = await this.broadcastTx(txHex)
    if (!hash) {
      throw Error('No Tx hash')
    }

    return { hash, maxAmount, fee }
  }
}

export { ClientLedger }
