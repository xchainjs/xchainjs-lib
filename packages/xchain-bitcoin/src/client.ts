import {
  Address,
  Balance,
  Fee,
  FeeOption,
  FeeRate,
  Network,
  Tx,
  TxHash,
  TxHistoryParams,
  TxParams,
  TxType,
  TxsPage,
  UTXOClient,
  XChainClientParams,
} from '@xchainjs/xchain-client'
import { getSeed } from '@xchainjs/xchain-crypto'
import { AssetBTC, Chain, assetAmount, assetToBase } from '@xchainjs/xchain-util'
import * as Bitcoin from 'bitcoinjs-lib'

import { BTC_DECIMAL } from './const'
import * as sochain from './sochain-api'
import * as Utils from './utils'

export type BitcoinClientParams = XChainClientParams & {
  sochainUrl?: string
  blockstreamUrl?: string
}

/**
 * Custom Bitcoin client
 */
class Client extends UTXOClient {
  private sochainUrl = ''
  private blockstreamUrl = ''

  /**
   * Constructor
   * Client is initialised with network type
   *
   * @param {BitcoinClientParams} params
   */
  constructor({
    network = Network.Testnet,
    sochainUrl = 'https://sochain.com/api/v2',
    blockstreamUrl = 'https://blockstream.info',
    rootDerivationPaths = {
      [Network.Mainnet]: `84'/0'/0'/0/`, //note this isn't bip44 compliant, but it keeps the wallets generated compatible to pre HD wallets
      [Network.Testnet]: `84'/1'/0'/0/`,
    },
    phrase = '',
  }: BitcoinClientParams) {
    super(Chain.Bitcoin, { network, rootDerivationPaths, phrase })
    this.setSochainUrl(sochainUrl)
    this.setBlockstreamUrl(blockstreamUrl)
  }

  /**
   * Set/Update the sochain url.
   *
   * @param {string} url The new sochain url.
   * @returns {void}
   */
  setSochainUrl(url: string): void {
    this.sochainUrl = url
  }

  /**
   * Set/Update the blockstream url.
   *
   * @param {string} url The new blockstream url.
   * @returns {void}
   */
  setBlockstreamUrl(url: string): void {
    this.blockstreamUrl = url
  }

  /**
   * Get the explorer url.
   *
   * @returns {string} The explorer url based on the network.
   */
  getExplorerUrl(): string {
    switch (this.network) {
      case Network.Mainnet:
        return 'https://blockstream.info'
      case Network.Testnet:
        return 'https://blockstream.info/testnet'
    }
  }

  /**
   * Get the explorer url for the given address.
   *
   * @param {Address} address
   * @returns {string} The explorer url for the given address based on the network.
   */
  getExplorerAddressUrl(address: string): string {
    return `${this.getExplorerUrl()}/address/${address}`
  }
  /**
   * Get the explorer url for the given transaction id.
   *
   * @param {string} txID The transaction id
   * @returns {string} The explorer url for the given transaction id based on the network.
   */
  getExplorerTxUrl(txID: string): string {
    return `${this.getExplorerUrl()}/tx/${txID}`
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
   * Get the BTC balance of a given address.
   *
   * @param {Address} the BTC address
   * @returns {Balance[]} The BTC balance of the address.
   */
  async getBalance(address: Address): Promise<Balance[]> {
    return Utils.getBalance({
      sochainUrl: this.sochainUrl,
      network: this.network,
      address: address,
    })
  }

  /**
   * Get transaction history of a given address with pagination options.
   * By default it will return the transaction history of the current wallet.
   *
   * @param {TxHistoryParams} params The options to get transaction history. (optional)
   * @returns {TxsPage} The transaction history.
   */
  async getTransactions(params?: TxHistoryParams): Promise<TxsPage> {
    // Sochain API doesn't have pagination parameter
    const offset = params?.offset ?? 0
    const limit = params?.limit || 10

    const response = await sochain.getAddress({
      address: params?.address + '',
      sochainUrl: this.sochainUrl,
      network: this.network,
    })
    const total = response.txs.length
    const transactions: Tx[] = []

    const txs = response.txs.filter((_, index) => offset <= index && index < offset + limit)
    for (const txItem of txs) {
      const rawTx = await sochain.getTx({
        sochainUrl: this.sochainUrl,
        network: this.network,
        hash: txItem.txid,
      })
      const tx: Tx = {
        asset: AssetBTC,
        from: rawTx.inputs.map((i) => ({
          from: i.address,
          amount: assetToBase(assetAmount(i.value, BTC_DECIMAL)),
        })),
        to: rawTx.outputs
          .filter((i) => i.type !== 'nulldata')
          .map((i) => ({ to: i.address, amount: assetToBase(assetAmount(i.value, BTC_DECIMAL)) })),
        date: new Date(rawTx.time * 1000),
        type: TxType.Transfer,
        hash: rawTx.txid,
      }
      transactions.push(tx)
    }

    const result: TxsPage = {
      total,
      txs: transactions,
    }
    return result
  }

  /**
   * Get the transaction details of a given transaction id.
   *
   * @param {string} txId The transaction id.
   * @returns {Tx} The transaction details of the given transaction id.
   */
  async getTransactionData(txId: string): Promise<Tx> {
    const rawTx = await sochain.getTx({
      sochainUrl: this.sochainUrl,
      network: this.network,
      hash: txId,
    })
    return {
      asset: AssetBTC,
      from: rawTx.inputs.map((i) => ({
        from: i.address,
        amount: assetToBase(assetAmount(i.value, BTC_DECIMAL)),
      })),
      to: rawTx.outputs.map((i) => ({ to: i.address, amount: assetToBase(assetAmount(i.value, BTC_DECIMAL)) })),
      date: new Date(rawTx.time * 1000),
      type: TxType.Transfer,
      hash: rawTx.txid,
    }
  }

  protected async getSuggestedFeeRate(): Promise<FeeRate> {
    return await sochain.getSuggestedTxFee()
  }

  protected async calcFee(feeRate: FeeRate, memo?: string): Promise<Fee> {
    return Utils.calcFee(feeRate, memo)
  }

  /**
   * Transfer BTC.
   *
   * @param {TxParams&FeeRate} params The transfer options.
   * @returns {TxHash} The transaction hash.
   */
  async transfer(params: TxParams & { feeRate?: FeeRate }): Promise<TxHash> {
    const fromAddressIndex = params?.walletIndex || 0

    // set the default fee rate to `fast`
    const feeRate = params.feeRate || (await this.getFeeRates())[FeeOption.Fast]

    /**
     * do not spend pending UTXOs when adding a memo
     * https://github.com/xchainjs/xchainjs-lib/issues/330
     */
    const spendPendingUTXO: boolean = params.memo ? false : true

    const { psbt } = await Utils.buildTx({
      ...params,
      feeRate,
      sender: this.getAddress(fromAddressIndex),
      sochainUrl: this.sochainUrl,
      network: this.network,
      spendPendingUTXO,
    })

    const btcKeys = this.getBtcKeys(this.phrase, fromAddressIndex)
    psbt.signAllInputs(btcKeys) // Sign all inputs
    psbt.finalizeAllInputs() // Finalise inputs
    const txHex = psbt.extractTransaction().toHex() // TX extracted and formatted to hex

    return await Utils.broadcastTx({ network: this.network, txHex, blockstreamUrl: this.blockstreamUrl })
  }
}

export { Client }
