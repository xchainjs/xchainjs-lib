// import * as ecc from '@bitcoin-js/tiny-secp256k1-asmjs'
import { AssetInfo, FeeRate, Network } from '@xchainjs/xchain-client'
import { Address } from '@xchainjs/xchain-util'
import { Client as UTXOClient, PreparedTx, TxParams, UTXO, UtxoClientParams } from '@xchainjs/xchain-utxo'
import * as utxolib from '@bitgo/utxo-lib'
import accumulative from 'coinselect/accumulative'

import {
  AssetZEC,
  ZECChain,
  ZEC_DECIMAL,
  NownodesProviders,
  LOWER_FEE_BOUND,
  MIN_TX_FEE,
  UPPER_FEE_BOUND,
  blockstreamExplorerProviders,
} from './const'
import * as Utils from './utils'

// Default parameters for the Zcash client
export const defaultZECParams: UtxoClientParams = {
  network: Network.Mainnet,
  phrase: '',
  explorerProviders: blockstreamExplorerProviders,
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
    const data = Buffer.from(memo, 'utf8') // converts MEMO to buffer
    return utxolib.script.compile([utxolib.opcodes.OP_RETURN, data]) // Compile OP_RETURN script
  }

  /**
   * Get transaction fee from UTXOs.
   * @param {UTXO[]} inputs UTXOs to calculate fee from.
   * @param {FeeRate} feeRate Fee rate.
   * @param {Buffer | null} data Compiled memo (Optional).
   * @returns {number} Transaction fee.
   */
  protected getFeeFromUtxos(inputs: UTXO[], feeRate: FeeRate, data: Buffer | null = null): number {
    // Calculate input size based on inputs
    const inputSizeBasedOnInputs =
      inputs.length > 0
        ? inputs.reduce((a, x) => a + Utils.inputBytes(x), 0) + inputs.length // +1 byte for each input signature
        : 0
    // Calculate sum
    let sum =
      Utils.TX_EMPTY_SIZE +
      inputSizeBasedOnInputs +
      Utils.TX_OUTPUT_BASE +
      Utils.TX_OUTPUT_PUBKEYHASH +
      Utils.TX_OUTPUT_BASE +
      Utils.TX_OUTPUT_PUBKEYHASH

    if (data) {
      sum += Utils.TX_OUTPUT_BASE + data.length
    }
    // Calculate fee
    const fee = sum * feeRate
    return fee > MIN_TX_FEE ? fee : MIN_TX_FEE
  }

  async getUtxo(address: string) {
    return await this.scanUTXOs(address, true)
  }

  /**
   * Build a Zcash transaction.*
   * @param param0
   * @deprecated
   */
  async buildTx({
    amount,
    recipient,
    memo,
    feeRate,
    sender,
    spendPendingUTXO = true,
  }: TxParams & {
    feeRate: FeeRate
    sender: Address
    spendPendingUTXO?: boolean
    withTxHex?: boolean
  }): Promise<{ txb: utxolib.bitgo.ZcashTransactionBuilder; utxos: UTXO[]; inputs: UTXO[] }> {
    // Check memo length
    if (memo && memo.length > 80) {
      throw new Error('memo too long, must not be longer than 80 chars.')
    }
    // This section of the code is responsible for preparing a transaction by building a Bitcoin PSBT (Partially Signed Bitcoin Transaction).
    if (!this.validateAddress(recipient)) throw new Error('Invalid address')
    // Determine whether to only use confirmed UTXOs or include pending UTXOs based on the spendPendingUTXO flag.
    const confirmedOnly = !spendPendingUTXO
    // Scan UTXOs associated with the sender's address.
    const utxos = await this.scanUTXOs(sender, confirmedOnly)
    // Throw an error if there are no available UTXOs to cover the transaction.
    if (utxos.length === 0) throw new Error('Insufficient Balance for transaction')
    // Round up the fee rate to the nearest integer.
    const feeRateWhole = Math.ceil(feeRate)
    // Compile the memo into a Buffer if provided.
    const compiledMemo = memo ? this.compileMemo(memo) : null
    // Initialize an array to store the target outputs of the transaction.
    const targetOutputs = []

    // 1. Add the recipient address and amount to the target outputs.
    targetOutputs.push({
      address: recipient,
      value: amount.amount().toNumber(),
    })
    // 2. Add the compiled memo to the target outputs if it exists.
    if (compiledMemo) {
      targetOutputs.push({ script: compiledMemo, value: 0 })
    }
    // Use the coinselect library to determine the inputs and outputs for the transaction.
    const { inputs, outputs } = accumulative(utxos, targetOutputs, feeRateWhole)
    // If no suitable inputs or outputs are found, throw an error indicating insufficient balance.
    if (!inputs || !outputs) throw new Error('Insufficient Balance for transaction')
    // Initialize a new Bitcoin PSBT object.
    let txb = new utxolib.bitgo.ZcashTransactionBuilder(Utils.zecNetwork(this.network))

    txb.setVersion(5)
    txb.setVersionGroupId(0x26a7270a)
    txb.setExpiryHeight(0)
    txb.setConsensusBranchId(0xc8e71055)

    inputs.forEach((utxo: UTXO) => {
      // if (!utxo.txHex) {
      //   throw Error (`Non txHex data for UTXO ${utxo.txHex}`)
      // }
      // const tx = utxolib.Transaction.fromHex(utxo.txHex)
      // console.log('tx', tx)
      // txHash: Buffer | string | Transaction<TNumber>, vout: number, sequence?: number, prevOutScript?: Buffer, value?: TNumber
      txb.addInput(
        utxo.hash,
        utxo.index,
        undefined,
        Buffer.from(utxo.scriptPubKey as string, 'hex'),
        utxo.value
      )
    }
    )
    // Add outputs to the PSBT from the accumulated outputs.
    outputs.forEach((output: any) => {
      // If the output address is not specified, it's considered a change address and set to the sender's address.
      if (!output.address) {
        //an empty address means this is the change address
        output.address = sender
      }
      // Add the output to the PSBT.
      if (!output.script) {
        txb.addOutput(output.address, output.value)
      } else {
        // If the output is a memo, add it to the PSBT to avoid dust error.
        if (compiledMemo) {
          txb.addOutput(compiledMemo, 0)
        }
      }
    })

    return { txb: txb, utxos, inputs }
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
    feeRate,
  }: TxParams & {
    sender: Address
    feeRate: FeeRate
    spendPendingUTXO?: boolean
  }): Promise<PreparedTx> {
    // Build the transaction using the provided parameters.
    const { txb, utxos, inputs } = await this.buildTx({
      sender,
      recipient,
      amount,
      feeRate,
      memo,
      spendPendingUTXO,
    })
    // Return the raw unsigned transaction (PSBT) and associated UTXOs.
    return { rawUnsignedTx: txb.buildIncomplete().toHex(), utxos, inputs }
  }
}

export { Client }
