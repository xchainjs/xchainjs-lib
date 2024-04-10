import { BTCSignTxKK, bip32ToAddressNList } from '@keepkey/hdwallet-core'
import { KeepKeyHDWallet, create as createKeepKeyWallet } from '@shapeshiftoss/hdwallet-keepkey'
import { FeeOption, FeeRate, TxHash, TxParams } from '@xchainjs/xchain-client'
import { Address } from '@xchainjs/xchain-util'
import { UtxoClientParams } from '@xchainjs/xchain-utxo'

import { Client, defaultBTCParams } from './client'

/**
 * Custom Ledger Bitcoin client
 */
class ClientKeepKey extends Client {
  // Reference to the Ledger transport object
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private transport: any // TODO: Parametrize
  private app: KeepKeyHDWallet | undefined

  // Constructor
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(params: UtxoClientParams & { transport: any }) {
    super(params)
    this.transport = params.transport
  }

  // Get the KeepKey BTC app instance
  public async getApp(): Promise<KeepKeyHDWallet> {
    if (this.app) {
      return this.app
    }
    this.app = createKeepKeyWallet(this.transport)
    return this.app
  }

  // Get the current address synchronously
  getAddress(): string {
    throw Error('Sync method not supported for Ledger')
  }

  // Get the current address asynchronously
  async getAddressAsync(index = 0, verify = false): Promise<Address> {
    const path = `${defaultBTCParams.rootDerivationPaths}${index}` // not sure..
    const msg = {
      addressNList: bip32ToAddressNList(path),
      showDisplay: verify,
      coin: 'Bitcoin',
    }
    const app = await this.getApp()
    const address = await app.btcGetAddress(msg)
    if (!address) {
      throw new Error('Failed to retrieve address from KeepKey')
    }
    return address
  }

  // Transfer BTC from KeepKey
  async transfer(params: TxParams & { feeRate?: FeeRate }): Promise<TxHash> {
    const app = await this.getApp()
    const fromAddressIndex = params?.walletIndex || 0
    // Get fee rate
    const feeRate = params.feeRate || (await this.getFeeRates())[FeeOption.Fast]
    // Get sender address
    const sender = await this.getAddressAsync(fromAddressIndex)
    // Prepare transaction
    const { rawUnsignedTx, utxos } = await this.prepareTx({ ...params, sender, feeRate })

    // not sure here either

    // const inputs: BTCSignTxInputKK[] = utxos.map((utxo) => {
    //   const baseInput: BTCSignTxInputKK = {
    //     txid: utxo.txid,
    //     amount: utxo.amount.toString(),
    //   }
    // })

    // Create the BTCSignTxKK message
    const msg: BTCSignTxKK = {
      coin: 'Bitcoin',
      inputs: [], // inputs
      outputs: [],
    }
    // sign
    const signedTx = await app.btcSignTx(msg)
    if (!signedTx) {
      throw new Error('Failed to sign transaction with KeepKey')
    }
    // Broadcast
    const txHash = await this.broadcastTx(signedTx.serializedTx)
    if (!txHash) {
      throw new Error('Failed to broadcast transaction')
    }

    return txHash
  }
}

export { ClientKeepKey }
