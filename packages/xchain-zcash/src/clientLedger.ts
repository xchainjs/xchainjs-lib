import AppBtc from '@ledgerhq/hw-app-btc'
import { buildTx } from '@mayaprotocol/zcash-js'
import { TxHash, checkFeeBounds } from '@xchainjs/xchain-client'
import { Address } from '@xchainjs/xchain-util'
import { TxParams, UtxoClientParams } from '@xchainjs/xchain-utxo'
import { Client } from './client'

/**
 * Custom Ledger Zcash client
 */
class ClientLedger extends Client {
  // Reference to the Ledger transport object
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private transport: any
  private app: AppBtc | undefined

  // Constructor
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(params: UtxoClientParams & { transport: any }) {
    super(params)
    this.transport = params.transport
  }

  // Get the Ledger BTC application instance configured for Zcash
  public async getApp(): Promise<AppBtc> {
    if (this.app) {
      return this.app
    }
    this.app = new AppBtc({ transport: this.transport, currency: 'zcash' })
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

  // Transfer ZEC from Ledger
  async transfer(params: TxParams): Promise<TxHash> {
    const fromAddressIndex = params?.walletIndex || 0

    // Get sender address
    const sender = await this.getAddressAsync(fromAddressIndex)

    // Prepare transaction using base client method (handles flat fee)
    const { rawUnsignedTx } = await this.prepareTx({
      ...params,
      sender,
      feeRate: 0, // Ignored for Zcash
    })

    // Parse the transaction data
    const txData = JSON.parse(rawUnsignedTx)

    // Build the actual transaction for signing
    const tx = await buildTx(
      txData.height,
      txData.from,
      txData.to,
      txData.amount,
      txData.utxos,
      txData.isMainnet,
      txData.memo,
    )

    // Check fee bounds (already done in prepareTx but double-check)
    checkFeeBounds(this.feeBounds, tx.fee)

    // LIMITATION: Zcash Ledger transaction signing requires raw transaction hex data
    // for previous transactions (UTXOs), but Zcash data providers only return
    // parsed transaction objects without the raw hex.
    //
    // This is different from Bitcoin where the prepareTx method fetches and includes
    // the raw transaction hex (txHex field) for each UTXO.
    //
    // To fully implement Zcash Ledger signing, we would need:
    // 1. A Zcash data provider that returns raw transaction hex
    // 2. Or use the dedicated Zcash Ledger app instead of Bitcoin app
    // 3. Or implement a custom serialization from the transaction object

    throw new Error(
      'Zcash Ledger transfers require raw transaction data that is not available from current data providers. ' +
        'The transaction has been built successfully with fee: ' +
        tx.fee +
        ' zatoshis. ' +
        'To complete Ledger signing, either:\n' +
        '1. Use the keystore client for transfers, or\n' +
        '2. Use the dedicated Zcash Ledger app, or\n' +
        '3. Implement a data provider that returns raw transaction hex',
    )
  }
}

export { ClientLedger }
