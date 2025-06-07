import * as ZcashLib from '@mayaprotocol/zcash-ts'
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
    return ZcashLib.createMemoScript(memo)
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
    const memoLength = _data ? _data.length : 0
    return ZcashLib.calculateFee(inputs.length, 2, memoLength)
  }

  /**
   * Build transaction using TransactionBuilder
   *
   * @param {TxParams} params The transfer options.
   * @returns {Promise<PreparedTx>} The prepared transaction data.
   */
  async buildTx({
    amount,
    recipient,
    memo,
    sender,
    spendPendingUTXO = true,
  }: TxParams & {
    sender: Address
    spendPendingUTXO?: boolean
  }): Promise<
    PreparedTx & { builder: ZcashLib.TransactionBuilder; buildResult: ZcashLib.BuildResult; pubkey: Buffer }
  > {
    if (!this.validateAddress(recipient)) throw new Error('Invalid recipient address')
    if (!this.validateAddress(sender)) throw new Error('Invalid sender address')

    // Scan UTXOs
    const confirmedOnly = !spendPendingUTXO
    const utxos = await this.scanUTXOs(sender, confirmedOnly)
    if (utxos.length === 0) throw new Error('Insufficient Balance for transaction')

    // Get current block height for proper transaction version determination
    let blockHeight = 500000 // Fallback to a post-Overwinter height

    const providerNetwork = this.dataProviders[0][this.network]
    if (providerNetwork) {
      try {
        // Try to get recent transactions to determine current block height
        const recentTxs = await providerNetwork.getTransactions({
          address: sender,
          limit: 1,
        })

        if (recentTxs.txs.length > 0) {
          // Conservative estimate: use a recent mainnet height
          // As of Jan 2025, Zcash mainnet is around block 2,900,000
          blockHeight = 2900000
        }
      } catch (error) {
        console.warn('Could not determine current block height, using fallback:', blockHeight)
      }
    }

    // Convert UTXOs to Zcash format
    const addressScript = Utils.createP2PKHScript(sender)
    const zcashUtxos: ZcashLib.UTXO[] = utxos.map((utxo) => ({
      txid: utxo.hash,
      vout: utxo.index,
      value: utxo.value,
      height: blockHeight,
      script: utxo.scriptPubKey || utxo.witnessUtxo?.script?.toString('hex') || addressScript,
    }))

    // Create a dummy pubkey for building unsigned transaction
    // This will be replaced with actual pubkey when signing
    // Use a valid compressed public key format (33 bytes starting with 0x02 or 0x03)
    const dummyPubkey = Buffer.from('0339a36013301597daef41fbe593a02cc513d0b55527ec2df1050e2e8ff49c85c2', 'hex')

    // Create transaction builder
    const network = Utils.getZcashNetwork(this.network)
    const builder = new ZcashLib.TransactionBuilder(network)

    // Build transaction
    const buildResult = builder
      .selectUTXOs(zcashUtxos, 'all')
      .addOutput(recipient, amount.amount().toNumber(), memo)
      .setChangeAddress(sender)
      .build(blockHeight, dummyPubkey)

    return {
      rawUnsignedTx: JSON.stringify({
        builder: builder.getState(),
        buildResult,
        blockHeight,
        network,
      }),
      utxos,
      inputs: utxos, // Use original UTXO format for compatibility
      builder,
      buildResult,
      pubkey: dummyPubkey,
    }
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
    spendPendingUTXO = true,
  }: TxParams & {
    sender: Address
    spendPendingUTXO?: boolean
  }): Promise<PreparedTx> {
    const prepared = await this.buildTx({
      sender,
      recipient,
      amount,
      memo,
      spendPendingUTXO,
    })

    // Return only the standard PreparedTx fields
    return {
      rawUnsignedTx: prepared.rawUnsignedTx,
      utxos: prepared.utxos,
      inputs: prepared.inputs,
    }
  }

  async getFeesWithRates(): Promise<FeesWithRates> {
    throw Error('Error Zcash has flat fee. Fee rates not supported')
  }

  async getFeeRates(): Promise<FeeRates> {
    throw Error('Error Zcash has flat fee. Fee rates not supported')
  }

  async getFees(options?: FeeEstimateOptions) {
    let utxoNumber = 2 // By default pro rough estimation to display on interface
    if (options?.sender) {
      const utxo = await this.scanUTXOs(options?.sender, false)
      utxoNumber = utxo.length // Max possible fee for interface display
    }
    const memoLength = options?.memo ? options.memo.length : 0
    const flatFee = ZcashLib.calculateFee(utxoNumber, 2, memoLength)
    return {
      average: baseAmount(flatFee, ZEC_DECIMAL),
      fast: baseAmount(flatFee, ZEC_DECIMAL),
      fastest: baseAmount(flatFee, ZEC_DECIMAL),
      type: FeeType.FlatFee,
    }
  }
}

export { Client }
