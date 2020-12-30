import {
  Address,
  Balances,
  Fees,
  Network,
  Tx,
  TxParams,
  TxHash,
  TxHistoryParams,
  TxsPage,
  XChainClient,
  XChainClientParams,
} from '@xchainjs/xchain-client'
import { Asset, baseAmount, assetToString } from '@xchainjs/xchain-util'
import * as xchainCrypto from '@xchainjs/xchain-crypto'

import { PrivKey, codec } from 'cosmos-client'
import { MsgSend, MsgMultiSend } from 'cosmos-client/x/bank'

import { CosmosSDKClient } from './cosmos/sdk-client'
import { AssetAtom, AssetMuon } from './types'
import { DECIMAL, getDenom, getAsset, getTxsFromHistory } from './util'

/**
 * Interface for custom Cosmos client
 */
export interface CosmosClient {
  getMainAsset(): Asset
}

/**
 * Custom Cosmos client
 */
class Client implements CosmosClient, XChainClient {
  private network: Network
  private sdkClient: CosmosSDKClient
  private phrase = ''
  private address: Address = '' // default address at index 0
  private privateKey: PrivKey | null = null // default private key at index 0

  /**
   * Constructor
   *
   * Client has to be initialised with network type and phrase.
   * It will throw an error if an invalid phrase has been passed.
   *
   * @param {XChainClientParams} params
   *
   * @throws {"Invalid phrase"} Thrown if the given phase is invalid.
   */
  constructor({ network = 'testnet', phrase }: XChainClientParams) {
    this.network = network
    this.sdkClient = new CosmosSDKClient({ server: this.getClientUrl(), chainId: this.getChainId() })

    if (phrase) this.setPhrase(phrase)
  }

  /**
   * Purge client.
   *
   * @returns {void}
   */
  purgeClient(): void {
    this.phrase = ''
    this.address = ''
    this.privateKey = null
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
  setNetwork = (network: Network): XChainClient => {
    if (!network) {
      throw new Error('Network must be provided')
    } else {
      this.network = network
      this.sdkClient = new CosmosSDKClient({ server: this.getClientUrl(), chainId: this.getChainId() })
      this.address = ''

      return this
    }
  }

  /**
   * Get the current network.
   *
   * @returns {Network} The current network. (`mainnet` or `testnet`)
   */
  getNetwork(): Network {
    return this.network
  }

  /**
   * Get the client url.
   *
   * @returns {string} The client url for cosmos chain based on the network.
   */
  getClientUrl = (): string => {
    return this.network === 'testnet' ? 'http://lcd.gaia.bigdipper.live:1317' : 'https://api.cosmos.network'
  }

  /**
   * Get the chain id.
   *
   * @returns {string} The chain id based on the network.
   */
  getChainId = (): string => {
    return this.network === 'testnet' ? 'gaia-3a' : 'cosmoshub-3'
  }

  /**
   * @private
   * Register message codecs.
   *
   * @returns {void}
   */
  private registerCodecs = (): void => {
    codec.registerCodec('cosmos-sdk/MsgSend', MsgSend, MsgSend.fromJSON)
    codec.registerCodec('cosmos-sdk/MsgMultiSend', MsgMultiSend, MsgMultiSend.fromJSON)
  }

  /**
   * Get the explorer url.
   *
   * @returns {string} The explorer url.
   */
  getExplorerUrl = (): string => {
    return this.network === 'testnet' ? 'https://gaia.bigdipper.live' : 'https://cosmos.bigdipper.live'
  }

  /**
   * Get the explorer url for the given address.
   *
   * @param {Address} address
   * @returns {string} The explorer url for the given address.
   */
  getExplorerAddressUrl = (address: Address): string => {
    return `${this.getExplorerUrl()}/account/${address}`
  }

  /**
   * Get the explorer url for the given transaction id.
   *
   * @param {string} txID
   * @returns {string} The explorer url for the given transaction id.
   */
  getExplorerTxUrl = (txID: string): string => {
    return `${this.getExplorerUrl()}/transactions/${txID}`
  }

  /**
   * Set/update a new phrase
   *
   * @param {string} phrase A new phrase.
   * @returns {Address} The address from the given phrase
   *
   * @throws {"Invalid phrase"}
   * Thrown if the given phase is invalid.
   */
  setPhrase = (phrase: string): Address => {
    if (this.phrase !== phrase) {
      if (!xchainCrypto.validatePhrase(phrase)) {
        throw new Error('Invalid phrase')
      }

      this.phrase = phrase
      this.privateKey = null
      this.address = ''
    }

    return this.getAddress()
  }

  /**
   * @private
   * Get private key.
   *
   * @returns {PrivKey} The privkey generated from the given phrase
   *
   * @throws {"Phrase not set"}
   * Throws an error if phrase has not been set before
   * */
  private getPrivateKey = (): PrivKey => {
    if (!this.privateKey) {
      if (!this.phrase) throw new Error('Phrase not set')

      this.privateKey = this.sdkClient.getPrivKeyFromMnemonic(this.phrase)
    }

    return this.privateKey
  }

  /**
   * Get the current address.
   *
   * @returns {Address} The current address.
   *
   * @throws {Error} Thrown if phrase has not been set before. A phrase is needed to create a wallet and to derive an address from it.
   */
  getAddress = (): string => {
    if (!this.address) {
      const address = this.sdkClient.getAddressFromPrivKey(this.getPrivateKey())
      if (!address) {
        throw new Error('address not defined')
      }

      this.address = address
    }

    return this.address
  }

  /**
   * Validate the given address.
   *
   * @param {Address} address
   * @returns {boolean} `true` or `false`
   */
  validateAddress = (address: Address): boolean => {
    return this.sdkClient.checkAddress(address)
  }

  /**
   * Get the main asset based on the network.
   *
   * @returns {string} The main asset based on the network.
   */
  getMainAsset = (): Asset => {
    return this.network === 'testnet' ? AssetMuon : AssetAtom
  }

  /**
   * Get the balance of a given address.
   *
   * @param {Address} address (optional) By default, it will return the balance of the current wallet.
   * @param {Asset} asset (optional) If not set, it will return all assets available.
   * @returns {Array<Balance>} The balance of the address.
   */
  getBalance = async (address?: Address, asset?: Asset): Promise<Balances> => {
    try {
      const balances = await this.sdkClient.getBalance(address || this.getAddress())
      const mainAsset = this.getMainAsset()

      return balances
        .map((balance) => {
          return {
            asset: (balance.denom && getAsset(balance.denom)) || mainAsset,
            amount: baseAmount(balance.amount, DECIMAL),
          }
        })
        .filter((balance) => !asset || assetToString(balance.asset) === assetToString(asset))
    } catch (error) {
      return Promise.reject(error)
    }
  }

  /**
   * Get transaction history of a given address with pagination options.
   * By default it will return the transaction history of the current wallet.
   *
   * @param {TxHistoryParams} params (optional) The options to get transaction history.
   * @returns {TxsPage} The transaction history.
   */
  getTransactions = async (params?: TxHistoryParams): Promise<TxsPage> => {
    const messageAction = undefined
    const messageSender = (params && params.address) || this.getAddress()
    const page = (params && params.offset) || undefined
    const limit = (params && params.limit) || undefined
    const txMinHeight = undefined
    const txMaxHeight = undefined

    try {
      this.registerCodecs()

      const mainAsset = this.getMainAsset()
      const txHistory = await this.sdkClient.searchTx({
        messageAction,
        messageSender,
        page,
        limit,
        txMinHeight,
        txMaxHeight,
      })

      return {
        total: parseInt(txHistory.total_count?.toString() || '0'),
        txs: getTxsFromHistory(txHistory.txs || [], mainAsset),
      }
    } catch (error) {
      return Promise.reject(error)
    }
  }

  /**
   * Get the transaction details of a given transaction id.
   *
   * @param {string} txId The transaction id.
   * @returns {Tx} The transaction details of the given transaction id.
   */
  getTransactionData = async (txId: string): Promise<Tx> => {
    try {
      const txResult = await this.sdkClient.txsHashGet(txId)
      const txs = getTxsFromHistory([txResult], this.getMainAsset())

      if (txs.length === 0) {
        throw new Error('transaction not found')
      }

      return txs[0]
    } catch (error) {
      return Promise.reject(error)
    }
  }

  /**
   * Transfer balances.
   *
   * @param {TxParams} params The transfer options.
   * @returns {TxHash} The transaction hash.
   */
  transfer = async ({ asset, amount, recipient, memo }: TxParams): Promise<TxHash> => {
    try {
      this.registerCodecs()

      const mainAsset = this.getMainAsset()
      const transferResult = await this.sdkClient.transfer({
        privkey: this.getPrivateKey(),
        from: this.getAddress(),
        to: recipient,
        amount: amount.amount().toString(),
        asset: getDenom(asset || mainAsset),
        memo,
      })

      return transferResult?.txhash || ''
    } catch (error) {
      return Promise.reject(error)
    }
  }

  /**
   * Get the current fee.
   *
   * @returns {Fees} The current fee.
   */
  getFees = async (): Promise<Fees> => {
    // there is no fixed fee, we set fee amount when creating a transaction.
    return Promise.resolve({
      type: 'base',
      fast: baseAmount(750, DECIMAL),
      fastest: baseAmount(2500, DECIMAL),
      average: baseAmount(0, DECIMAL),
    })
  }
}

export { Client }
