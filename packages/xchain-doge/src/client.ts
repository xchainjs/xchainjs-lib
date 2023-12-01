import { AssetInfo, FeeRate, Network, PreparedTx, TxHash, TxParams, checkFeeBounds } from '@xchainjs/xchain-client'
import { getSeed } from '@xchainjs/xchain-crypto'
import { Address } from '@xchainjs/xchain-util'
import { Client as UTXOClient, UTXO, UtxoClientParams } from '@xchainjs/xchain-utxo'
import * as Dogecoin from 'bitcoinjs-lib'
import accumulative from 'coinselect/accumulative'

import {
  AssetDOGE,
  BitgoProviders,
  DOGEChain,
  DOGE_DECIMAL,
  LOWER_FEE_BOUND,
  MIN_TX_FEE,
  UPPER_FEE_BOUND,
  blockcypherDataProviders,
  blockstreamExplorerProviders,
} from './const'
import { LedgerTxInfo, LedgerTxInfoParams } from './types/ledger'
import * as Utils from './utils'

export const defaultDogeParams: UtxoClientParams = {
  network: Network.Mainnet,
  phrase: '',
  explorerProviders: blockstreamExplorerProviders,
  dataProviders: [BitgoProviders, blockcypherDataProviders],
  rootDerivationPaths: {
    [Network.Mainnet]: `m/44'/3'/0'/0/`,
    [Network.Stagenet]: `m/44'/3'/0'/0/`,
    [Network.Testnet]: `m/44'/1'/0'/0/`,
  },
  feeBounds: {
    lower: LOWER_FEE_BOUND,
    upper: UPPER_FEE_BOUND,
  },
}
/**
 * Custom Dogecoin client
 */
class Client extends UTXOClient {
  /**
   * Constructor
   * Client is initialised with network type
   * Pass strict null as nodeAuth to disable auth for node json rpc
   *
   * @param {DogecoinClientParams} params
   */
  constructor(params = defaultDogeParams) {
    super(DOGEChain, {
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
    if (index < 0) {
      throw new Error('index must be greater than zero')
    }
    if (this.phrase) {
      const dogeNetwork = Utils.dogeNetwork(this.network)
      const dogeKeys = this.getDogeKeys(this.phrase, index)

      const { address } = Dogecoin.payments.p2pkh({
        pubkey: dogeKeys.publicKey,
        network: dogeNetwork,
      })
      if (!address) {
        throw new Error('Address not defined')
      }
      return address
    }
    throw new Error('Phrase must be provided')
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
   * @returns Doge asset info
   */
  getAssetInfo(): AssetInfo {
    const assetInfo: AssetInfo = {
      asset: AssetDOGE,
      decimal: DOGE_DECIMAL,
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
   * @throws {"Could not get private key from phrase"} Throws an error if failed creating Doge keys from the given phrase
   * */
  private getDogeKeys(phrase: string, index = 0): Dogecoin.ECPairInterface {
    const dogeNetwork = Utils.dogeNetwork(this.network)

    const seed = getSeed(phrase)
    const master = Dogecoin.bip32.fromSeed(seed, dogeNetwork).derivePath(this.getFullDerivationPath(index))

    if (!master.privateKey) {
      throw new Error('Could not get private key from phrase')
    }

    return Dogecoin.ECPair.fromPrivateKey(master.privateKey, { network: dogeNetwork })
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
   * Transfer Doge.
   *
   * @param {TxParams&FeeRate} params The transfer options.
   * @returns {TxHash} The transaction hash.
   */
  async transfer(params: TxParams & { feeRate?: FeeRate }): Promise<TxHash> {
    const feeRate = params.feeRate || (await this.getFeeRates())[FeeOption.Fast]
    checkFeeBounds(this.feeBounds, feeRate)

    const fromAddressIndex = params?.walletIndex || 0
    const { rawUnsignedTx } = await this.prepareTx({
      ...params,
      feeRate,
      sender: await this.getAddressAsync(fromAddressIndex),
    })

    const dogeKeys = this.getDogeKeys(this.phrase, fromAddressIndex)
    const psbt = Dogecoin.Psbt.fromBase64(rawUnsignedTx, { maximumFeeRate: 7500000 })

    psbt.signAllInputs(dogeKeys) // Sign all inputs
    psbt.finalizeAllInputs() // Finalise inputs
    const txHex = psbt.extractTransaction().toHex() // TX extracted and formatted to hex

    return await this.roundRobinBroadcastTx(txHex)
  }

  /**
   * Build transcation.
   *
   * @param {BuildParams} params The transaction build options.
   * @returns {Transaction}
   * @deprecated
   */
  public buildTx = async ({
    amount,
    recipient,
    memo,
    feeRate,
    sender,
  }: TxParams & {
    feeRate: FeeRate
    sender: Address
  }): Promise<{ psbt: Dogecoin.Psbt; utxos: UTXO[] }> => {
    if (!this.validateAddress(recipient)) throw new Error('Invalid address')

    const utxos = await this.scanUTXOs(sender, false)
    if (utxos.length === 0) throw new Error('No utxos to send')
    const feeRateWhole = Number(feeRate.toFixed(0))
    const compiledMemo = memo ? this.compileMemo(memo) : null

    const targetOutputs = []
    //1. output to recipient
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
    if (!inputs || !outputs) throw new Error('Balance insufficient for transaction')

    const psbt = new Dogecoin.Psbt({ network: Utils.dogeNetwork(this.network) }) // Network-specific
    // TODO: Doge recommended fees is greater than the recommended by Bitcoinjs-lib (for BTC),
    //       so we need to increase the maximum fee rate. Currently, the fast rate fee is near ~750000sats/byte
    // https://thornode.ninerealms.com/thorchain/inbound_addresses?height=7526662 (09-27-2022)
    // For now we increase it by 10x
    psbt.setMaximumFeeRate(7500000)
    // const params = { sochainUrl, network, address: sender }
    for (const utxo of inputs) {
      psbt.addInput({
        hash: utxo.hash,
        index: utxo.index,
        nonWitnessUtxo: Buffer.from(utxo.txHex, 'hex'),
      })
    }

    // Outputs
    outputs.forEach((output: Dogecoin.PsbtTxOutput) => {
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
   * Create transaction info.
   *
   * @param {LedgerTxInfoParams} params The transaction build options.
   * @returns {LedgerTxInfo} The transaction info used for ledger sign.
   * @deprecated
   */
  public async createTxInfo(params: LedgerTxInfoParams): Promise<LedgerTxInfo> {
    const { psbt, utxos } = await this.buildTx(params)
    const ledgerTxInfo: LedgerTxInfo = {
      utxos,
      newTxHex: psbt.data.globalMap.unsignedTx.toBuffer().toString('hex'),
    }
    return ledgerTxInfo
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
    return Dogecoin.script.compile([Dogecoin.opcodes.OP_RETURN, data]) // Compile OP_RETURN script
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
        ? inputs.reduce((a) => a + Utils.inputBytes(), 0) + inputs.length // +1 byte for each input signature
        : 0
    let sum =
      Utils.TX_EMPTY_SIZE +
      inputSizeBasedOnInputs + // +1 byte for each input signature
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
}

export { Client }
