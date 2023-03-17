import {
  Balance,
  Fee,
  FeeOption,
  FeeRate,
  Network,
  Tx,
  TxHash,
  TxHistoryParams,
  TxParams,
  TxsPage,
  UTXOClient,
  XChainClientParams,
  checkFeeBounds,
} from '@xchainjs/xchain-client'
import { getSeed } from '@xchainjs/xchain-crypto'
import {
  ExplorerProvider,
  ExplorerProviders,
  UTXO,
  UtxoOnlineDataProvider,
  UtxoOnlineDataProviders,
} from '@xchainjs/xchain-providers'
import { Address, Asset } from '@xchainjs/xchain-util'
import axios from 'axios'
import * as Bitcoin from 'bitcoinjs-lib'
import accumulative from 'coinselect/accumulative'

import { BTCChain, LOWER_FEE_BOUND, UPPER_FEE_BOUND, blockstreamExplorerProviders, sochainDataProviders } from './const'
import * as Utils from './utils'

const DEFAULT_SUGGESTED_TRANSACTION_FEE = 127

export type BitcoinClientParams = XChainClientParams & {
  explorerProviders: ExplorerProviders
  dataProviders: UtxoOnlineDataProviders
}
export const defaultBTCParams: BitcoinClientParams = {
  network: Network.Mainnet,
  phrase: '',
  explorerProviders: blockstreamExplorerProviders,
  dataProviders: sochainDataProviders,
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
  private explorerProviders: Record<Network, ExplorerProvider>
  private dataProviders: Record<Network, UtxoOnlineDataProvider>
  /**
   * Constructor
   * Client is initialised with network type
   *
   * @param {BitcoinClientParams} params
   */
  constructor(params = defaultBTCParams) {
    super(BTCChain, {
      network: params.network,
      rootDerivationPaths: params.rootDerivationPaths,
      phrase: params.phrase,
      feeBounds: params.feeBounds,
    })
    this.explorerProviders = params.explorerProviders
    this.dataProviders = params.dataProviders
  }

  /**
   * Get the explorer url.
   *
   * @returns {string} The explorer url based on the network.
   */
  getExplorerUrl(): string {
    return this.explorerProviders[this.network].getExplorerUrl()
  }

  /**
   * Get the explorer url for the given address.
   *
   * @param {Address} address
   * @returns {string} The explorer url for the given address based on the network.
   */
  getExplorerAddressUrl(address: string): string {
    return this.explorerProviders[this.network].getExplorerAddressUrl(address)
  }
  /**
   * Get the explorer url for the given transaction id.
   *
   * @param {string} txID The transaction id
   * @returns {string} The explorer url for the given transaction id based on the network.
   */
  getExplorerTxUrl(txID: string): string {
    return this.explorerProviders[this.network].getExplorerTxUrl(txID)
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
  private getBtcKeys(phrase: string, index = 0): Bitcoin.ECPairInterface {
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

  /**
   * Gets BTC balances of a given address.
   *
   * @param {Address} BTC address to get balances from
   * @param {undefined} Needed for legacy only to be in common with `XChainClient` interface - will be removed by a next version
   * @param {confirmedOnly} Flag to get balances of confirmed txs only
   *
   * @returns {Balance[]} BTC balances
   */
  // TODO (@xchain-team|@veado) Change params to be an object to be extendable more easily
  // see changes for `xchain-bitcoin` https://github.com/xchainjs/xchainjs-lib/pull/490
  async getBalance(address: Address, _assets?: Asset[] /* not used */, confirmedOnly?: boolean): Promise<Balance[]> {
    // TODO figure this out ---> !!confirmedOnly)
    confirmedOnly
    return await this.dataProviders[this.network].getBalance(address, _assets)
  }

  /**
   * Get transaction history of a given address with pagination options.
   * By default it will return the transaction history of the current wallet.
   *
   * @param {TxHistoryParams} params The options to get transaction history. (optional)
   * @returns {TxsPage} The transaction history.
   */
  async getTransactions(params?: TxHistoryParams): Promise<TxsPage> {
    const filteredParams: TxHistoryParams = {
      address: params?.address || this.getAddress(),
      offset: params?.offset,
      limit: params?.limit,
      startTime: params?.startTime,
      asset: params?.asset,
    }

    return await this.dataProviders[this.network].getTransactions(filteredParams)
  }

  /**
   * Get the transaction details of a given transaction id.
   *
   * @param {string} txId The transaction id.
   * @returns {Tx} The transaction details of the given transaction id.
   */
  async getTransactionData(txId: string): Promise<Tx> {
    return await this.dataProviders[this.network].getTransactionData(txId)
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

  protected async calcFee(feeRate: FeeRate, memo?: string): Promise<Fee> {
    return Utils.calcFee(feeRate, memo)
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
    const fromAddressIndex = params?.walletIndex || 0

    // set the default fee rate to `fast`
    const feeRate = params.feeRate || (await this.getFeeRates())[FeeOption.Fast]
    checkFeeBounds(this.feeBounds, feeRate)

    /**
     * do not spend pending UTXOs when adding a memo
     * https://github.com/xchainjs/xchainjs-lib/issues/330
     */
    const spendPendingUTXO = !params.memo

    const { psbt } = await this.buildTx({
      ...params,
      feeRate,
      sender: this.getAddress(fromAddressIndex),
      spendPendingUTXO,
    })
    const btcKeys = this.getBtcKeys(this.phrase, fromAddressIndex)
    psbt.signAllInputs(btcKeys) // Sign all inputs
    psbt.finalizeAllInputs() // Finalise inputs
    const txHex = psbt.extractTransaction().toHex() // TX extracted and formatted to hex
    const txHash = psbt.extractTransaction().getId()
    try {
      const txId = await this.dataProviders[this.network].broadcastTx(txHex)
      return txId
    } catch (err) {
      const error = `Server error, please check explorer for tx confirmation ${this.explorerProviders[
        this.network
      ].getExplorerTxUrl(txHash)}`
      return error
    }
  }
  private async buildTx({
    amount,
    recipient,
    memo,
    feeRate,
    sender,
    spendPendingUTXO = false, // default: prevent spending uncomfirmed UTXOs
  }: TxParams & {
    feeRate: FeeRate
    sender: Address
    spendPendingUTXO?: boolean
    withTxHex?: boolean
  }): Promise<{ psbt: Bitcoin.Psbt; utxos: UTXO[]; inputs: UTXO[] }> {
    if (memo && memo.length > 80) {
      throw new Error('memo too long, must not be longer than 80 chars.')
    }
    // search only confirmed UTXOs if pending UTXO is not allowed
    const confirmedOnly = !spendPendingUTXO
    const utxos = await this.scanUTXOs(sender, confirmedOnly)
    if (utxos.length === 0)
      throw new Error('No confirmed UTXOs. Please wait until your balance has been confirmed on-chain.')
    if (!this.validateAddress(recipient)) throw new Error('Invalid address')
    const feeRateWhole = Math.ceil(feeRate)
    const compiledMemo = memo ? Utils.compileMemo(memo) : null

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
  private async scanUTXOs(
    address: string,
    confirmedOnly = true, // default: scan only confirmed UTXOs
  ): Promise<UTXO[]> {
    return confirmedOnly
      ? await this.dataProviders[this.network].getConfirmedUnspentTxs(address)
      : await this.dataProviders[this.network].getUnspentTxs(address)
  }
}

export { Client }
