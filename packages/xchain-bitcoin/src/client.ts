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
  TxType,
  TxsPage,
  UTXOClient,
  XChainClientParams,
  checkFeeBounds,
} from '@xchainjs/xchain-client'
import { getSeed } from '@xchainjs/xchain-crypto'
import { Address, Asset, assetAmount, assetToBase } from '@xchainjs/xchain-util'
import * as Bitcoin from 'bitcoinjs-lib'

import { AssetBTC, BTCChain, BTC_DECIMAL, LOWER_FEE_BOUND, UPPER_FEE_BOUND } from './const'
import * as sochain from './sochain-api'
import { ClientUrl } from './types/client-types'
import * as Utils from './utils'

export type BitcoinClientParams = XChainClientParams & {
  sochainUrl?: string
  sochainApiKey: string
  haskoinUrl?: ClientUrl
}

/**
 * Custom Bitcoin client
 */
class Client extends UTXOClient {
  private sochainUrl = ''
  private haskoinUrl: ClientUrl
  private sochainApiKey
  /**
   * Constructor
   * Client is initialised with network type
   *
   * @param {BitcoinClientParams} params
   */
  constructor({
    network = Network.Mainnet,
    feeBounds = {
      lower: LOWER_FEE_BOUND,
      upper: UPPER_FEE_BOUND,
    },
    sochainApiKey,
    sochainUrl = 'https://sochain.com/api/v3',
    haskoinUrl = {
      [Network.Testnet]: 'https://haskoin.ninerealms.com/btctest',
      [Network.Mainnet]: 'https://haskoin.ninerealms.com/btc',
      [Network.Stagenet]: 'https://haskoin.ninerealms.com/btc',
    },
    rootDerivationPaths = {
      [Network.Mainnet]: `84'/0'/0'/0/`, //note this isn't bip44 compliant, but it keeps the wallets generated compatible to pre HD wallets
      [Network.Testnet]: `84'/1'/0'/0/`,
      [Network.Stagenet]: `84'/0'/0'/0/`,
    },
    phrase = '',
  }: BitcoinClientParams) {
    super(BTCChain, { network, rootDerivationPaths, phrase, feeBounds })
    this.setSochainUrl(sochainUrl)
    this.haskoinUrl = haskoinUrl
    this.sochainApiKey = sochainApiKey
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
   * Get the explorer url.
   *
   * @returns {string} The explorer url based on the network.
   */
  getExplorerUrl(): string {
    switch (this.network) {
      case Network.Mainnet:
      case Network.Stagenet:
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
    return Utils.getBalance({
      params: {
        apiKey: this.sochainApiKey,
        sochainUrl: this.sochainUrl,
        network: this.network,
        address: address,
        confirmedOnly: !!confirmedOnly,
      },
      haskoinUrl: this.haskoinUrl[this.network],
    })
  }
  /**
   * helper function tto limit adding to an array
   *
   * @param arr array to be added to
   * @param toAdd elements to add
   * @param limit do not add more than this limit
   */
  private addArrayUpToLimit(arr: string[], toAdd: string[], limit: number) {
    for (let index = 0; index < toAdd.length; index++) {
      const element = toAdd[index]
      if (arr.length < limit) {
        arr.push(element)
      }
    }
  }

  /**
   * Get transaction history of a given address with pagination options.
   * By default it will return the transaction history of the current wallet.
   *
   * @param {TxHistoryParams} params The options to get transaction history. (optional)
   * @returns {TxsPage} The transaction history.
   */
  async getTransactions(params?: TxHistoryParams): Promise<TxsPage> {
    const offset = params?.offset ?? 0
    const limit = params?.limit || 10
    if (offset < 0 || limit < 0) throw Error('ofset and limit must be equal or greater than 0')

    const firstPage = Math.floor(offset / 10) + 1
    const lastPage = limit > 10 ? firstPage + Math.floor(limit / 10) : firstPage
    const offsetOnFirstPage = offset % 10

    const txHashesToFetch: string[] = []
    let page = firstPage
    try {
      while (page <= lastPage) {
        const response = await sochain.getTxs({
          apiKey: this.sochainApiKey,
          sochainUrl: this.sochainUrl,
          network: this.network,
          address: `${params?.address}`,
          page,
        })
        if (response.transactions.length === 0) break
        if (page === firstPage && response.transactions.length > offsetOnFirstPage) {
          //start from offset
          const txsToGet = response.transactions.slice(offsetOnFirstPage)
          this.addArrayUpToLimit(
            txHashesToFetch,
            txsToGet.map((i) => i.hash),
            limit,
          )
        } else {
          this.addArrayUpToLimit(
            txHashesToFetch,
            response.transactions.map((i) => i.hash),
            limit,
          )
        }
        page++
      }
    } catch (error) {
      console.error(error)
      //an errors means no more results
    }

    const total = txHashesToFetch.length
    const transactions: Tx[] = await Promise.all(txHashesToFetch.map((hash) => this.getTransactionData(hash)))

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
    try {
      const rawTx = await sochain.getTx({
        apiKey: this.sochainApiKey,
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
        to: rawTx.outputs
          .filter((i) => i.type !== 'nulldata') //filter out op_return outputs
          .map((i) => ({ to: i.address, amount: assetToBase(assetAmount(i.value, BTC_DECIMAL)) })),
        date: new Date(rawTx.time * 1000),
        type: TxType.Transfer,
        hash: rawTx.hash,
      }
    } catch (error) {
      console.error(error)
      throw error
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

    const haskoinUrl = this.haskoinUrl[this.network]

    const { psbt } = await Utils.buildTx({
      ...params,
      apiKey: this.sochainApiKey,
      feeRate,
      sender: this.getAddress(fromAddressIndex),
      sochainUrl: this.sochainUrl,
      haskoinUrl,
      network: this.network,
      spendPendingUTXO,
    })
    const btcKeys = this.getBtcKeys(this.phrase, fromAddressIndex)
    psbt.signAllInputs(btcKeys) // Sign all inputs
    psbt.finalizeAllInputs() // Finalise inputs
    const txHex = psbt.extractTransaction().toHex() // TX extracted and formatted to hex

    return await Utils.broadcastTx({ txHex, haskoinUrl })
  }
}

export { Client }
