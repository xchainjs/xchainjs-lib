import AppBtc from '@ledgerhq/hw-app-btc'
import { Transaction } from '@ledgerhq/hw-app-btc/lib/types'
import { FeeOption, FeeRate, TxHash, TxParams, UTXO, UtxoClientParams } from '@xchainjs/xchain-client'
import { Address } from '@xchainjs/xchain-util'
import * as Bitcoin from 'bitcoinjs-lib'

import { Client } from './client'

/**
 * Custom Ledger Bitcoin client
 */
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
    this.app = new AppBtc({ transport: this.transport })
    return this.app
  }

  getAddress(): string {
    throw Error('Sync method not supported for Ledger')
  }

  async getAddressAsync(index = 0): Promise<Address> {
    const app = await this.getApp()
    const result = await app.getWalletPublicKey(this.getFullDerivationPath(index), {
      format: 'bech32',
      verify: false,
    })
    return result.bitcoinAddress
  }

  async transfer(params: TxParams & { feeRate?: FeeRate }): Promise<TxHash> {
    const app = await this.getApp()
    const fromAddressIndex = params?.walletIndex || 0

    const feeRate = params.feeRate || (await this.getFeeRates())[FeeOption.Fast]
    const sender = await this.getAddressAsync(fromAddressIndex)
    const { rawUnsignedTx, utxos } = await this.prepareTx({ ...params, sender, feeRate })
    const psbt = Bitcoin.Psbt.fromBase64(rawUnsignedTx)

    const ledgerInputs: [Transaction, number, string | null, number | null][] = (utxos as UTXO[]).map(
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

    const txHash = await this.broadcastTx(txHex)

    if (!txHash) {
      throw Error('No Tx hash')
    }

    return txHash
  }
}

export { ClientLedger }
