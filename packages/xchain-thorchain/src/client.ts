import axios from 'axios'
import {
  RootDerivationPaths,
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
  Txs,
  TxFrom,
  TxTo,
} from '@xchainjs/xchain-client'
import { CosmosSDKClient, RPCTxResult } from '@xchainjs/xchain-cosmos'
import { Asset, baseAmount, assetToString, assetFromString } from '@xchainjs/xchain-util'
import * as xchainCrypto from '@xchainjs/xchain-crypto'

import { PrivKey, AccAddress } from 'cosmos-client'
import { StdTx } from 'cosmos-client/x/auth'

import { AssetRune, DepositParam, ClientUrl, ThorchainClientParams, ExplorerUrl, NodeUrl } from './types'
import { MsgNativeTx, msgNativeTxFromJson, ThorchainDepositResponse, TxResult } from './types/messages'
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
  registerCodecs,
  getTxType,
  getDefaultExplorerUrl,
  MAX_TX_COUNT,
  MSG_DEPOSIT,
  MSG_SEND,
} from './util'

/**
 * Interface for custom Thorchain client
 */
export interface ThorchainClient {
  setClientUrl(clientUrl: ClientUrl): void
  getClientUrl(): NodeUrl
  setExplorerUrl(explorerUrl: ExplorerUrl): void
  getExplorerNodeUrl(node: Address): string
  getCosmosClient(): CosmosSDKClient

  deposit(params: DepositParam): Promise<TxHash>
}

/**
 * Custom Thorchain Client
 */
class Client implements ThorchainClient, XChainClient {
  private network: Network
  private clientUrl: ClientUrl
  private explorerUrl: ExplorerUrl
  private phrase = ''
  private rootDerivationPaths: RootDerivationPaths

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
    phrase,
    clientUrl,
    explorerUrl,
    rootDerivationPaths = {
      mainnet: "44'/931'/0'/0/0",
      testnet: "44'/931'/0'/0/0",
    },
  }: XChainClientParams & ThorchainClientParams) {
    this.network = network
    this.clientUrl = clientUrl || this.getDefaultClientUrl()
    this.explorerUrl = explorerUrl || getDefaultExplorerUrl()
    this.rootDerivationPaths = rootDerivationPaths

    if (phrase) this.setPhrase(phrase)
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
  getClientUrl = (): NodeUrl => {
    return this.getClientUrlByNetwork(this.network)
  }

  /**
   * Get the client url.
   *
   * @returns {ClientUrl} The client url (both mainnet and testnet) for thorchain.
   */
  private getDefaultClientUrl = (): ClientUrl => {
    return {
      testnet: {
        node: 'https://testnet.thornode.thorchain.info',
        rpc: 'https://testnet.rpc.thorchain.info',
      },
      mainnet: {
        node: 'https://thornode.thorchain.info',
        rpc: 'https://rpc.thorchain.info',
      },
    }
  }

  /**
   * Get the client url.
   *
   * @param {Network} network
   * @returns {NodeUrl} The client url (both node, rpc) for thorchain based on the network.
   */
  private getClientUrlByNetwork = (network: Network): NodeUrl => {
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
   * @param {Network} network
   * @returns {string} The explorer url for thorchain based on the network.
   */
  private getExplorerUrlByNetwork = (network: Network): string => {
    return this.explorerUrl[network]
  }

  /**
   * @private
   * @param {number} index
   * Get new thorchain client.
   *
   * @returns {CosmosSDKClient} The new thorchain client.
   */
  private getNewThorClient = (index = 0): CosmosSDKClient =>
    new CosmosSDKClient({
      server: this.getClientUrl().node,
      chainId: this.getChainId(),
      prefix: getPrefix(this.network),
      derive_path: this.getFullDerivationPath(index),
    })

  /**
   * Get cosmos client
   * @returns {CosmosSDKClient} current cosmos client
   */
  getCosmosClient = (index = 0): CosmosSDKClient => {
    return this.getNewThorClient(index)
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
   * Get the explorer url for the given address.
   *
   * @param {Address} address
   * @returns {string} The explorer url for the given address.
   */
  getExplorerAddressUrl = (address: Address): string => {
    return `${this.getExplorerUrl()}/address/${address}`
  }

  /**
   * Get the explorer url for the given node.
   *
   * @param {Address} node address
   * @returns {string} The explorer url for the given node.
   */
  getExplorerNodeUrl = (address: Address): string => {
    return `${this.getExplorerUrl()}/nodes/${address}`
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
    }

    return this.getAddress()
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
   * @private
   * Get private key.
   *
   * @returns {PrivKey} The private key generated from the given phrase
   *
   * @throws {"Phrase not set"}
   * Throws an error if phrase has not been set before
   * */
  private getPrivateKey = (index = 0, thorClient?: CosmosSDKClient): PrivKey =>
    (thorClient || this.getNewThorClient(index)).getPrivKeyFromMnemonic(this.phrase)

  /**
   * Get the current address.
   *
   * @returns {Address} The current address.
   *
   * @throws {Error} Thrown if phrase has not been set before. A phrase is needed to create a wallet and to derive an address from it.
   */
  getAddress = (index = 0): string => {
    const thorClient = this.getNewThorClient(index)
    const address = thorClient.getAddressFromPrivKey(this.getPrivateKey(index, thorClient))
    if (!address) {
      throw new Error('address not defined')
    }

    return address
  }

  /**
   * Validate the given address.
   *
   * @param {Address} address
   * @returns {boolean} `true` or `false`
   */
  validateAddress = (address: Address): boolean => {
    return this.getNewThorClient(0).checkAddress(address)
  }

  /**
   * Get the balance of a given address.
   *
   * @param {Address} address By default, it will return the balance of the current wallet. (optional)
   * @param {Asset} asset If not set, it will return all assets available. (optional)
   * @returns {Array<Balance>} The balance of the address.
   */
  getBalance = async (address: Address, assets?: Asset[]): Promise<Balances> => {
    try {
      const balances = await this.getNewThorClient().getBalance(address)
      return balances
        .map((balance) => ({
          asset: (balance.denom && getAsset(balance.denom)) || AssetRune,
          amount: baseAmount(balance.amount, DECIMAL),
        }))
        .filter(
          (balance) =>
            !assets || assets.filter((asset) => assetToString(balance.asset) === assetToString(asset)).length,
        )
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
  getTransactions = async (
    params?: TxHistoryParams & { filterFn?: (tx: RPCTxResult) => boolean },
  ): Promise<TxsPage> => {
    const messageAction = undefined
    const offset = params?.offset || 0
    const limit = params?.limit || 10
    const txMinHeight = undefined
    const txMaxHeight = undefined

    try {
      registerCodecs(this.network)

      const txIncomingHistory = (
        await this.getNewThorClient().searchTxFromRPC({
          rpcEndpoint: this.getClientUrl().rpc,
          messageAction,
          transferRecipient: params?.address,
          limit: MAX_TX_COUNT,
          txMinHeight,
          txMaxHeight,
        })
      ).txs
      const txOutgoingHistory = (
        await this.getNewThorClient().searchTxFromRPC({
          rpcEndpoint: this.getClientUrl().rpc,
          messageAction,
          transferSender: params?.address,
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
        .filter(
          params?.filterFn
            ? params.filterFn
            : (tx) => {
                const action = getTxType(tx.tx_result.data, 'base64')
                return action === MSG_DEPOSIT || action === MSG_SEND
              },
        )
        .filter((_, index) => index < MAX_TX_COUNT)

      const total = history.length

      history = history.filter((_, index) => index >= offset && index < offset + limit)

      const txs: Txs = []
      for (const tx of history) {
        txs.push(await this.getTransactionData(tx.hash))
      }

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
  getTransactionData = async (txId: string): Promise<Tx> => {
    try {
      const txResult = await this.getNewThorClient(0).txsHashGet(txId)
      const action = getTxType(txResult.data, 'hex')
      let txs: Txs = []

      if (action === MSG_DEPOSIT) {
        txs = [
          {
            ...(await this.getDepositTransaction(txId)),
            date: new Date(txResult.timestamp),
          },
        ]
      } else {
        txs = getTxsFromHistory([txResult], this.network)
      }

      if (txs.length === 0) {
        throw new Error('transaction not found')
      }

      return txs[0]
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
      }
    } catch (error) {
      return Promise.reject(error)
    }
  }

  /**
   * Structure StdTx from MsgNativeTx.
   *
   * @param {string} txId The transaction id.
   * @returns {Tx} The transaction details of the given transaction id.
   *
   * @throws {"Invalid client url"} Thrown if the client url is an invalid one.
   */
  private buildDepositTx = async (msgNativeTx: MsgNativeTx): Promise<StdTx> => {
    try {
      const response: ThorchainDepositResponse = await axios
        .post(`${this.getClientUrl().node}/thorchain/deposit`, {
          coins: msgNativeTx.coins,
          memo: msgNativeTx.memo,
          base_req: {
            chain_id: 'thorchain',
            from: msgNativeTx.signer,
          },
        })
        .then((response) => response.data)

      if (!response || !response.value) {
        throw new Error('Invalid client url')
      }

      const unsignedStdTx = StdTx.fromJSON({
        msg: response.value.msg,
        fee: response.value.fee,
        signatures: [],
        memo: '',
      })

      return unsignedStdTx
    } catch (error) {
      return Promise.reject(new Error('Invalid client url'))
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
  deposit = async ({ from = 0, asset = AssetRune, amount, memo }: DepositParam): Promise<TxHash> => {
    try {
      const assetBalance = await this.getBalance(this.getAddress(from), [asset])

      if (assetBalance.length === 0 || assetBalance[0].amount.amount().lt(amount.amount().plus(DEFAULT_GAS_VALUE))) {
        throw new Error('insufficient funds')
      }

      const signer = this.getAddress()
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

      const unsignedStdTx = await this.buildDepositTx(msgNativeTx)
      const privateKey = this.getPrivateKey()
      const accAddress = AccAddress.fromBech32(signer)
      const fee = unsignedStdTx.fee
      // max. gas
      fee.gas = '10000000'

      return this.getNewThorClient(from)
        .signAndBroadcast(unsignedStdTx, privateKey, accAddress)
        .then((result) => result?.txhash ?? '')
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
  transfer = async ({ walletIndex = 0, asset = AssetRune, amount, recipient, memo }: TxParams): Promise<TxHash> => {
    try {
      registerCodecs(this.network)

      const assetBalance = await this.getBalance(this.getAddress(walletIndex), [asset])
      const fee = await this.getFees()
      if (assetBalance.length === 0 || assetBalance[0].amount.amount().lt(amount.amount().plus(fee.average.amount()))) {
        throw new Error('insufficient funds')
      }

      const transferResult = await this.getNewThorClient(walletIndex).transfer({
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
