const Mnemonic = require('bitcore-mnemonic')

import axios from 'axios'
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
  TxFrom,
  TxTo,
} from '@xchainjs/xchain-client'
import { validatePhrase } from '@xchainjs/xchain-crypto'
import { FeesWithRates, FeeRate, FeeRates, ClientUrl } from './types/client-types'
import { AddressBalance, Transaction } from './types/api-types'
import { baseAmount } from '@xchainjs/xchain-util/lib'

const BCH_DECIMAL = 8

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
  clientUrl?: ClientUrl
}

/**
 * Custom Bitcoin Cash client
 */
class Client implements BitcoinCashClient, XChainClient {
  private network: Network
  private phrase = ''
  private clientUrl: ClientUrl

  /**
   * Constructor
   * Client is initialised with network type
   *
   * @param {BitcoinCashClientParams} params
   */
  constructor({ network = 'testnet', clientUrl, phrase }: BitcoinCashClientParams) {
    this.network = network
    this.clientUrl = clientUrl || this.getDefaultClientURL()
    phrase && this.setPhrase(phrase)
  }

  /**
   * Get default ClientURL based on the network.
   *
   * @param {string} url The new node url.
   * @returns {void}
   */
  getDefaultClientURL = (): ClientUrl => {
    return {
      testnet: 'https://api.haskoin.com/bchtest',
      mainnet: 'https://api.haskoin.com/bch',
    }
  }

  /**
   * Set/Update the node url.
   *
   * @param {string} url The new node url.
   * @returns {void}
   */
  setClientURL = (url: ClientUrl): void => {
    this.clientUrl = url
  }

  /**
   * Get the client url.
   *
   * @returns {string} The client url for thorchain based on the current network.
   */
  getClientURL = (): string => {
    return this.getClientUrlByNetwork(this.getNetwork())
  }

  /**
   * Get the client url.
   *
   * @returns {string} The client url for ethereum based on the network.
   */
  getClientUrlByNetwork = (network: Network): string => {
    return this.clientUrl[network]
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
    if (network) {
      this.network = network
    } else {
      throw new Error('Network must be provided')
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
   * @returns {string} The bitcoin cash derivation path based on the network.
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
    const networkPath = utils.isTestnet(this.network) ? 'bch-testnet' : 'bch'
    return `https://www.blockchain.com/${networkPath}`
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
   * @returns {PrivateKey} The privkey generated from the given phrase
   *
   * @throws {"Invalid phrase"} Thrown if invalid phrase is provided.
   * */
  private getPrivateKey = (phrase: string): bitcash.PrivateKey => {
    try {
      const derive_path = this.derivePath()
      const mnemonic = new Mnemonic(phrase)
      const hdPrivKey: bitcash.HDPrivateKey = mnemonic.toHDPrivateKey().derive(derive_path)

      return bitcash.PrivateKey.fromObject(hdPrivKey.privateKey)
    } catch (error) {
      throw new Error('Invalid phrase')
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
  getAddress = (): Address => {
    if (this.phrase) {
      try {
        const privKey = this.getPrivateKey(this.phrase)
        const pubKey = bitcash.PublicKey.fromPrivateKey(privKey)
        const address = bitcash.Address.fromPublicKey(pubKey, utils.bchNetwork(this.getNetwork()))

        return address.toString()
      } catch (error) {
        throw new Error('Address not defined')
      }
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
   * Get the BCH balance of a given address.
   *
   * @param {Address} address By default, it will return the balance of the current wallet. (optional)
   * @returns {Array<Balance>} The BCH balance of the address.
   *
   * @throws {"Invalid address"} Thrown if the given address is an invalid address.
   */
  getBalance = async (address?: string): Promise<Balance[]> => {
    try {
      const response: AddressBalance = await axios
        .get(`${this.getClientURL()}/address/${address || this.getAddress()}/balance`)
        .then((response) => response.data)

      if (!response) {
        throw new Error('Invalid address')
      }

      return [
        {
          asset: utils.AssetBCH,
          amount: baseAmount(response.confirmed, BCH_DECIMAL),
        },
      ]
    } catch (error) {
      return Promise.reject(error)
    }
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
  getTransactionData = async (txId: string): Promise<Tx> => {
    try {
      const tx: Transaction = await axios
        .get(`${this.getClientURL()}/transaction/${txId}`)
        .then((response) => response.data)
      if (!tx) {
        throw new Error('Invalid TxID')
      }

      return {
        asset: utils.AssetBCH,
        from: tx.inputs
          .filter((input) => !!input.address)
          .map(
            (input) =>
              ({
                from: input.address,
                amount: baseAmount(input.value, BCH_DECIMAL),
              } as TxFrom),
          ),
        to: tx.outputs
          .filter((output) => !!output.address)
          .map(
            (output) =>
              ({
                to: output.address,
                amount: baseAmount(output.value, BCH_DECIMAL),
              } as TxTo),
          ),
        date: new Date(tx.time * 1000),
        type: 'transfer',
        hash: tx.txid,
      }
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
   * Transfer BCH.
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
