import { buildTx, getFee, memoToScript } from '@mayaprotocol/zcash-js'
import {
  AssetInfo,
  FeeEstimateOptions,
  FeeRate,
  FeeRates,
  FeeType,
  FeesWithRates,
  Network,
} from '@xchainjs/xchain-client'
import { Address, baseAmount } from '@xchainjs/xchain-util'
import { Client as UTXOClient, PreparedTx, TxParams, UTXO, UtxoClientParams } from '@xchainjs/xchain-utxo'

import {
  AssetZEC,
  LOWER_FEE_BOUND,
  NownodesProviders,
  UPPER_FEE_BOUND,
  ZECChain,
  ZEC_DECIMAL,
  zcashExplorerProviders,
} from './const'
import * as Utils from './utils'

// Default parameters for the Zcash client
export const defaultZECParams: UtxoClientParams = {
  network: Network.Mainnet,
  phrase: '',
  explorerProviders: zcashExplorerProviders,
  dataProviders: [NownodesProviders],
  rootDerivationPaths: {
    [Network.Mainnet]: `m/44'/133'/0'/0/`,
    [Network.Testnet]: `m/44'/1'/0'/0/`,
    [Network.Stagenet]: `m/44'/133'/0'/0/`,
  },
  feeBounds: {
    lower: LOWER_FEE_BOUND,
    upper: UPPER_FEE_BOUND,
  },
}
/**
 * Custom Zcash client (only support t-addresses)
 */
abstract class Client extends UTXOClient {
  /**
   * Constructor
   * Initializes the client with network type and other parameters.
   * @param {UtxoClientParams} params
   */
  constructor(
    params: UtxoClientParams = {
      ...defaultZECParams,
    },
  ) {
    super(ZECChain, {
      network: params.network,
      rootDerivationPaths: params.rootDerivationPaths,
      phrase: params.phrase,
      feeBounds: params.feeBounds,
      explorerProviders: params.explorerProviders,
      dataProviders: params.dataProviders,
    })
  }

  /**
   * Get ZEC asset info.
   * @returns {AssetInfo} ZEC asset information.
   */
  getAssetInfo(): AssetInfo {
    const assetInfo: AssetInfo = {
      asset: AssetZEC,
      decimal: ZEC_DECIMAL,
    }
    return assetInfo
  }

  /**
   * Validate the given Zcash address.
   * @param {string} address Zcash address to validate (only t-addresses).
   * @returns {boolean} `true` if the address is valid, `false` otherwise.
   */
  validateAddress(address: string): boolean {
    return Utils.validateAddress(address, this.network)
  }

  /**
   * Compile memo into a buffer.
   * @param {string} memo Memo to compile.
   * @returns {Buffer} Compiled memo.
   */
  protected compileMemo(memo: string): Buffer {
    return memoToScript(memo)
  }

  /**
   * Get transaction fee from UTXOs.
   * @param {UTXO[]} inputs UTXOs to calculate fee from.
   * @param {FeeRate} feeRate Fee rate.
   * @param {Buffer | null} data Compiled memo (Optional).
   * @returns {number} Transaction fee.
   */
  protected getFeeFromUtxos(inputs: UTXO[], feeRate: FeeRate, _data: Buffer | null = null): number {
    if (feeRate) {
      throw 'No feerate supported for this client'
    }
    return getFee(inputs.length, 2, _data ? 'memo' : undefined)
  }

  /**
   * Prepare transfer.
   *
   * @param {TxParams&Address&FeeRate&boolean} params The transfer options.
   * @returns {PreparedTx} The raw unsigned transaction.
   */
  async prepareTx({
    sender,
    memo,
    amount,
    recipient,
    feeRate: _feeRate, // Ignored: Zcash uses flat fees
    spendPendingUTXO = true,
  }: TxParams & {
    sender: Address
    feeRate: FeeRate
    spendPendingUTXO?: boolean
  }): Promise<PreparedTx> {
    // Validate recipient address
    if (!this.validateAddress(recipient)) {
      throw new Error('Invalid recipient address')
    }

    // Get UTXOs for sender
    const utxos = await this.scanUTXOs(sender, spendPendingUTXO)
    if (utxos.length === 0) {
      throw new Error('No UTXOs available for transaction')
    }

    // Convert UTXOs to zcash-js format
    const zcashUtxos = utxos.map((utxo) => ({
      address: sender,
      txid: utxo.hash,
      outputIndex: utxo.index,
      satoshis: utxo.value,
    }))

    // Build unsigned transaction
    const unsignedTx = await buildTx(
      0, // height - can be 0 for prepared tx
      sender,
      recipient,
      amount.amount().toNumber(),
      zcashUtxos,
      this.network === Network.Testnet ? false : true,
      memo,
    )

    // For Zcash, we return the transaction data as JSON string
    // since zcash-js doesn't produce a standard raw transaction format
    const rawUnsignedTx = JSON.stringify({
      height: 0,
      from: sender,
      to: recipient,
      amount: amount.amount().toNumber(),
      utxos: zcashUtxos,
      isMainnet: this.network === Network.Testnet ? false : true,
      memo,
      fee: unsignedTx.fee,
    })

    return {
      rawUnsignedTx,
      utxos,
      inputs: utxos, // All UTXOs are potential inputs
    }
  }

  async getFeesWithRates(): Promise<FeesWithRates> {
    throw Error('Error Zcash has flat fee. Fee rates not supported')
  }

  async getFeeRates(): Promise<FeeRates> {
    throw Error('Error Zcash has flat fee. Fee rates not supported')
  }

  async getFees(options?: FeeEstimateOptions) {
    let utxoNumber = 2 // By default pro rought estimation to display on interface
    if (options?.sender) {
      const utxo = await this.scanUTXOs(options?.sender, false)
      utxoNumber = utxo.length // Max possible fee for interface display
    }
    const flatFee = getFee(utxoNumber, 2, options?.memo)
    return {
      average: baseAmount(flatFee, ZEC_DECIMAL),
      fast: baseAmount(flatFee, ZEC_DECIMAL),
      fastest: baseAmount(flatFee, ZEC_DECIMAL),
      type: FeeType.FlatFee,
    }
  }
}

export { Client }
