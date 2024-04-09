import * as dashcore from '@dashevo/dashcore-lib'
import { Transaction } from '@dashevo/dashcore-lib/typings/transaction/Transaction'
import AppBtc from '@ledgerhq/hw-app-btc'
import { Transaction as LedgerTransaction } from '@ledgerhq/hw-app-btc/lib/types'
import { FeeOption, FeeRate, TxHash, TxParams } from '@xchainjs/xchain-client'
import { Address } from '@xchainjs/xchain-util'
import { UtxoClientParams } from '@xchainjs/xchain-utxo'

import { Client } from './client'
import { NodeAuth, NodeUrls } from './types'

/**
 * Custom Ledger Dash client
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
    this.app = new AppBtc({ transport: this.transport, currency: 'dash' })
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
      format: 'legacy',
      verify,
    })
    return result.bitcoinAddress
  }

  // Transfer DASH from Ledger
  async transfer(params: TxParams & { feeRate?: FeeRate }): Promise<TxHash> {
    const app = await this.getApp()
    const fromAddressIndex = params?.walletIndex || 0
    // Get fee rate
    const feeRate = params.feeRate || (await this.getFeeRates())[FeeOption.Fast]
    // Get sender address
    const sender = await this.getAddressAsync(fromAddressIndex)
    // Prepare transaction
    const { rawUnsignedTx, utxos } = await this.prepareTx({ ...params, sender, feeRate })

    const tx: Transaction = new dashcore.Transaction(rawUnsignedTx)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    tx.inputs.forEach((input: any, index: number) => {
      const insightUtxo = utxos.find((utxo) => {
        return utxo.hash === input.prevTxId.toString('hex') && utxo.index == input.outputIndex
      })
      if (!insightUtxo) {
        throw new Error('Unable to match accumulative inputs with insight utxos')
      }
      const scriptBuffer: Buffer = Buffer.from(insightUtxo.scriptPubKey || '', 'hex')
      const script = new dashcore.Script(scriptBuffer)
      tx.inputs[index] = new dashcore.Transaction.Input.PublicKeyHash({
        prevTxId: Buffer.from(insightUtxo.hash, 'hex'),
        outputIndex: insightUtxo.index,
        script: '',
        output: new dashcore.Transaction.Output({
          satoshis: insightUtxo.value,
          script,
        }),
      })
    })

    const ledgerInputs: [LedgerTransaction, number, string | null, number | null][] = tx.inputs.map((input) => {
      const utxoTx = new Transaction(input)
      const splittedTx = app.splitTransaction(utxoTx.toString())
      return [splittedTx, input.outputIndex, null, null]
    })

    // Prepare associated keysets
    const associatedKeysets = tx.inputs.map(() => this.getFullDerivationPath(fromAddressIndex))
    // Serialize unsigned transaction
    const newTx = app.splitTransaction(tx.toString(), true)
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
}

export { ClientLedger }
