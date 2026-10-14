import AppBtc from '@ledgerhq/hw-app-btc'
import type { Transaction } from '@ledgerhq/hw-app-btc/lib/types'
import { FeeOption, FeeRate, TxHash, checkFeeBounds } from '@xchainjs/xchain-client'
import { Address } from '@xchainjs/xchain-util'
import { TxParams, UTXO, UtxoClientParams, UtxoSelectionPreferences } from '@xchainjs/xchain-utxo'
import * as Bitcoin from 'bitcoinjs-lib'

import { Client } from './client'
import { AddressFormat } from './types'

class ClientLedger extends Client {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private transport: any // TODO: Parametrize
  private app: AppBtc | undefined

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(params: UtxoClientParams & { transport: any; addressFormat?: AddressFormat }) {
    super(params)
    this.transport = params.transport
  }

  public async getApp(): Promise<AppBtc> {
    if (this.app) {
      return this.app
    }
    this.app = new AppBtc({ transport: this.transport })
    return this.app
  }

  getAddress(): string {
    throw Error('Sync method not supported for Ledger')
  }

  private get ledgerFormat(): 'bech32' | 'bech32m' | 'legacy' | 'p2sh' {
    switch (this.addressFormat) {
      case AddressFormat.P2TR:
        return 'bech32m'
      case AddressFormat.P2PKH:
        return 'legacy'
      case AddressFormat.P2SH_P2WPKH:
        return 'p2sh'
      default:
        return 'bech32'
    }
  }

  // Whether the configured format spends segwit inputs (everything except legacy P2PKH)
  private get isSegwit(): boolean {
    return this.addressFormat !== AddressFormat.P2PKH
  }

  // `additionals` flags for createPaymentTransaction. Native segwit needs the bech32 flag,
  // taproot bech32m; legacy P2PKH and wrapped segwit (P2SH-P2WPKH) need none.
  private get ledgerAdditionals(): string[] {
    switch (this.addressFormat) {
      case AddressFormat.P2WPKH:
        return ['bech32']
      case AddressFormat.P2TR:
        return ['bech32m']
      default:
        return []
    }
  }

  async getAddressAsync(index = 0, verify = false): Promise<Address> {
    const app = await this.getApp()
    const result = await app.getWalletPublicKey(this.getFullDerivationPath(index), {
      format: this.ledgerFormat,
      verify,
    })
    return result.bitcoinAddress
  }

  async transfer(
    params: TxParams & { feeRate?: FeeRate; utxoSelectionPreferences?: UtxoSelectionPreferences },
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
    const psbt = Bitcoin.Psbt.fromBase64(rawUnsignedTx)
    const ledgerInputs: [Transaction, number, string | null, number | null][] = (inputs as UTXO[]).map(
      ({ txHex, hash, index }) => {
        if (!txHex) {
          throw Error(`Missing 'txHex' for UTXO (txHash ${hash})`)
        }
        const utxoTx = Bitcoin.Transaction.fromHex(txHex)
        const splittedTx = app.splitTransaction(txHex, utxoTx.hasWitnesses())
        return [splittedTx, index, null, null]
      },
    )

    const associatedKeysets = ledgerInputs.map(() => this.getFullDerivationPath(fromAddressIndex))
    const unsignedHex = psbt.data.globalMap.unsignedTx.toBuffer().toString('hex')
    const newTx = app.splitTransaction(unsignedHex, this.isSegwit)
    const outputScriptHex = app.serializeTransactionOutputs(newTx).toString('hex')
    const txHex = await app.createPaymentTransaction({
      inputs: ledgerInputs,
      associatedKeysets,
      outputScriptHex,
      segwit: this.isSegwit,
      useTrustedInputForSegwit: this.isSegwit,
      additionals: this.ledgerAdditionals,
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

    const psbt = Bitcoin.Psbt.fromBase64(rawUnsignedTx)
    const ledgerInputs: [Transaction, number, string | null, number | null][] = (inputs as UTXO[]).map(
      ({ txHex, hash, index }) => {
        if (!txHex) {
          throw Error(`Missing 'txHex' for UTXO (txHash ${hash})`)
        }
        const utxoTx = Bitcoin.Transaction.fromHex(txHex)
        const splittedTx = app.splitTransaction(txHex, utxoTx.hasWitnesses())
        return [splittedTx, index, null, null]
      },
    )

    const associatedKeysets = ledgerInputs.map(() => this.getFullDerivationPath(fromAddressIndex))
    const unsignedHex = psbt.data.globalMap.unsignedTx.toBuffer().toString('hex')
    const newTx = app.splitTransaction(unsignedHex, this.isSegwit)
    const outputScriptHex = app.serializeTransactionOutputs(newTx).toString('hex')
    const txHex = await app.createPaymentTransaction({
      inputs: ledgerInputs,
      associatedKeysets,
      outputScriptHex,
      segwit: this.isSegwit,
      useTrustedInputForSegwit: this.isSegwit,
      additionals: this.ledgerAdditionals,
    })

    const hash = await this.broadcastTx(txHex)
    if (!hash) {
      throw Error('No Tx hash')
    }

    return { hash, maxAmount, fee }
  }
}

export { ClientLedger }
