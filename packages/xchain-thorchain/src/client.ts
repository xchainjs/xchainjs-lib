import axios from 'axios'
import {
  RootDerivationPaths,
  Address,
  Fees,
  Network,
  Tx,
  TxParams,
  TxHash,
  TxHistoryParams,
  TxsPage,
  XChainClient,
  XChainClientParams,
  TxFrom,
  TxTo,
} from '@thorwallet/xchain-client'
import { CosmosSDKClient, RPCTxResult } from '@thorwallet/xchain-cosmos'
import { baseAmount, assetFromString } from '@thorwallet/xchain-util'
import * as xchainCrypto from '@thorwallet/xchain-crypto'

import { PrivKey, AccAddress, PubKey } from '@thorwallet/cosmos-client'
import { StdTx } from '@thorwallet/cosmos-client/x/auth'

import { AssetRune, DepositParam, ClientUrl, ThorchainClientParams, NodeUrl, ExplorerUrls, TxData } from './types'
import { msgNativeTxFromJson, TxResult } from './types/messages'
import {
  getDenom,
  getDefaultFees,
  DECIMAL,
  DEFAULT_GAS_VALUE,
  buildDepositTx,
  getDenomWithChain,
  isBroadcastSuccess,
  getPrefix,
  registerCodecs,
  MAX_TX_COUNT,
  getDefaultClientUrl,
  getDefaultExplorerUrls,
  getExplorerAddressUrl,
  getExplorerTxUrl,
  getDepositTxDataFromLogs,
} from './util'
import { Signature } from './types'
import RNSimple from 'react-native-simple-crypto'
import { getBalance } from './get-balance'
import { getAddress } from './get-address'

/**
 * Interface for custom Thorchain client
 */
export interface ThorchainClient {
  setClientUrl(clientUrl: ClientUrl): void

  getClientUrl(): NodeUrl

  setExplorerUrls(explorerUrls: ExplorerUrls): void

  getCosmosClient(): CosmosSDKClient

  deposit(params: DepositParam): Promise<TxHash>
}

/**
 * Custom Thorchain Client
 */
class Client implements ThorchainClient, XChainClient {
  private network: Network
  private clientUrl: ClientUrl
  private explorerUrls: ExplorerUrls
  private phrase = ''
  private rootDerivationPaths: RootDerivationPaths
  private cosmosClient: CosmosSDKClient

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
  constructor({
    network = 'testnet',
    clientUrl,
    explorerUrls,
    rootDerivationPaths = {
      mainnet: "44'/931'/0'/0/",
      testnet: "44'/931'/0'/0/",
    },
  }: XChainClientParams & ThorchainClientParams) {
    this.network = network
    this.clientUrl = clientUrl || getDefaultClientUrl()
    this.explorerUrls = explorerUrls || getDefaultExplorerUrls()
    this.rootDerivationPaths = rootDerivationPaths

    this.cosmosClient = new CosmosSDKClient({
      server: this.getClientUrl().node,
      chainId: this.getChainId(),
      prefix: getPrefix(this.network),
    })
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
    }

    this.network = network
    this.cosmosClient.updatePrefix(getPrefix(this.network))
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
  }

  /**
   * Get the client url.
   *
   * @returns {NodeUrl} The client url for thorchain based on the current network.
   */
  getClientUrl = (): NodeUrl => this.clientUrl[this.network]

  /**
   * Set/update the explorer URLs.
   *
   * @param {ExplorerUrls} urls The explorer urls to be set.
   * @returns {void}
   */
  setExplorerUrls = (urls: ExplorerUrls): void => {
    this.explorerUrls = urls
  }

  /**
   * Get the explorer url.
   *
   * @returns {string} The explorer url for thorchain based on the current network.
   */
  getExplorerUrl = (): string => {
    return this.explorerUrls.root[this.network]
  }

  /**
   * Get cosmos client
   * @returns {CosmosSDKClient} current cosmos client
   */
  getCosmosClient = (): CosmosSDKClient => this.cosmosClient

  /**
   * Get the chain id.
   *
   * @returns {string} The chain id based on the network.
   */
  getChainId = (): string => {
    return 'thorchain'
  }

  /**
   * Get the explorer url for the given address.
   *
   * @param {Address} address
   * @returns {string} The explorer url for the given address.
   */
  getExplorerAddressUrl = (address: Address): string =>
    getExplorerAddressUrl({ urls: this.explorerUrls, network: this.network, address })

  /**
   * Get the explorer url for the given transaction id.
   *
   * @param {string} txID
   * @returns {string} The explorer url for the given transaction id.
   */
  getExplorerTxUrl = (txID: string): string =>
    getExplorerTxUrl({ urls: this.explorerUrls, network: this.network, txID })

  /**
   * Set/update a new phrase
   *
   * @param {string} phrase A new phrase.
   * @returns {Address} The address from the given phrase
   *
   * @throws {"Invalid phrase"}
   * Thrown if the given phase is invalid.
   */
  setPhrase = (phrase: string, walletIndex = 0): Promise<Address> => {
    if (this.phrase !== phrase) {
      if (!xchainCrypto.validatePhrase(phrase)) {
        throw new Error('Invalid phrase')
      }
      this.phrase = phrase
    }

    return getAddress({ phrase, network: this.getNetwork(), index: walletIndex })
  }

  /**
   * Get getFullDerivationPath
   *
   * @param {number} index the HD wallet index
   * @returns {string} The bitcoin derivation path based on the network.
   */
  getFullDerivationPath(index: number): string {
    return this.rootDerivationPaths[this.network] + `${index}`
  }

  /**
   * Get private key
   *
   * @param {number} index the HD wallet index (optional)
   * @returns {PrivKey} The private key generated from the given phrase
   *
   * @throws {"Phrase not set"}
   * Throws an error if phrase has not been set before
   * */
  getPrivKey(index = 0): Promise<PrivKey> {
    return this.cosmosClient.getPrivKeyFromMnemonic(this.phrase, this.getFullDerivationPath(index))
  }

  /**
   * Get public key
   *
   * @param {number} index the HD wallet index (optional)
   *
   * @returns {PubKey} The public key generated from the given phrase
   *
   * @throws {"Phrase not set"}
   * Throws an error if phrase has not been set before
   **/
  async getPubKey(index = 0): Promise<PubKey> {
    return (await this.getPrivKey(index)).getPubKey()
  }

  /**
   * Validate the given address.
   *
   * @param {Address} address
   * @returns {boolean} `true` or `false`
   */
  validateAddress = (address: Address): boolean => {
    return this.cosmosClient.checkAddress(address)
  }

  /**
   * Get transaction history of a given address with pagination options.
   * By default it will return the transaction history of the current wallet.
   *
   * @param {TxHistoryParams} params The options to get transaction history. (optional)
   * @returns {TxsPage} The transaction history.
   */
  getTransactions = async (
    params?: TxHistoryParams & { filterFn?: (tx: RPCTxResult) => boolean },
  ): Promise<TxsPage> => {
    const messageAction = undefined
    const offset = params?.offset || 0
    const limit = params?.limit || 10
    const address =
      params?.address ||
      (await getAddress({
        index: 0,
        network: this.getNetwork(),
        phrase: this.phrase,
      }))
    const txMinHeight = undefined
    const txMaxHeight = undefined

    try {
      registerCodecs(this.network)

      const txIncomingHistory = (
        await this.cosmosClient.searchTxFromRPC({
          rpcEndpoint: this.getClientUrl().rpc,
          messageAction,
          transferRecipient: address,
          limit: MAX_TX_COUNT,
          txMinHeight,
          txMaxHeight,
        })
      ).txs
      const txOutgoingHistory = (
        await this.cosmosClient.searchTxFromRPC({
          rpcEndpoint: this.getClientUrl().rpc,
          messageAction,
          transferSender: address,
          limit: MAX_TX_COUNT,
          txMinHeight,
          txMaxHeight,
        })
      ).txs

      let history: RPCTxResult[] = [...txIncomingHistory, ...txOutgoingHistory]
        .sort((a, b) => {
          if (a.height !== b.height) return parseInt(b.height) > parseInt(a.height) ? 1 : -1
          if (a.hash !== b.hash) return a.hash > b.hash ? 1 : -1
          return 0
        })
        .reduce(
          (acc, tx) => [...acc, ...(acc.length === 0 || acc[acc.length - 1].hash !== tx.hash ? [tx] : [])],
          [] as RPCTxResult[],
        )
        .filter(params?.filterFn ? params.filterFn : (tx) => tx)
        .filter((_, index) => index < MAX_TX_COUNT)

      // get `total` before filtering txs out for pagination
      const total = history.length

      history = history.filter((_, index) => index >= offset && index < offset + limit)

      const txs = await Promise.all(history.map(({ hash }) => this.getTransactionData(hash, address)))

      return {
        total,
        txs,
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
  getTransactionData = async (txId: string, address: Address): Promise<Tx> => {
    try {
      const txResult = await this.cosmosClient.txsHashGet(txId)
      const txData: TxData | null = txResult.logs ? getDepositTxDataFromLogs(txResult.logs, address) : null

      if (!txData) {
        throw new Error(`Failed to get transaction data (tx-hash: ${txId})`)
      }

      const { from, to, type } = txData

      return {
        hash: txId,
        asset: AssetRune,
        from,
        to,
        date: new Date(txResult.timestamp),
        type,
        binanceFee: null,
        confirmations: null,
        ethCumulativeGasUsed: null,
        ethGas: null,
        ethGasPrice: null,
        ethGasUsed: null,
        ethTokenName: null,
        ethTokenSymbol: null,
        memo: (txResult.tx as StdTx).memo ?? null,
      }
    } catch (error) {
      return Promise.reject(error)
    }
  }

  /**
   * Get the transaction details of a given transaction id. (from /thorchain/txs/hash)
   *
   * Node: /thorchain/txs/hash response doesn't have timestamp field.
   *
   * @param {string} txId The transaction id.
   * @returns {Tx} The transaction details of the given transaction id.
   */
  getDepositTransaction = async (txId: string): Promise<Omit<Tx, 'date'>> => {
    try {
      const result: TxResult = await axios
        .get(`${this.getClientUrl().node}/thorchain/tx/${txId}`)
        .then((response) => response.data)

      if (!result || !result.observed_tx) {
        throw new Error('transaction not found')
      }

      const from: TxFrom[] = []
      const to: TxTo[] = []
      let asset
      result.observed_tx.tx.coins.forEach((coin) => {
        from.push({
          from: result.observed_tx.tx.from_address,
          amount: baseAmount(coin.amount, DECIMAL),
        })
        to.push({
          to: result.observed_tx.tx.to_address,
          amount: baseAmount(coin.amount, DECIMAL),
        })
        asset = assetFromString(coin.asset)
      })

      return {
        asset: asset || AssetRune,
        from,
        to,
        type: 'transfer',
        hash: txId,
        binanceFee: null,
        confirmations: null,
        ethCumulativeGasUsed: null,
        ethGas: null,
        ethGasPrice: null,
        ethGasUsed: null,
        ethTokenName: null,
        ethTokenSymbol: null,
        memo: result.observed_tx.tx.memo,
      }
    } catch (error) {
      return Promise.reject(error)
    }
  }

  /**
   * Transaction with MsgNativeTx.
   *
   * @param {DepositParam} params The transaction options.
   * @returns {TxHash} The transaction hash.
   *
   * @throws {"insufficient funds"} Thrown if the wallet has insufficient funds.
   * @throws {"failed to broadcast transaction"} Thrown if failed to broadcast transaction.
   */
  deposit = async ({ walletIndex = 0, asset = AssetRune, amount, memo }: DepositParam): Promise<TxHash> => {
    const assetBalance = await getBalance({
      address: await getAddress({
        index: walletIndex,
        network: this.getNetwork(),
        phrase: this.phrase,
      }),
      assets: [asset],
      network: this.network,
    })

    if (assetBalance.length === 0 || assetBalance[0].amount.amount().lt(amount.amount().plus(DEFAULT_GAS_VALUE))) {
      throw new Error('insufficient funds')
    }

    const signer = await getAddress({
      index: walletIndex,
      network: this.getNetwork(),
      phrase: this.phrase,
    })
    const msgNativeTx = msgNativeTxFromJson({
      coins: [
        {
          asset: getDenomWithChain(asset),
          amount: amount.amount().toString(),
        },
      ],
      memo,
      signer,
    })

    const unsignedStdTx: StdTx = await buildDepositTx(msgNativeTx, this.getClientUrl().node)
    const privateKey = await this.getPrivKey(walletIndex)
    const accAddress = AccAddress.fromBech32(signer)

    return (await this.cosmosClient.signAndBroadcast(unsignedStdTx, privateKey, accAddress))?.txhash ?? ''
  }

  /**
   * Sign an arbitrary string message.
   *
   *
   * @returns {Signature} The current address.
   *
   * @throws {"Phrase must be provided"} Thrown if phrase has not been set before.
   */
  signMessage = async (msg: string, index = 0): Promise<Signature> => {
    const msgHash = await RNSimple.SHA.sha256(msg)
    const msgBuffer = Buffer.from(msgHash, 'hex')

    const pk = await this.getPrivKey(index)
    const signature = pk.sign(msgBuffer).toString('hex')
    const pubKey = pk.getPubKey().toBuffer().toString('hex')

    return { signature, pubKey }
  }

  /**
   * Transfer balances with MsgSend
   *
   * @param {TxParams} params The transfer options.
   * @returns {TxHash} The transaction hash.
   */
  transfer = async ({ walletIndex = 0, asset = AssetRune, amount, recipient, memo }: TxParams): Promise<TxHash> => {
    try {
      registerCodecs(this.network)

      const assetBalance = await getBalance({
        address: await getAddress({
          index: walletIndex,
          network: this.getNetwork(),
          phrase: this.phrase,
        }),
        assets: [asset],
        network: this.network,
      })
      const fee = await this.getFees()
      if (assetBalance.length === 0 || assetBalance[0].amount.amount().lt(amount.amount().plus(fee.average.amount()))) {
        throw new Error('insufficient funds')
      }

      const transferResult = await this.cosmosClient.transfer({
        privkey: await this.getPrivKey(walletIndex),
        from: await getAddress({
          index: walletIndex,
          network: this.getNetwork(),
          phrase: this.phrase,
        }),
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

  /**
   * Get the fees.
   *
   * @returns {Fees}
   */
  getFees = async (): Promise<Fees> => {
    return Promise.resolve(getDefaultFees())
  }
}

export { Client }
