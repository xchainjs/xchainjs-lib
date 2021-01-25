const Mnemonic = require('bitcore-mnemonic')

import * as bitcash from 'bitcore-lib-cash'
import * as utils from './utils'
import {
  Address,
  Balance,
  Network,
  Fees,
  Tx,
  TxParams,
  TxHash,
  TxHistoryParams,
  TxsPage,
  XChainClient,
  XChainClientParams,
} from '@xchainjs/xchain-client'
import { validatePhrase } from '@xchainjs/xchain-crypto'
import { FeesWithRates, FeeRate, FeeRates } from './types/client-types'

/**
 * BitcoinCashClient Interface
 */
interface BitcoinCashClient {
  derivePath(): string
  getFeesWithRates(memo?: string): Promise<FeesWithRates>
  getFeesWithMemo(memo: string): Promise<Fees>
  getFeeRates(): Promise<FeeRates>
}

type BitcoinCashClientParams = XChainClientParams & {
  nodeUrl?: string
  nodeApiKey?: string
}

/**
 * Custom Bitcoin Cash client
 */
class Client implements BitcoinCashClient, XChainClient {
  private network: Network
  private phrase = ''
  // private nodeUrl = ''
  // private nodeApiKey = ''

  /**
   * Constructor
   * Client is initialised with network type
   *
   * @param {BitcoinCashClientParams} params
   */
  constructor({ network = 'testnet', nodeUrl = '', nodeApiKey = '', phrase }: BitcoinCashClientParams) {
    this.network = network
    this.setNodeURL(nodeUrl)
    this.setNodeAPIKey(nodeApiKey)
    phrase && this.setPhrase(phrase)
  }

  /**
   * Set/Update the node url.
   *
   * @param {string} url The new node url.
   * @returns {void}
   */
  setNodeURL = (_url: string): void => {
    // this.nodeUrl = url
  }

  /**
   * Set/Update the node api key.
   *
   * @param {string} key The new node api key.
   * @returns {void}
   */
  setNodeAPIKey(_key: string): void {
    // this.nodeApiKey = key
  }

  /**
   * Set/update a new phrase.
   *
   * @param {string} phrase A new phrase.
   * @returns {Address} The address from the given phrase
   *
   * @throws {"Invalid phrase"}
   * Thrown if the given phase is invalid.
   */
  setPhrase = (phrase: string): Address => {
    if (validatePhrase(phrase)) {
      this.phrase = phrase
      const address = this.getAddress()
      return address
    } else {
      throw new Error('Invalid phrase')
    }
  }

  /**
   * Purge client.
   *
   * @returns {void}
   */
  purgeClient = (): void => {
    this.phrase = ''
  }

  /**
   * Set/update the current network.
   *
   * @param {Network} network `mainnet` or `testnet`.
   * @returns {void}
   *
   * @throws {"Network must be provided"}
   * Thrown if network has not been set before.
   */
  setNetwork = (network: Network): void => {
    if (!network) {
      throw new Error('Network must be provided')
    } else {
      this.network = network
    }
  }

  /**
   * Get the current network.
   *
   * @returns {Network} The current network. (`mainnet` or `testnet`)
   */
  getNetwork = (): Network => {
    return this.network
  }

  /**
   * Get DerivePath
   *
   * @returns {string} The bitcoin derivation path based on the network.
   */
  derivePath(): string {
    const { testnet, mainnet } = utils.getDerivePath()
    return utils.isTestnet(this.network) ? testnet : mainnet
  }

  /**
   * Get the explorer url.
   *
   * @returns {string} The explorer url based on the network.
   */
  getExplorerUrl = (): string => {
    const networkPath = utils.isTestnet(this.network) ? 'tbch' : 'bch'
    return `https://explorer.bitcoin.com/${networkPath}`
  }

  /**
   * Get the explorer url for the given address.
   *
   * @param {Address} address
   * @returns {string} The explorer url for the given address based on the network.
   */
  getExplorerAddressUrl = (address: Address): string => {
    return `${this.getExplorerUrl()}/address/${address}`
  }

  /**
   * Get the explorer url for the given transaction id.
   *
   * @param {string} txID The transaction id
   * @returns {string} The explorer url for the given transaction id based on the network.
   */
  getExplorerTxUrl = (txID: string): string => {
    return `${this.getExplorerUrl()}/tx/${txID}`
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
  private getPrivateKey = (phrase: string): bitcash.PrivateKey => {
    const derive_path = this.derivePath()
    const mnemonic = new Mnemonic(phrase)
    const hdPrivKey: bitcash.HDPrivateKey = mnemonic.toHDPrivateKey().derive(derive_path)

    return bitcash.PrivateKey.fromObject(hdPrivKey.privateKey)
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
  getAddress = (): Address => {
    if (this.phrase) {
      const privKey = this.getPrivateKey(this.phrase)
      const pubKey = bitcash.PublicKey.fromPrivateKey(privKey)
      const address = bitcash.Address.fromPublicKey(pubKey, utils.bchNetwork(this.getNetwork()))

      return address.toString()
    }
    throw new Error('Phrase must be provided')
  }

  /**
   * Validate the given address.
   *
   * @param {Address} address
   * @returns {boolean} `true` or `false`
   */
  validateAddress = (address: string): boolean => {
    try {
      bitcash.Address.fromString(address)
      return true
    } catch {
      return false
    }
  }

  /**
   * Get the BTC balance of a given address.
   *
   * @param {Address} address By default, it will return the balance of the current wallet. (optional)
   * @returns {Array<Balance>} The BTC balance of the address.
   */
  getBalance = async (_address?: string): Promise<Balance[]> => {
    throw new Error('In progress')
  }

  /**
   * Get transaction history of a given address with pagination options.
   * By default it will return the transaction history of the current wallet.
   *
   * @param {TxHistoryParams} params The options to get transaction history. (optional)
   * @returns {TxsPage} The transaction history.
   */
  getTransactions = async (_params?: TxHistoryParams): Promise<TxsPage> => {
    throw new Error('In progress')
  }

  /**
   * Get the transaction details of a given transaction id.
   *
   * @param {string} txId The transaction id.
   * @returns {Tx} The transaction details of the given transaction id.
   */
  getTransactionData = async (_txId: string): Promise<Tx> => {
    try {
      throw new Error('In progress')
    } catch (error) {
      return Promise.reject(error)
    }
  }

  /**
   * Get the rates and fees.
   *
   * @param {string} memo The memo to be used for fee calculation (optional)
   * @returns {FeesWithRates} The fees and rates
   */
  getFeesWithRates = async (_memo?: string): Promise<FeesWithRates> => {
    throw new Error('In progress')
  }

  /**
   * Get the current fees.
   *
   * @returns {Fees} The fees without memo
   */
  getFees = async (): Promise<Fees> => {
    try {
      const { fees } = await this.getFeesWithRates()
      return fees
    } catch (error) {
      return Promise.reject(error)
    }
  }

  /**
   * Get the fees for transactions with memo.
   * If you want to get `Fees` and `FeeRates` at once, use `getFeesAndRates` method
   *
   * @param {string} memo
   * @returns {Fees} The fees with memo
   */
  getFeesWithMemo = async (memo: string): Promise<Fees> => {
    try {
      const { fees } = await this.getFeesWithRates(memo)
      return fees
    } catch (error) {
      return Promise.reject(error)
    }
  }

  /**
   * Get the fee rates for transactions without a memo.
   * If you want to get `Fees` and `FeeRates` at once, use `getFeesAndRates` method
   *
   * @returns {FeeRates} The fee rate
   */
  getFeeRates = async (): Promise<FeeRates> => {
    try {
      const { rates } = await this.getFeesWithRates()
      return rates
    } catch (error) {
      return Promise.reject(error)
    }
  }

  /**
   * Transfer BTC.
   *
   * @param {TxParams&FeeRate} params The transfer options.
   * @returns {TxHash} The transaction hash.
   */
  transfer = async (_params: TxParams & { feeRate: FeeRate }): Promise<TxHash> => {
    try {
      throw new Error('In progress')
    } catch (e) {
      return Promise.reject(e)
    }
  }
}

export { Client, Network }
