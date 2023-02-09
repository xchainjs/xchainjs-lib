import {
  Balance,
  Fee,
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
import { Address, assetAmount, assetToBase } from '@xchainjs/xchain-util'
import * as Dogecoin from 'bitcoinjs-lib'

import * as blockcypher from './blockcypher-api'
import { AssetDOGE, DOGEChain, DOGE_DECIMAL, LOWER_FEE_BOUND, UPPER_FEE_BOUND } from './const'
import * as sochain from './sochain-api'
import * as Utils from './utils'

export type DogecoinClientParams = XChainClientParams & {
  sochainUrl?: string
  blockcypherUrl?: string
  sochainApiKey: string
}

/**
 * Custom Dogecoin client
 */
class Client extends UTXOClient {
  private sochainUrl = ''
  private blockcypherUrl = ''
  private sochainApiKey
  /**
   * Constructor
   * Client is initialised with network type
   * Pass strict null as nodeAuth to disable auth for node json rpc
   *
   * @param {DogecoinClientParams} params
   */
  constructor({
    network = Network.Mainnet,
    feeBounds = {
      lower: LOWER_FEE_BOUND,
      upper: UPPER_FEE_BOUND,
    },
    sochainApiKey,
    sochainUrl = 'https://sochain.com/api/v3',
    blockcypherUrl = 'https://api.blockcypher.com/v1',
    phrase,
    rootDerivationPaths = {
      [Network.Mainnet]: `m/44'/3'/0'/0/`,
      [Network.Stagenet]: `m/44'/3'/0'/0/`,
      [Network.Testnet]: `m/44'/1'/0'/0/`,
    },
  }: DogecoinClientParams) {
    super(DOGEChain, { network, rootDerivationPaths, phrase, feeBounds })
    this.setSochainUrl(sochainUrl)
    this.setBlockcypherUrl(blockcypherUrl)
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
   * Set/Update the blockcypher url.
   *
   * @param {string} url The new blockcypher url.
   * @returns {void}
   */
  setBlockcypherUrl(url: string): void {
    this.blockcypherUrl = url
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
        return 'https://blockchair.com/dogecoin'
      case Network.Testnet:
        return 'https://blockexplorer.one/dogecoin/testnet'
    }
  }

  /**
   * Get the explorer url for the given address.
   *
   * @param {Address} address
   * @returns {string} The explorer url for the given address based on the network.
   */
  getExplorerAddressUrl(address: Address): string {
    return `${this.getExplorerUrl()}/address/${address}`
  }
  /**
   * Get the explorer url for the given transaction id.
   *
   * @param {string} txID The transaction id
   * @returns {string} The explorer url for the given transaction id based on the network.
   */
  getExplorerTxUrl(txID: string): string {
    switch (this.network) {
      case Network.Mainnet:
        return `${this.getExplorerUrl()}/transaction/${txID}`
      case Network.Stagenet:
        return `${this.getExplorerUrl()}/transaction/${txID}`
      case Network.Testnet:
        return `${this.getExplorerUrl()}/tx/${txID}`
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
   * Get the Doge balance of a given address.
   *
   * @param {Address} address By default, it will return the balance of the current wallet. (optional)
   * @returns {Balance[]} The Doge balance of the address.
   */
  async getBalance(address: Address): Promise<Balance[]> {
    return Utils.getBalance({
      apiKey: this.sochainApiKey,
      sochainUrl: this.sochainUrl,
      network: this.network,
      address,
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
    // console.log(JSON.stringify({ txHashesToFetch }, null, 2))
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
    const rawTx = await sochain.getTx({
      apiKey: this.sochainApiKey,
      sochainUrl: this.sochainUrl,
      network: this.network,
      hash: txId,
    })
    return {
      asset: AssetDOGE,
      from: rawTx.inputs.map((i) => ({
        from: i.address,
        amount: assetToBase(assetAmount(i.value, DOGE_DECIMAL)),
      })),
      to: rawTx.outputs.map((i) => ({ to: i.address, amount: assetToBase(assetAmount(i.value, DOGE_DECIMAL)) })),
      date: new Date(rawTx.time * 1000),
      type: TxType.Transfer,
      hash: rawTx.hash,
    }
  }

  protected async getSuggestedFeeRate(): Promise<FeeRate> {
    return await blockcypher.getSuggestedTxFee({ blockcypherUrl: this.blockcypherUrl })
  }

  protected async calcFee(feeRate: FeeRate, memo?: string): Promise<Fee> {
    return Utils.calcFee(feeRate, memo)
  }

  /**
   * Transfer Doge.
   *
   * @param {TxParams&FeeRate} params The transfer options.
   * @returns {TxHash} The transaction hash.
   */
  async transfer(params: TxParams & { feeRate?: FeeRate }): Promise<TxHash> {
    const fromAddressIndex = params?.walletIndex || 0
    const feeRate = params.feeRate || (await this.getSuggestedFeeRate())
    checkFeeBounds(this.feeBounds, feeRate)

    const { psbt } = await Utils.buildTx({
      apiKey: this.sochainApiKey,
      amount: params.amount,
      recipient: params.recipient,
      memo: params.memo,
      feeRate,
      sender: this.getAddress(fromAddressIndex),
      sochainUrl: this.sochainUrl,
      network: this.network,
    })
    const dogeKeys = this.getDogeKeys(this.phrase, fromAddressIndex)
    psbt.signAllInputs(dogeKeys) // Sign all inputs
    psbt.finalizeAllInputs() // Finalise inputs
    const txHex = psbt.extractTransaction().toHex() // TX extracted and formatted to hex

    let nodeUrl: string
    if (this.network === Network.Testnet) {
      nodeUrl = sochain.getSendTxUrl({
        network: this.network,
        sochainUrl: this.sochainUrl,
      })
    } else {
      nodeUrl = blockcypher.getSendTxUrl({ network: this.network, blockcypherUrl: this.blockcypherUrl })
    }

    return await Utils.broadcastTx({
      network: this.network,
      txHex,
      nodeUrl,
    })
  }
}

export { Client }
