import * as bitcash from '@psf/bitcoincashjs-lib'
import {
  Fee,
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

import { BCHChain, HaskoinDataProviders, LOWER_FEE_BOUND, UPPER_FEE_BOUND, explorerProviders } from './const'
import { KeyPair, TransactionBuilder } from './types/bitcoincashjs-types'
import * as Utils from './utils'

export const defaultBCHParams: UtxoClientParams = {
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
  constructor(params = defaultBCHParams) {
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

  protected async calcFee(feeRate: FeeRate, memo?: string): Promise<Fee> {
    return Utils.calcFee(feeRate, memo)
  }

  /**
   * Transfer BCH.
   *
   * @param {TxParams&FeeRate} params The transfer options.
   * @returns {TxHash} The transaction hash.
   */
  async transfer(params: TxParams & { feeRate?: FeeRate }): Promise<TxHash> {
    const index = params.walletIndex || 0
    const derivationPath = this.getFullDerivationPath(index)

    // set the default fee rate to `fast`
    const feeRate = params.feeRate || (await this.getFeeRates())[FeeOption.Fast]
    checkFeeBounds(this.feeBounds, feeRate)

    const { builder, inputs } = await this.buildTx({
      ...params,
      feeRate,
      sender: this.getAddress(index),
    })

    const keyPair = this.getBCHKeys(this.phrase, derivationPath)

    inputs.forEach((utxo, index) => {
      builder.sign(index, keyPair, undefined, 0x41, utxo.witnessUtxo.value)
    })

    const txHex = builder.build().toHex()

    return await this.roundRobinBroadcastTx(txHex)
  }
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
    const compiledMemo = memo ? Utils.compileMemo(memo) : null

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
}

export { Client }
