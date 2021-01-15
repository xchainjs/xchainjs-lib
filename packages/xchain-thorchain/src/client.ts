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
import { CosmosSDKClient } from '@xchainjs/xchain-cosmos'
import { Asset, baseAmount, assetToString } from '@xchainjs/xchain-util'
import * as xchainCrypto from '@xchainjs/xchain-crypto'

import { PrivKey, codec, Msg, AccAddress } from 'cosmos-client'
import { StdTx } from 'cosmos-client/x/auth'
import { MsgSend, MsgMultiSend } from 'cosmos-client/x/bank'

import { AssetRune, DepositParam, ClientUrl, ThorchainClientParams, ExplorerUrl } from './types'
import { MsgNativeTx, msgNativeTxFromJson } from './types/messages'
import {
  getDenom,
  getAsset,
  getDefaultFees,
  getTxsFromHistory,
  DECIMAL,
  DEFAULT_GAS_VALUE,
  getDenomWithChain,
  isBroadcastSuccess,
  getPrefix,
} from './util'

/**
 * Interface for custom Thorchain client
 */
export interface ThorchainClient {
  setClientUrl(clientUrl: ClientUrl): void
  getClientUrl(): string
  setExplorerUrl(explorerUrl: ExplorerUrl): void

  deposit(params: DepositParam): Promise<TxHash>
}

/**
 * Custom Thorchain Client
 */
class Client implements ThorchainClient, XChainClient {
  private network: Network
  private clientUrl: ClientUrl
  private explorerUrl: ExplorerUrl
  private thorClient: CosmosSDKClient
  private phrase = ''
  private address: Address = ''
  private privateKey: PrivKey | null = null

  private derive_path = "44'/931'/0'/0/0"

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
  constructor({ network = 'testnet', phrase, clientUrl, explorerUrl }: XChainClientParams & ThorchainClientParams) {
    this.network = network
    this.clientUrl = clientUrl || this.getDefaultClientUrl()
    this.explorerUrl = explorerUrl || this.getDefaultExplorerUrl()
    this.thorClient = this.getNewThorClient()

    if (phrase) this.setPhrase(phrase)
  }

  /**
   * Purge client.
   *
   * @returns {void}
   */
  purgeClient = (): void => {
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
      this.thorClient = this.getNewThorClient()
      this.address = ''

      return this
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
   * Set/update the client URL.
   *
   * @param {ClientUrl} clientUrl The client url to be set.
   * @returns {void}
   */
  setClientUrl = (clientUrl: ClientUrl): void => {
    this.clientUrl = clientUrl
    this.thorClient = this.getNewThorClient()
  }

  /**
   * Get the client url.
   *
   * @returns {string} The client url for thorchain based on the current network.
   */
  getClientUrl = (): string => {
    return this.getClientUrlByNetwork(this.network)
  }

  /**
   * Get the client url.
   *
   * @returns {ClientUrl} The client url (both mainnet and testnet) for thorchain.
   */
  private getDefaultClientUrl = (): ClientUrl => {
    return {
      testnet: 'https://testnet.thornode.thorchain.info',
      mainnet: 'http://138.68.125.107:1317',
    }
  }

  /**
   * Get the client url.
   *
   * @param {Network} network
   * @returns {string} The client url for thorchain based on the network.
   */
  private getClientUrlByNetwork = (network: Network): string => {
    return this.clientUrl[network]
  }

  /**
   * Set/update the explorer URL.
   *
   * @param {ExplorerUrl} explorerUrl The explorer url to be set.
   * @returns {void}
   */
  setExplorerUrl = (explorerUrl: ExplorerUrl): void => {
    this.explorerUrl = explorerUrl
  }

  /**
   * Get the explorer url.
   *
   * @returns {string} The explorer url for thorchain based on the current network.
   */
  getExplorerUrl = (): string => {
    return this.getExplorerUrlByNetwork(this.network)
  }

  /**
   * Get the explorer url.
   *
   * @returns {ExplorerUrl} The explorer url (both mainnet and testnet) for thorchain.
   */
  private getDefaultExplorerUrl = (): ExplorerUrl => {
    return {
      testnet: 'https://testnet.thorchain.net',
      mainnet: 'https://thorchain.net',
    }
  }

  /**
   * Get the explorer url.
   *
   * @param {Network} network
   * @returns {string} The explorer url for thorchain based on the network.
   */
  private getExplorerUrlByNetwork = (network: Network): string => {
    return this.explorerUrl[network]
  }

  /**
   * @private
   * Get new thorchain client.
   *
   * @returns {CosmosSDKClient} The new thorchain client.
   */
  private getNewThorClient = (): CosmosSDKClient => {
    return new CosmosSDKClient({
      server: this.getClientUrl(),
      chainId: this.getChainId(),
      prefix: getPrefix(this.network),
      derive_path: this.derive_path,
    })
  }

  /**
   * Get the chain id.
   *
   * @returns {string} The chain id based on the network.
   */
  getChainId = (): string => {
    return 'thorchain'
  }

  /**
   * @private
   * Register message codecs.
   *
   * @returns {void}
   */
  private registerCodecs = (): void => {
    codec.registerCodec('thorchain/MsgSend', MsgSend, MsgSend.fromJSON)
    codec.registerCodec('thorchain/MsgMultiSend', MsgMultiSend, MsgMultiSend.fromJSON)
    codec.registerCodec('thorchain/MsgNativeTx', MsgNativeTx, msgNativeTxFromJson)
  }

  /**
   * Get the explorer url for the given address.
   *
   * @param {Address} address
   * @returns {string} The explorer url for the given address.
   */
  getExplorerAddressUrl = (address: Address): string => {
    return `${this.getExplorerUrl()}/addresses/${address}`
  }

  /**
   * Get the explorer url for the given transaction id.
   *
   * @param {string} txID
   * @returns {string} The explorer url for the given transaction id.
   */
  getExplorerTxUrl = (txID: string): string => {
    return `${this.getExplorerUrl()}/txs/${txID}`
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
   * @returns {PrivKey} The private key generated from the given phrase
   *
   * @throws {"Phrase not set"}
   * Throws an error if phrase has not been set before
   * */
  private getPrivateKey = (): PrivKey => {
    if (!this.privateKey) {
      if (!this.phrase) throw new Error('Phrase not set')

      this.privateKey = this.thorClient.getPrivKeyFromMnemonic(this.phrase)
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
      const address = this.thorClient.getAddressFromPrivKey(this.getPrivateKey())
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
    return this.thorClient.checkAddress(address)
  }

  /**
   * Get the balance of a given address.
   *
   * @param {Address} address By default, it will return the balance of the current wallet. (optional)
   * @param {Asset} asset If not set, it will return all assets available. (optional)
   * @returns {Array<Balance>} The balance of the address.
   */
  getBalance = async (address?: Address, asset?: Asset): Promise<Balances> => {
    try {
      const balances = await this.thorClient.getBalance(address || this.getAddress())
      return balances
        .map((balance) => ({
          asset: (balance.denom && getAsset(balance.denom)) || AssetRune,
          amount: baseAmount(balance.amount, DECIMAL),
        }))
        .filter((balance) => !asset || assetToString(balance.asset) === assetToString(asset))
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
  getTransactions = async (params?: TxHistoryParams): Promise<TxsPage> => {
    const messageAction = undefined
    const messageSender = (params && params.address) || this.getAddress()
    const offset = params?.offset || undefined
    const limit = params?.limit || undefined
    const page = limit && offset ? Math.floor(offset / limit) + 1 : undefined
    const txMinHeight = undefined
    const txMaxHeight = undefined

    try {
      this.registerCodecs()

      const txHistory = await this.thorClient.searchTx({
        messageAction,
        messageSender,
        page,
        limit,
        txMinHeight,
        txMaxHeight,
      })

      return {
        total: parseInt(txHistory.total_count?.toString() || '0'),
        txs: getTxsFromHistory(txHistory.txs || [], AssetRune),
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
      const txResult = await this.thorClient.txsHashGet(txId)
      const txs = getTxsFromHistory([txResult], AssetRune)

      if (txs.length === 0) {
        throw new Error('transaction not found')
      }

      return txs[0]
    } catch (error) {
      return Promise.reject(error)
    }
  }

  /**
   * Transaction with MsgNativeTx.
   *
   * @param {DepositParam} params The transaction options.
   * @returns {TxHash} The transaction hash.
   */
  deposit = async ({ asset = AssetRune, amount, memo }: DepositParam): Promise<TxHash> => {
    try {
      this.registerCodecs()

      const assetBalance = await this.getBalance(this.getAddress(), asset)
      const fee = await this.getFees()
      if (assetBalance.length === 0 || assetBalance[0].amount.amount().lt(amount.amount().plus(fee.average.amount()))) {
        throw new Error('insufficient funds')
      }

      const signer = this.getAddress()

      const msg: Msg = [
        msgNativeTxFromJson({
          coins: [
            {
              asset: getDenomWithChain(asset),
              amount: amount.amount().toString(),
            },
          ],
          memo,
          signer,
        }),
      ]

      const unsignedStdTx = StdTx.fromJSON({
        msg,
        fee: {
          amount: [],
          gas: DEFAULT_GAS_VALUE,
        },
        signatures: [],
        memo: '',
      })

      const transferResult = await this.thorClient.signAndBroadcast(
        unsignedStdTx,
        this.getPrivateKey(),
        AccAddress.fromBech32(signer),
      )

      if (!isBroadcastSuccess(transferResult)) {
        throw new Error(`failed to broadcast transaction: ${transferResult.txhash}`)
      }

      return transferResult?.txhash || ''
    } catch (error) {
      return Promise.reject(error)
    }
  }

  /**
   * Transfer balances with MsgSend
   *
   * @param {TxParams} params The transfer options.
   * @returns {TxHash} The transaction hash.
   */
  transfer = async ({ asset = AssetRune, amount, recipient, memo }: TxParams): Promise<TxHash> => {
    try {
      this.registerCodecs()

      const assetBalance = await this.getBalance(this.getAddress(), asset)
      const fee = await this.getFees()
      if (assetBalance.length === 0 || assetBalance[0].amount.amount().lt(amount.amount().plus(fee.average.amount()))) {
        throw new Error('insufficient funds')
      }

      const transferResult = await this.thorClient.transfer({
        privkey: this.getPrivateKey(),
        from: this.getAddress(),
        to: recipient,
        amount: amount.amount().toString(),
        asset: getDenom(asset),
        memo,
        fee: {
          amount: [],
          gas: DEFAULT_GAS_VALUE,
        },
      })

      if (!isBroadcastSuccess(transferResult)) {
        throw new Error(`failed to broadcast transaction: ${transferResult.txhash}`)
      }

      return transferResult?.txhash || ''
    } catch (error) {
      return Promise.reject(error)
    }
  }

  getFees = async (): Promise<Fees> => {
    return Promise.resolve(getDefaultFees())
  }
}

export { Client }
