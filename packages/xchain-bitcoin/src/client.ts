import {
  AssetInfo,
  FeeOption,
  FeeRate,
  Network,
  PreparedTx,
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
import * as Bitcoin from 'bitcoinjs-lib'
import accumulative from 'coinselect/accumulative'

import {
  AssetBTC,
  BTCChain,
  BTC_DECIMAL,
  BlockcypherDataProviders,
  LOWER_FEE_BOUND,
  MIN_TX_FEE,
  UPPER_FEE_BOUND,
  blockstreamExplorerProviders,
} from './const'
import * as Utils from './utils'

const DEFAULT_SUGGESTED_TRANSACTION_FEE = 127

export const defaultBTCParams: UtxoClientParams = {
  network: Network.Mainnet,
  phrase: '',
  explorerProviders: blockstreamExplorerProviders,
  dataProviders: [BlockcypherDataProviders],
  rootDerivationPaths: {
    [Network.Mainnet]: `84'/0'/0'/0/`, //note this isn't bip44 compliant, but it keeps the wallets generated compatible to pre HD wallets
    [Network.Testnet]: `84'/1'/0'/0/`,
    [Network.Stagenet]: `84'/0'/0'/0/`,
  },
  feeBounds: {
    lower: LOWER_FEE_BOUND,
    upper: UPPER_FEE_BOUND,
  },
}
/**
 * Custom Bitcoin client
 */
class Client extends UTXOClient {
  /**
   * Constructor
   * Client is initialised with network type
   *
   * @param {UtxoClientParams} params
   */
  constructor(params = defaultBTCParams) {
    super(BTCChain, {
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
    if (index < 0) {
      throw new Error('index must be greater than zero')
    }
    if (this.phrase) {
      const btcNetwork = Utils.btcNetwork(this.network)
      const btcKeys = this.getBtcKeys(this.phrase, index)

      const { address } = Bitcoin.payments.p2wpkh({
        pubkey: btcKeys.publicKey,
        network: btcNetwork,
      })
      if (!address) {
        throw new Error('Address not defined')
      }
      return address
    }
    throw new Error('Phrase must be provided')
  }

  /**
   *
   * @returns BTC asset info
   */
  getAssetInfo(): AssetInfo {
    const assetInfo: AssetInfo = {
      asset: AssetBTC,
      decimal: BTC_DECIMAL,
    }
    return assetInfo
  }

  /**
   * @private
   * Get private key.
   *
   * Private function to get keyPair from the this.phrase
   *
   * @param {string} phrase The phrase to be used for generating privkey
   * @returns {ECPairInterface} The privkey generated from the given phrase
   *
   * @throws {"Could not get private key from phrase"} Throws an error if failed creating BTC keys from the given phrase
   * */
  private getBtcKeys(phrase: string, index = 0): Bitcoin.ECPair.ECPairInterface {
    const btcNetwork = Utils.btcNetwork(this.network)

    const seed = getSeed(phrase)
    const master = Bitcoin.bip32.fromSeed(seed, btcNetwork).derivePath(this.getFullDerivationPath(index))

    if (!master.privateKey) {
      throw new Error('Could not get private key from phrase')
    }

    return Bitcoin.ECPair.fromPrivateKey(master.privateKey, { network: btcNetwork })
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

  protected async getSuggestedFeeRate(): Promise<FeeRate> {
    //use Bitgo API for fee estimation
    //Refer: https://app.bitgo.com/docs/#operation/v2.tx.getfeeestimate
    try {
      const response = await axios.get('https://app.bitgo.com/api/v2/btc/tx/fee')
      return response.data.feePerKb / 1000 // feePerKb to feePerByte
    } catch (error) {
      return DEFAULT_SUGGESTED_TRANSACTION_FEE
    }
  }

  /**
   * Compile memo.
   *
   * @param {string} memo The memo to be compiled.
   * @returns {Buffer} The compiled memo.
   */
  protected compileMemo(memo: string): Buffer {
    const data = Buffer.from(memo, 'utf8') // converts MEMO to buffer
    return Bitcoin.script.compile([Bitcoin.opcodes.OP_RETURN, data]) // Compile OP_RETURN script
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
    const inputSizeBasedOnInputs =
      inputs.length > 0
        ? inputs.reduce((a, x) => a + Utils.inputBytes(x), 0) + inputs.length // +1 byte for each input signature
        : 0
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
    const fee = sum * feeRate
    return fee > MIN_TX_FEE ? fee : MIN_TX_FEE
  }

  /**
   * Transfer BTC.
   *
   * @param {TxParams&FeeRate} params The transfer options.
   * @returns {TxHash} The transaction hash.
   *
   * @throws {"memo too long"} Thrown if memo longer than  80 chars.
   */
  async transfer(params: TxParams & { feeRate?: FeeRate }): Promise<TxHash> {
    // set the default fee rate to `fast`
    const feeRate = params.feeRate || (await this.getFeeRates())[FeeOption.Fast]
    checkFeeBounds(this.feeBounds, feeRate)

    const fromAddressIndex = params?.walletIndex || 0
    const { rawUnsignedTx } = await this.prepareTx({ ...params, sender: this.getAddress(fromAddressIndex), feeRate })

    const btcKeys = this.getBtcKeys(this.phrase, fromAddressIndex)
    const psbt = Bitcoin.Psbt.fromBase64(rawUnsignedTx)

    psbt.signAllInputs(btcKeys) // Sign all inputs
    psbt.finalizeAllInputs() // Finalise inputs

    const txHex = psbt.extractTransaction().toHex() // TX extracted and formatted to hex

    const txHash = psbt.extractTransaction().getId()
    try {
      const txId = await this.roundRobinBroadcastTx(txHex)
      return txId
    } catch (err) {
      const error = `Server error, please check explorer for tx confirmation ${this.explorerProviders[
        this.network
      ].getExplorerTxUrl(txHash)}`
      return error
    }
  }

  /**
   *
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
  }): Promise<{ psbt: Bitcoin.Psbt; utxos: UTXO[]; inputs: UTXO[] }> {
    if (memo && memo.length > 80) {
      throw new Error('memo too long, must not be longer than 80 chars.')
    }
    if (!this.validateAddress(recipient)) throw new Error('Invalid address')
    // search only confirmed UTXOs if pending UTXO is not allowed
    const confirmedOnly = !spendPendingUTXO
    const utxos = await this.scanUTXOs(sender, confirmedOnly)
    if (utxos.length === 0) throw new Error('Insufficient Balance for transaction')
    const feeRateWhole = Math.ceil(feeRate)
    const compiledMemo = memo ? this.compileMemo(memo) : null

    const targetOutputs = []

    //1. add output amount and recipient to targets
    targetOutputs.push({
      address: recipient,
      value: amount.amount().toNumber(),
    })
    //2. add output memo to targets (optional)
    if (compiledMemo) {
      targetOutputs.push({ script: compiledMemo, value: 0 })
    }
    const { inputs, outputs } = accumulative(utxos, targetOutputs, feeRateWhole)

    // .inputs and .outputs will be undefined if no solution was found
    if (!inputs || !outputs) throw new Error('Insufficient Balance for transaction')

    const psbt = new Bitcoin.Psbt({ network: Utils.btcNetwork(this.network) }) // Network-specific

    // psbt add input from accumulative inputs
    inputs.forEach((utxo: UTXO) =>
      psbt.addInput({
        hash: utxo.hash,
        index: utxo.index,
        witnessUtxo: utxo.witnessUtxo,
      }),
    )

    // psbt add outputs from accumulative outputs
    outputs.forEach((output: Bitcoin.PsbtTxOutput) => {
      if (!output.address) {
        //an empty address means this is the  change ddress
        output.address = sender
      }
      if (!output.script) {
        psbt.addOutput(output)
      } else {
        //we need to add the compiled memo this way to
        //avoid dust error tx when accumulating memo output with 0 value
        if (compiledMemo) {
          psbt.addOutput({ script: compiledMemo, value: 0 })
        }
      }
    })

    return { psbt, utxos, inputs }
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
    const { psbt } = await this.buildTx({
      sender,
      recipient,
      amount,
      feeRate,
      memo,
      spendPendingUTXO,
    })

    return { rawUnsignedTx: psbt.toBase64() }
  }
}

export { Client }
