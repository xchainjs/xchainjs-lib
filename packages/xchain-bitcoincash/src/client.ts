import * as bitcash from '@psf/bitcoincashjs-lib'
import {
  AssetInfo,
  FeeOption,
  FeeRate,
  Network,
  TxHash,
  TxParams,
  UTXO,
  UTXOClient,
  UtxoClientParams,
  checkFeeBounds,
} from '@xchainjs/xchain-client'
import { getSeed } from '@xchainjs/xchain-crypto'
import { Address } from '@xchainjs/xchain-util'
import axios from 'axios'
import accumulative from 'coinselect/accumulative'

import {
  AssetBCH,
  BCHChain,
  BCH_DECIMAL,
  HaskoinDataProviders,
  LOWER_FEE_BOUND,
  UPPER_FEE_BOUND,
  explorerProviders,
} from './const'
import { BchPreparedTx } from './types'
import { KeyPair, Transaction, TransactionBuilder } from './types/bitcoincashjs-types'
import * as Utils from './utils'

export const defaultBchParams: UtxoClientParams = {
  network: Network.Mainnet,
  phrase: '',
  explorerProviders: explorerProviders,
  dataProviders: [HaskoinDataProviders],
  rootDerivationPaths: {
    [Network.Mainnet]: `m/44'/145'/0'/0/`,
    [Network.Testnet]: `m/44'/1'/0'/0/`,
    [Network.Stagenet]: `m/44'/145'/0'/0/`,
  },
  feeBounds: {
    lower: LOWER_FEE_BOUND,
    upper: UPPER_FEE_BOUND,
  },
}
/**
 * Custom Bitcoin Cash client
 */
class Client extends UTXOClient {
  /**
   * Constructor
   * Client is initialised with network type
   *
   * @param {UtxoClientParams} params
   */
  constructor(params = defaultBchParams) {
    super(BCHChain, {
      network: params.network,
      rootDerivationPaths: params.rootDerivationPaths,
      phrase: params.phrase,
      feeBounds: params.feeBounds,
      explorerProviders: params.explorerProviders,
      dataProviders: params.dataProviders,
    })
  }

  /**
   * @deprecated this function eventually will be removed use getAddressAsync instead
   */
  getAddress(index = 0): Address {
    if (!this.phrase) throw new Error('Phrase must be provided')
    try {
      const keys = this.getBCHKeys(this.phrase, this.getFullDerivationPath(index))
      const address = keys.getAddress(index)

      return Utils.stripPrefix(Utils.toCashAddress(address))
    } catch (error) {
      throw new Error('Address not defined')
    }
  }

  /**
   * Get the current address.
   *
   * Generates a network-specific key-pair by first converting the buffer to a Wallet-Import-Format (WIF)
   * The address is then decoded into type P2WPKH and returned.
   *
   * @returns {Address} The current address.
   *
   * @throws {"Phrase must be provided"} Thrown if phrase has not been set before.
   * @throws {"Address not defined"} Thrown if failed creating account from phrase.
   */
  async getAddressAsync(index = 0): Promise<string> {
    return this.getAddress(index)
  }

  /**
   *
   * @returns BCH asset info
   */
  getAssetInfo(): AssetInfo {
    const assetInfo: AssetInfo = {
      asset: AssetBCH,
      decimal: BCH_DECIMAL,
    }
    return assetInfo
  }

  /**
   * Validate the given address.
   *
   * @param {Address} address
   * @returns {boolean} `true` or `false`
   */
  validateAddress(address: string): boolean {
    return Utils.validateAddress(address, this.network)
  }

  /**
   * @private
   * Get private key.
   *
   * Private function to get keyPair from the this.phrase
   *
   * @param {string} phrase The phrase to be used for generating privkey
   * @param {string} derivationPath BIP44 derivation path
   * @returns {PrivateKey} The privkey generated from the given phrase
   *
   * @throws {"Invalid phrase"} Thrown if invalid phrase is provided.
   * */
  private getBCHKeys(phrase: string, derivationPath: string): KeyPair {
    const rootSeed = getSeed(phrase)
    const masterHDNode = bitcash.HDNode.fromSeedBuffer(rootSeed, Utils.bchNetwork(this.network))

    return masterHDNode.derivePath(derivationPath).keyPair
  }

  protected async getSuggestedFeeRate(): Promise<FeeRate> {
    return await this.getSuggestedFee()
  }

  /**
   * Transfer BCH.
   *
   * @param {TxParams&FeeRate} params The transfer options.
   * @returns {TxHash} The transaction hash.
   */
  async transfer(params: TxParams & { feeRate?: FeeRate }): Promise<TxHash> {
    // set the default fee rate to `fast`
    const feeRate = params.feeRate || (await this.getFeeRates())[FeeOption.Fast]
    checkFeeBounds(this.feeBounds, feeRate)

    const fromAddressIndex = params.walletIndex || 0

    const { rawUnsignedTx, utxos } = await this.prepareTx({
      ...params,
      feeRate,
      sender: await this.getAddressAsync(fromAddressIndex),
    })

    const tx: Transaction = bitcash.Transaction.fromHex(rawUnsignedTx)

    const builder: TransactionBuilder = new bitcash.TransactionBuilder(Utils.bchNetwork(this.network))

    tx.ins.forEach((input) => {
      const utxo = utxos.find(
        (utxo) =>
          Buffer.compare(Buffer.from(utxo.hash, 'hex').reverse(), input.hash) === 0 && input.index === utxo.index,
      )
      if (!utxo) throw Error('Can not find UTXO')
      builder.addInput(bitcash.Transaction.fromBuffer(Buffer.from(utxo.txHex || '', 'hex')), utxo.index)
    })

    tx.outs.forEach((output) => {
      builder.addOutput(output.script, output.value)
    })

    const derivationPath = this.getFullDerivationPath(fromAddressIndex)
    const keyPair = this.getBCHKeys(this.phrase, derivationPath)

    builder.inputs.forEach((input: { value: number }, index: number) => {
      builder.sign(index, keyPair, undefined, 0x41, input.value)
    })

    const txHex = builder.build().toHex()

    return await this.roundRobinBroadcastTx(txHex)
  }

  /**
   *
   * @param {BuildParams} params The transaction build options.
   * @returns {Transaction}
   * @deprecated
   */
  async buildTx({
    amount,
    recipient,
    memo,
    feeRate,
    sender,
  }: TxParams & {
    feeRate: FeeRate
    sender: Address
  }): Promise<{
    builder: TransactionBuilder
    utxos: UTXO[]
    inputs: UTXO[]
  }> {
    const recipientCashAddress = Utils.toCashAddress(recipient)
    if (!this.validateAddress(recipientCashAddress)) throw new Error('Invalid address')

    const utxos = await this.scanUTXOs(sender, false)
    if (utxos.length === 0) throw new Error('No utxos to send')

    const feeRateWhole = Number(feeRate.toFixed(0))
    const compiledMemo = memo ? this.compileMemo(memo) : null

    const targetOutputs = []

    //1. add output amount and recipient to targets
    targetOutputs.push({
      address: recipient,
      value: amount.amount().toNumber(),
    })
    const { inputs, outputs } = accumulative(utxos, targetOutputs, feeRateWhole)

    // .inputs and .outputs will be undefined if no solution was found
    if (!inputs || !outputs) throw new Error('Insufficient Balance for transaction')

    const transactionBuilder = new bitcash.TransactionBuilder(Utils.bchNetwork(this.network))

    //Inputs
    inputs.forEach((utxo: UTXO) =>
      transactionBuilder.addInput(bitcash.Transaction.fromBuffer(Buffer.from(utxo.txHex || '', 'hex')), utxo.index),
    )

    // Outputs
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    outputs.forEach((output: any) => {
      let out = undefined
      if (!output.address) {
        //an empty address means this is the  change address
        out = bitcash.address.toOutputScript(Utils.toLegacyAddress(sender), Utils.bchNetwork(this.network))
      } else if (output.address) {
        out = bitcash.address.toOutputScript(Utils.toLegacyAddress(output.address), Utils.bchNetwork(this.network))
      }
      transactionBuilder.addOutput(out, output.value)
    })

    // add output for memo
    if (compiledMemo) {
      transactionBuilder.addOutput(compiledMemo, 0) // Add OP_RETURN {script, value}
    }

    return {
      builder: transactionBuilder,
      utxos,
      inputs,
    }
  }

  private async getSuggestedFee(): Promise<number> {
    //Note: Haskcoin does not provide fee rate related data
    //So use Bitgo API for fee estimation
    //Refer: https://app.bitgo.com/docs/#operation/v2.tx.getfeeestimate
    try {
      const response = await axios.get('https://app.bitgo.com/api/v2/bch/tx/fee')
      return response.data.feePerKb / 1000 // feePerKb to feePerByte
    } catch (error) {
      return Utils.DEFAULT_SUGGESTED_TRANSACTION_FEE
    }
  }

  /**
   * Prepare transfer.
   *
   * @param {TxParams&Address&FeeRate} params The transfer options.
   * @returns {PreparedTx} The raw unsigned transaction.
   */
  async prepareTx({
    sender,
    memo,
    amount,
    recipient,
    feeRate,
  }: TxParams & {
    sender: Address
    feeRate: FeeRate
  }): Promise<BchPreparedTx> {
    const { builder, utxos } = await this.buildTx({
      sender,
      recipient,
      amount,
      memo,
      feeRate,
    })

    return { rawUnsignedTx: builder.buildIncomplete().toHex(), utxos }
  }
  /**
   * Compile memo.
   *
   * @param {string} memo The memo to be compiled.
   * @returns {Buffer} The compiled memo.
   */
  protected compileMemo(memo: string): Buffer {
    const data = Buffer.from(memo, 'utf8') // converts MEMO to buffer
    return bitcash.script.compile([bitcash.opcodes.OP_RETURN, data]) // Compile OP_RETURN script
  }

  /**
   * Get the transaction fee.
   *
   * @param {UTXO[]} inputs The UTXOs.
   * @param {FeeRate} feeRate The fee rate.
   * @param {Buffer} data The compiled memo (Optional).
   * @returns {number} The fee amount.
   */
  protected getFeeFromUtxos(inputs: UTXO[], feeRate: FeeRate, data: Buffer | null = null): number {
    let totalWeight = Utils.TX_EMPTY_SIZE

    totalWeight += (Utils.TX_INPUT_PUBKEYHASH + Utils.TX_INPUT_BASE) * inputs.length
    totalWeight += (Utils.TX_OUTPUT_BASE + Utils.TX_OUTPUT_PUBKEYHASH) * 2
    if (data) {
      totalWeight += 9 + data.length
    }

    return Math.ceil(totalWeight * feeRate)
  }
}

export { Client }
