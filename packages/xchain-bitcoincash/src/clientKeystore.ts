import bitcore from 'bitcore-lib-cash'
import { FeeOption, FeeRate, TxHash, checkFeeBounds } from '@xchainjs/xchain-client'
import { getSeed } from '@xchainjs/xchain-crypto'
import { Address } from '@xchainjs/xchain-util'
import { TxParams, UTXO, UtxoSelectionPreferences } from '@xchainjs/xchain-utxo'

import { Client } from './client'
import * as Utils from './utils'
import { HDKey } from '@scure/bip32'

class ClientKeystore extends Client {
  /**
   * @deprecated This function eventually will be removed. Use getAddressAsync instead.
   */
  getAddress(index = 0): Address {
    if (index < 0) {
      throw new Error('index must be greater than zero')
    }

    if (this.phrase) {
      const bchKeys = this.getBCHKeys(this.phrase, this.getFullDerivationPath(index))

      const address = bchKeys.toAddress().toString()

      if (!address) {
        throw new Error('Address not defined')
      }

      return Utils.stripPrefix(Utils.toCashAddress(address))
    }

    throw new Error('Phrase must be provided')
  }

  async getAddressAsync(index = 0): Promise<string> {
    return this.getAddress(index)
  }

  private getBCHKeys(phrase: string, derivationPath: string) {
    const rootSeed = getSeed(phrase)
    const root = HDKey.fromMasterSeed(Uint8Array.from(rootSeed))
    const child = root.derive(derivationPath)

    if (!child.privateKey) {
      throw new Error('Invalid derived private key')
    }

    const privateKey = new bitcore.PrivateKey(
      Buffer.from(child.privateKey).toString('hex'),
      Utils.bchNetwork(this.network),
    )

    return privateKey
  }

  async transfer(
    params: TxParams & {
      feeRate?: FeeRate
      utxoSelectionPreferences?: UtxoSelectionPreferences
      selectedUtxos?: UTXO[]
    },
  ): Promise<TxHash> {
    const feeRate = params.feeRate || (await this.getFeeRates())[FeeOption.Fast]
    checkFeeBounds(this.feeBounds, feeRate)

    const fromAddressIndex = params.walletIndex || 0

    const mergedPreferences: UtxoSelectionPreferences = {
      minimizeFee: true,
      avoidDust: true,
      minimizeInputs: false,
      ...params.utxoSelectionPreferences,
    }

    const { rawUnsignedTx, inputs } = await this.prepareTxEnhanced({
      ...params,
      feeRate,
      sender: await this.getAddressAsync(fromAddressIndex),
      utxoSelectionPreferences: mergedPreferences,
      selectedUtxos: params.selectedUtxos,
    })

    const derivationPath = this.getFullDerivationPath(fromAddressIndex)
    const privateKey = this.getBCHKeys(this.phrase, derivationPath)

    const unsignedTx = new bitcore.Transaction(rawUnsignedTx)

    // Inputs must be rebuilt with the UTXO value and script before bitcore will sign.
    const tx = new bitcore.Transaction()

    const sender = await this.getAddressAsync(fromAddressIndex)

    tx.from(
      inputs.map(
        (input) =>
          new bitcore.Transaction.UnspentOutput({
            txId: input.hash,
            outputIndex: input.index,
            address: sender,
            script: bitcore.Script.fromHex(input.witnessUtxo?.script.toString('hex') || ''),
            satoshis: input.value,
          }),
      ),
    )

    unsignedTx.outputs.forEach((out) => {
      tx.addOutput(
        new bitcore.Transaction.Output({
          script: out.script,
          satoshis: out.satoshis,
        }),
      )
    })

    tx.sign(privateKey)

    // ESLint disabled: Bitcoin transaction has proper toString() method that returns hex string
    // Left as-is during ESLint 8 upgrade as this core crypto functionality is tested and working
    // eslint-disable-next-line @typescript-eslint/no-base-to-string
    const txHex = tx.toString()

    return await this.roundRobinBroadcastTx(txHex)
  }

  async transferMax(params: {
    recipient: Address
    memo?: string
    feeRate?: FeeRate
    walletIndex?: number
    utxoSelectionPreferences?: UtxoSelectionPreferences
    selectedUtxos?: UTXO[]
  }): Promise<{ hash: TxHash; maxAmount: number; fee: number }> {
    const feeRate = params.feeRate || (await this.getFeeRates())[FeeOption.Fast]
    checkFeeBounds(this.feeBounds, feeRate)

    const fromAddressIndex = params.walletIndex || 0
    const sender = await this.getAddressAsync(fromAddressIndex)

    const { rawUnsignedTx, inputs, maxAmount, fee } = await this.prepareMaxTx({
      sender,
      recipient: params.recipient,
      memo: params.memo,
      feeRate,
      utxoSelectionPreferences: params.utxoSelectionPreferences,
      selectedUtxos: params.selectedUtxos,
    })

    const derivationPath = this.getFullDerivationPath(fromAddressIndex)
    const privateKey = this.getBCHKeys(this.phrase, derivationPath)

    const unsignedTx = new bitcore.Transaction(rawUnsignedTx)

    // Inputs must be rebuilt with the UTXO value and script before bitcore will sign.
    const tx = new bitcore.Transaction()

    tx.from(
      inputs.map(
        (input) =>
          new bitcore.Transaction.UnspentOutput({
            txId: input.hash,
            outputIndex: input.index,
            address: sender,
            script: bitcore.Script.fromHex(input.witnessUtxo?.script.toString('hex') || ''),
            satoshis: input.value,
          }),
      ),
    )

    unsignedTx.outputs.forEach((out) => {
      tx.addOutput(
        new bitcore.Transaction.Output({
          script: out.script,
          satoshis: out.satoshis,
        }),
      )
    })

    tx.sign(privateKey)

    // eslint-disable-next-line @typescript-eslint/no-base-to-string
    const txHex = tx.toString()
    const hash = await this.roundRobinBroadcastTx(txHex)

    return { hash, maxAmount, fee }
  }
}

export { ClientKeystore }
