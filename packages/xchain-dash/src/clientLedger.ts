import * as dashcore from '@dashevo/dashcore-lib'
import AppBtc from '@ledgerhq/hw-app-btc'
import { Transaction as LedgerTransaction } from '@ledgerhq/hw-app-btc/lib/types'
import { FeeOption, FeeRate, TxHash, TxParams } from '@xchainjs/xchain-client'
import * as nodeApi from '@xchainjs/xchain-dash/src/node-api'
import { Address } from '@xchainjs/xchain-util'
import { UtxoClientParams } from '@xchainjs/xchain-utxo'

import { Client } from './client'
import { getRawTx } from './insight-api'
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

    const tx = new dashcore.Transaction(rawUnsignedTx)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any

    const ledgerInputs: [LedgerTransaction, number, string | null, number | null][] = []

    for (const input of tx.inputs) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const insightUtxo = utxos.find((utxo) => {
        return utxo.hash === input.prevTxId.toString('hex') && utxo.index == input.outputIndex
      })
      if (!insightUtxo) {
        throw new Error('Unable to match accumulative inputs with insight utxos')
      }
      const txHex = await getRawTx({ txid: insightUtxo.hash, network: this.network })
      const utxoTx = new dashcore.Transaction(txHex)
      const splittedTx = app.splitTransaction(utxoTx.toString())
      ledgerInputs.push([splittedTx, input.outputIndex, null, null])
    }

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
      segwit: false,
      useTrustedInputForSegwit: false,
      additionals: [],
    })

    // Broadcast transaction
    const txHash = await nodeApi.broadcastTx({
      txHex,
      nodeUrl: this.nodeUrls[this.network],
      auth: this.nodeAuth,
    })
    // Throw error if no transaction hash is received
    if (!txHash) {
      throw Error('No Tx hash')
    }

    return txHash
  }
}

export { ClientLedger }
