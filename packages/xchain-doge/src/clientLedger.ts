import AppBtc from '@ledgerhq/hw-app-btc'
import type { Transaction } from '@ledgerhq/hw-app-btc/lib/types'
import { FeeOption, FeeRate, TxHash, checkFeeBounds } from '@xchainjs/xchain-client'
import { Address } from '@xchainjs/xchain-util'
import { TxParams, UTXO, UtxoClientParams, UtxoSelectionPreferences } from '@xchainjs/xchain-utxo'
import * as Dogecoin from 'bitcoinjs-lib'

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
    this.app = new AppBtc({ transport: this.transport, currency: 'dogecoin' })
    return this.app
  }

  getAddress(): string {
    throw Error('Sync method not supported for Ledger')
  }

  async getAddressAsync(index = 0, verify = false): Promise<Address> {
    const app = await this.getApp()
    const result = await app.getWalletPublicKey(this.getFullDerivationPath(index), {
      format: 'legacy',
      verify,
    })
    return result.bitcoinAddress
  }

  async transfer(params: TxParams & { feeRate?: FeeRate }): Promise<TxHash> {
    const app = await this.getApp()
    const fromAddressIndex = params?.walletIndex || 0
    const feeRate = params.feeRate || (await this.getFeeRates())[FeeOption.Fast]
    checkFeeBounds(this.feeBounds, feeRate)
    const sender = await this.getAddressAsync(fromAddressIndex)
    const { rawUnsignedTx, inputs } = await this.prepareTx({ ...params, sender, feeRate })
    const psbt = Dogecoin.Psbt.fromBase64(rawUnsignedTx)
    const ledgerInputs: Array<[Transaction, number, string | null, number | null]> = inputs.map(
      ({ txHex, hash, index }) => {
        if (!txHex) {
          throw Error(`Missing 'txHex' for UTXO (txHash ${hash})`)
        }
        const splittedTx = app.splitTransaction(txHex, false /* no segwit support */)
        return [splittedTx, index, null, null]
      },
    )

    const associatedKeysets = ledgerInputs.map(() => this.getFullDerivationPath(fromAddressIndex))
    const unsignedHex = psbt.data.globalMap.unsignedTx.toBuffer().toString('hex')
    const newTx = app.splitTransaction(unsignedHex, true)
    const outputScriptHex = app.serializeTransactionOutputs(newTx).toString('hex')
    const txHex = await app.createPaymentTransaction({
      inputs: ledgerInputs,
      associatedKeysets,
      outputScriptHex,
      // no additionals - similar to https://github.com/shapeshift/hdwallet/blob/a61234eb83081a4de54750b8965b873b15803a03/packages/hdwallet-ledger/src/bitcoin.ts#L222
      additionals: [],
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

    const psbt = Dogecoin.Psbt.fromBase64(rawUnsignedTx)
    const ledgerInputs: Array<[Transaction, number, string | null, number | null]> = inputs.map(
      ({ txHex, hash, index }) => {
        if (!txHex) {
          throw Error(`Missing 'txHex' for UTXO (txHash ${hash})`)
        }
        const splittedTx = app.splitTransaction(txHex, false /* no segwit support */)
        return [splittedTx, index, null, null]
      },
    )

    const associatedKeysets = ledgerInputs.map(() => this.getFullDerivationPath(fromAddressIndex))
    const unsignedHex = psbt.data.globalMap.unsignedTx.toBuffer().toString('hex')
    const newTx = app.splitTransaction(unsignedHex, true)
    const outputScriptHex = app.serializeTransactionOutputs(newTx).toString('hex')
    const txHex = await app.createPaymentTransaction({
      inputs: ledgerInputs,
      associatedKeysets,
      outputScriptHex,
      additionals: [],
    })

    const hash = await this.broadcastTx(txHex)
    if (!hash) {
      throw Error('No Tx hash')
    }

    return { hash, maxAmount, fee }
  }
}
export { ClientLedger }
