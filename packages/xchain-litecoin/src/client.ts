import {
  AssetInfo,
  FeeOption,
  FeeRate,
  Network,
  PreparedTx,
  TxHash,
  TxParams,
  checkFeeBounds,
} from '@xchainjs/xchain-client'
import { getSeed } from '@xchainjs/xchain-crypto'
import { Address } from '@xchainjs/xchain-util'
import { Client as UTXOClient, UTXO, UtxoClientParams } from '@xchainjs/xchain-utxo'
import * as Litecoin from 'bitcoinjs-lib'
import accumulative from 'coinselect/accumulative'

import {
  AssetLTC,
  BitgoProviders,
  BlockcypherDataProviders,
  LOWER_FEE_BOUND,
  LTCChain,
  LTC_DECIMAL,
  MIN_TX_FEE,
  UPPER_FEE_BOUND,
  explorerProviders,
} from './const'
import { NodeAuth } from './types'
import * as Utils from './utils'
/**
 * Defines a mapping of node URLs for different networks.
 */
export type NodeUrls = Record<Network, string>
/**
 * Default parameters for the Litecoin client.
 */
export const defaultLtcParams: UtxoClientParams & {
  nodeUrls: NodeUrls
  nodeAuth?: NodeAuth
} = {
  network: Network.Mainnet,
  phrase: '',
  explorerProviders: explorerProviders,
  dataProviders: [BitgoProviders, BlockcypherDataProviders],
  rootDerivationPaths: {
    [Network.Mainnet]: `m/84'/2'/0'/0/`,
    [Network.Testnet]: `m/84'/1'/0'/0/`,
    [Network.Stagenet]: `m/84'/2'/0'/0/`,
  },
  feeBounds: {
    lower: LOWER_FEE_BOUND,
    upper: UPPER_FEE_BOUND,
  },
  nodeUrls: {
    [Network.Mainnet]: 'https://litecoin.ninerealms.com',
    [Network.Stagenet]: 'https://litecoin.ninerealms.com',
    [Network.Testnet]: 'https://testnet.ltc.thorchain.info',
  },
}

/**
 * Custom Litecoin client.
 */
class Client extends UTXOClient {
  private nodeUrls: NodeUrls
  private nodeAuth?: NodeAuth
  /**
   * Constructs a new `Client` with the provided parameters.
   *
   * @param {UtxoClientParams} params The parameters for initializing the client.
   */
  constructor(params = defaultLtcParams) {
    super(LTCChain, {
      network: params.network,
      rootDerivationPaths: params.rootDerivationPaths,
      phrase: params.phrase,
      feeBounds: params.feeBounds,
      explorerProviders: params.explorerProviders,
      dataProviders: params.dataProviders,
    })
    this.nodeUrls = params.nodeUrls
    this.nodeAuth = params.nodeAuth
  }

  /**
   * [DEPRECATED] Retrieves the address at the specified index.
   *
   * @deprecated Use `getAddressAsync` instead.
   * @param {number} index The index of the address.
   * @returns {Address} The address at the specified index.
   * @throws {Error} Thrown when the index is less than zero.
   * @throws {Error} Thrown when the phrase has not been set.
   * @throws {Error} Thrown when the address cannot be defined.
   */
  getAddress(index = 0): Address {
    if (index < 0) {
      throw new Error('index must be greater than zero')
    }
    if (this.phrase) {
      const ltcNetwork = Utils.ltcNetwork(this.network)
      const ltcKeys = this.getLtcKeys(this.phrase, index)

      const { address } = Litecoin.payments.p2wpkh({
        pubkey: ltcKeys.publicKey,
        network: ltcNetwork,
      })
      if (!address) {
        throw new Error('Address not defined')
      }
      return address
    }
    throw new Error('Phrase must be provided')
  }

  /**
   * Retrieves the current address asynchronously.
   *
   * Generates a network-specific key-pair by first converting the buffer to a Wallet-Import-Format (WIF)
   * The address is then decoded into type P2WPKH and returned.
   *
   * @returns {Address} A promise that resolves to the current address
   *
   * @throws {"Phrase must be provided"} Thrown if phrase has not been set before.
   * @throws {"Address not defined"} Thrown if failed creating account from phrase.
   */
  async getAddressAsync(walletIndex = 0): Promise<Address> {
    return this.getAddress(walletIndex)
  }

  /**
   * Returns information about the asset used by the client.
   *
   * @returns {AssetInfo} Information about the asset.
   */
  getAssetInfo(): AssetInfo {
    const assetInfo: AssetInfo = {
      asset: AssetLTC,
      decimal: LTC_DECIMAL,
    }
    return assetInfo
  }

  /**
   * @private
   * [PRIVATE] Retrieves the private key.
   *
   * Private function to get keyPair from the this.phrase
   *
   * @param {string} phrase The phrase used to generate the private key.
   * @returns {ECPairInterface} The privkey generated from the given phrase
   *
   * @throws {"Could not get private key from phrase"} Throws an error if failed creating LTC keys from the given phrase
   * */
  private getLtcKeys(phrase: string, index = 0): Litecoin.ECPairInterface {
    const ltcNetwork = Utils.ltcNetwork(this.network)

    const seed = getSeed(phrase)
    const master = Litecoin.bip32.fromSeed(seed, ltcNetwork).derivePath(this.getFullDerivationPath(index))

    if (!master.privateKey) {
      throw new Error('Could not get private key from phrase')
    }

    return Litecoin.ECPair.fromPrivateKey(master.privateKey, { network: ltcNetwork })
  }

  /**
   * Validates the given Litecoin address.
   *
   * @param {string} address The Litecoin address to validate.
   * @returns {boolean} `true` if the address is valid, `false` otherwise.
   */
  validateAddress(address: string): boolean {
    return Utils.validateAddress(address, this.network)
  }

  /**
   * Transfers Litecoin (LTC) from one address to another.
   *
   * @param {TxParams & { feeRate?: FeeRate }} params The transfer options.
   * @returns {Promise<TxHash>} A promise that resolves to the transaction hash.
   */
  async transfer(params: TxParams & { feeRate?: FeeRate }): Promise<TxHash> {
    // set the default fee rate to `fast`
    const feeRate = params.feeRate || (await this.getFeeRates())[FeeOption.Fast]
    checkFeeBounds(this.feeBounds, feeRate)

    const fromAddressIndex = params.walletIndex || 0
    const { rawUnsignedTx } = await this.prepareTx({
      ...params,
      feeRate,
      sender: await this.getAddressAsync(fromAddressIndex),
    })

    const psbt = Litecoin.Psbt.fromBase64(rawUnsignedTx)
    const ltcKeys = this.getLtcKeys(this.phrase, fromAddressIndex)

    psbt.signAllInputs(ltcKeys) // Sign all inputs
    psbt.finalizeAllInputs() // Finalise inputs

    const txHex = psbt.extractTransaction().toHex() // TX extracted and formatted to hex

    return await Utils.broadcastTx({
      txHex,
      nodeUrl: this.nodeUrls[this.network],
      auth: this.nodeAuth,
    })
  }

  /**
   * Builds a Litecoin (LTC) transaction.
   *
   * @param {BuildParams} params The transaction build options.
   * @returns {Transaction} A promise that resolves to the PSBT (Partially Signed Bitcoin Transaction) and UTXOs (Unspent Transaction Outputs).
   * @deprecated This function will eventually be removed. Use `prepareTx` instead.
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
  }): Promise<{ psbt: Litecoin.Psbt; utxos: UTXO[] }> {
    if (!this.validateAddress(recipient)) throw new Error('Invalid address')

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
    //2. add output memo to targets (optional)
    if (compiledMemo) {
      targetOutputs.push({ script: compiledMemo, value: 0 })
    }
    const { inputs, outputs } = accumulative(utxos, targetOutputs, feeRateWhole)

    // .inputs and .outputs will be undefined if no solution was found
    if (!inputs || !outputs) throw new Error('Insufficient Balance for transaction')

    const psbt = new Litecoin.Psbt({ network: Utils.ltcNetwork(this.network) }) // Network-specific
    // psbt add input from accumulative inputs
    inputs.forEach((utxo: UTXO) =>
      psbt.addInput({
        hash: utxo.hash,
        index: utxo.index,
        witnessUtxo: utxo.witnessUtxo,
      }),
    )

    // Outputs
    outputs.forEach((output: Litecoin.PsbtTxOutput) => {
      if (!output.address) {
        //an empty address means this is the  change address
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

    return { psbt, utxos }
  }

  /**
   * Prepares a Litecoin (LTC) transaction.
   *
   * @param {TxParams&Address&FeeRate&boolean} params The transfer options.
   * @returns {PreparedTx} A promise that resolves to the raw unsigned transaction.
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
    spendPendingUTXO?: boolean
  }): Promise<PreparedTx> {
    const { psbt } = await this.buildTx({
      sender,
      recipient,
      amount,
      feeRate,
      memo,
    })

    return { rawUnsignedTx: psbt.toBase64() }
  }
  /**
   * Compile memo.
   *
   * @param {string} memo The memo to be compiled.
   * @returns {Buffer} The compiled memo.
   */
  protected compileMemo(memo: string): Buffer {
    const data = Buffer.from(memo, 'utf8') // converts MEMO to buffer
    return Litecoin.script.compile([Litecoin.opcodes.OP_RETURN, data]) // Compile OP_RETURN script
  }

  /**
   * Calculates the transaction fee based on the provided UTXOs, fee rate, and optional compiled memo.
   *
   * @param {UTXO[]} inputs The The UTXOs used as inputs in the transaction.
   * @param {FeeRate} feeRate The fee rate.
   * @param {Buffer} data The compiled memo (Optional).
   * @returns {number} The calculated  fee amount.
   */
  protected getFeeFromUtxos(inputs: UTXO[], feeRate: FeeRate, data: Buffer | null = null): number {
    // Calculate transaction size based on inputs and outputs
    const inputSizeBasedOnInputs =
      inputs.length > 0
        ? inputs.reduce((a, x) => a + Utils.inputBytes(x), 0) + inputs.length // +1 byte for each input signature
        : 0
    let sum =
      Utils.TX_EMPTY_SIZE +
      inputSizeBasedOnInputs +
      inputs.length + // +1 byte for each input signature
      Utils.TX_OUTPUT_BASE +
      Utils.TX_OUTPUT_PUBKEYHASH +
      Utils.TX_OUTPUT_BASE +
      Utils.TX_OUTPUT_PUBKEYHASH
    // Add additional output size if memo is provided
    if (data) {
      sum += Utils.TX_OUTPUT_BASE + data.length
    }
    // Calculate fee
    const fee = sum * feeRate
    return fee > MIN_TX_FEE ? fee : MIN_TX_FEE
  }
}

export { Client }
