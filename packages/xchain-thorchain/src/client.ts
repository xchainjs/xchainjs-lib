import cosmosclient from '@cosmos-client/core'
import {
  AssetInfo,
  Balance,
  BaseXChainClient,
  FeeType,
  Fees,
  Network,
  Tx,
  TxFrom,
  TxHash,
  TxHistoryParams,
  TxParams,
  TxTo,
  TxType,
  TxsPage,
  XChainClient,
  XChainClientParams,
  singleFee,
} from '@xchainjs/xchain-client'
import { CosmosSDKClient, GAIAChain, RPCTxResult, RPCTxSearchResult } from '@xchainjs/xchain-cosmos'
import {
  Address,
  Asset,
  BaseAmount,
  assetFromString,
  assetFromStringEx,
  assetToString,
  baseAmount,
  delay,
} from '@xchainjs/xchain-util'
import axios from 'axios'
import BigNumber from 'bignumber.js'
import Long from 'long'

import { buildDepositTx, buildTransferTx, buildUnsignedTx } from '.'
import {
  AssetRuneNative,
  DEFAULT_GAS_LIMIT_VALUE,
  DEPOSIT_GAS_LIMIT_VALUE,
  FallBackUrls,
  MAX_PAGES_PER_FUNCTION_CALL,
  MAX_TX_COUNT_PER_FUNCTION_CALL,
  MAX_TX_COUNT_PER_PAGE,
  RUNE_DECIMAL,
  defaultExplorerUrls,
} from './const'
import {
  ChainId,
  ChainIds,
  ClientUrl,
  DepositParam,
  ExplorerUrls,
  NodeUrl,
  ThorchainClientParams,
  ThorchainConstantsResponse,
  TxData,
  TxOfflineParams,
} from './types'
import { TxResult } from './types/messages'
import {
  getBalance,
  getDefaultFees,
  getDenom,
  getDepositTxDataFromLogs,
  getExplorerAddressUrl,
  getExplorerTxUrl,
  getPrefix,
  isAssetRuneNative,
  registerDepositCodecs,
  registerSendCodecs,
} from './utils'

/**
 * Interface for custom Thorchain client
 */
export interface ThorchainClient {
  setClientUrl(clientUrl: ClientUrl): void
  getClientUrl(): NodeUrl
  setExplorerUrls(explorerUrls: ExplorerUrls): void
  getCosmosClient(): CosmosSDKClient

  deposit(params: DepositParam): Promise<TxHash>
  transferOffline(params: TxOfflineParams): Promise<string>
}

/**
 * Custom Thorchain Client
 */
class Client extends BaseXChainClient implements ThorchainClient, XChainClient {
  private clientUrl: ClientUrl
  private explorerUrls: ExplorerUrls
  private chainIds: ChainIds
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
    network = Network.Mainnet,
    phrase,
    clientUrl = {
      [Network.Testnet]: {
        node: 'deprecated',
        rpc: 'deprecated',
      },
      [Network.Stagenet]: {
        node: 'https://stagenet-thornode.ninerealms.com',
        rpc: 'https://stagenet-rpc.ninerealms.com',
      },
      [Network.Mainnet]: {
        node: 'https://thornode.ninerealms.com',
        rpc: 'https://rpc.ninerealms.com',
      },
    },
    explorerUrls = defaultExplorerUrls,
    rootDerivationPaths = {
      [Network.Mainnet]: "44'/931'/0'/0/",
      [Network.Stagenet]: "44'/931'/0'/0/",
      [Network.Testnet]: "44'/931'/0'/0/",
    },
    chainIds = {
      [Network.Mainnet]: 'thorchain-mainnet-v1',
      [Network.Stagenet]: 'thorchain-stagenet-v2',
      [Network.Testnet]: 'deprecated',
    },
  }: XChainClientParams & ThorchainClientParams) {
    super(GAIAChain, { network, rootDerivationPaths, phrase })
    this.clientUrl = clientUrl
    this.explorerUrls = explorerUrls
    this.chainIds = chainIds
    registerSendCodecs()
    registerDepositCodecs()

    this.cosmosClient = new CosmosSDKClient({
      server: this.getClientUrl().node,
      chainId: this.getChainId(network),
      prefix: getPrefix(network),
    })
  }

  /**
   * Set/update the current network.
   *
   * @param {Network} network
   * @returns {void}
   *
   * @throws {"Network must be provided"}
   * Thrown if network has not been set before.
   */
  setNetwork(network: Network): void {
    // dirty check to avoid using and re-creation of same data
    if (network === this.network) return

    super.setNetwork(network)

    this.cosmosClient = new CosmosSDKClient({
      server: this.getClientUrl().node,
      chainId: this.getChainId(network),
      prefix: getPrefix(network),
    })
  }

  /**
   * Set/update the client URL.
   *
   * @param {ClientUrl} clientUrl The client url to be set.
   * @returns {void}
   */
  setClientUrl(clientUrl: ClientUrl): void {
    this.clientUrl = clientUrl
  }

  /**
   * Get the client url.
   *
   * @returns {NodeUrl} The client url for thorchain based on the current network.
   */
  getClientUrl(): NodeUrl {
    return this.clientUrl[this.network]
  }

  /**
   * Set/update the explorer URLs.
   *
   * @param {ExplorerUrls} urls The explorer urls to be set.
   * @returns {void}
   */
  setExplorerUrls(urls: ExplorerUrls): void {
    this.explorerUrls = urls
  }

  /**
   * Get the explorer url.
   *
   * @returns {string} The explorer url for thorchain based on the current network.
   */
  getExplorerUrl(): string {
    return this.explorerUrls.root[this.network]
  }

  /**
   * Sets chain id
   *
   * @param {ChainId} chainId Chain id to update
   * @param {Network} network (optional) Network for given chainId. If `network`not set, current network of the client is used
   *
   * @returns {void}
   */
  setChainId(chainId: ChainId, network?: Network): void {
    this.chainIds = { ...this.chainIds, [network || this.network]: chainId }
  }

  /**
   * Gets chain id
   *
   * @param {Network} network (optional) Network to get chain id from. If `network`not set, current network of the client is used
   *
   * @returns {ChainId} Chain id based on the current network.
   */
  getChainId(network?: Network): ChainId {
    return this.chainIds[network || this.network]
  }

  /**
   * Get cosmos client
   * @returns {CosmosSDKClient} current cosmos client
   */
  getCosmosClient(): CosmosSDKClient {
    return this.cosmosClient
  }

  /**
   * Get the explorer url for the given address.
   *
   * @param {Address} address
   * @returns {string} The explorer url for the given address.
   */
  getExplorerAddressUrl(address: Address): string {
    return getExplorerAddressUrl({ urls: this.explorerUrls, network: this.network, address })
  }

  /**
   * Get the explorer url for the given transaction id.
   *
   * @param {string} txID
   * @returns {string} The explorer url for the given transaction id.
   */
  getExplorerTxUrl(txID: string): string {
    return getExplorerTxUrl({ urls: this.explorerUrls, network: this.network, txID })
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
  getPrivateKey(index = 0): cosmosclient.proto.cosmos.crypto.secp256k1.PrivKey {
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
  getPubKey(index = 0): cosmosclient.PubKey {
    const privKey = this.getPrivateKey(index)
    return privKey.pubKey()
  }

  /**
   * Get the current address.
   *
   * @returns {Address} The current address.
   *
   * @throws {Error} Thrown if phrase has not been set before. A phrase is needed to create a wallet and to derive an address from it.
   */
  getAddress(index = 0): string {
    const address = this.cosmosClient.getAddressFromMnemonic(this.phrase, this.getFullDerivationPath(index))
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
  validateAddress(address: Address): boolean {
    return this.cosmosClient.checkAddress(address)
  }

  /**
   * Get the balance of a given address.
   *
   * @param {Address} address By default, it will return the balance of the current wallet. (optional)
   * @param {Asset} asset If not set, it will return all assets available. (optional)
   * @returns {Balance[]} The balance of the address.
   */
  async getBalance(address: Address, assets?: Asset[]): Promise<Balance[]> {
    return getBalance({ address, assets, cosmosClient: this.getCosmosClient() })
  }

  /**
   *
   * @returns asset info
   */
  getAssetInfo(): AssetInfo {
    const assetInfo: AssetInfo = {
      asset: AssetRuneNative,
      decimal: RUNE_DECIMAL,
    }
    return assetInfo
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
    const address = params?.address || this.getAddress()
    const txMinHeight = undefined
    const txMaxHeight = undefined

    if (limit + offset > MAX_PAGES_PER_FUNCTION_CALL * MAX_TX_COUNT_PER_PAGE) {
      throw Error(`limit plus offset can not be grater than ${MAX_PAGES_PER_FUNCTION_CALL * MAX_TX_COUNT_PER_PAGE}`)
    }

    if (limit > MAX_TX_COUNT_PER_FUNCTION_CALL) {
      throw Error(`Maximum number of transaction per call is ${MAX_TX_COUNT_PER_FUNCTION_CALL}`)
    }

    const pagesNumber = Math.ceil((limit + offset) / MAX_TX_COUNT_PER_PAGE)

    const promiseTotalTxIncomingHistory: Promise<RPCTxSearchResult>[] = []
    const promiseTotalTxOutgoingHistory: Promise<RPCTxSearchResult>[] = []

    for (let index = 1; index <= pagesNumber; index++) {
      promiseTotalTxIncomingHistory.push(
        this.cosmosClient.searchTxFromRPC({
          rpcEndpoint: this.getClientUrl().rpc,
          messageAction,
          transferRecipient: address,
          page: index,
          limit: MAX_TX_COUNT_PER_PAGE,
          txMinHeight,
          txMaxHeight,
        }),
      )
      promiseTotalTxOutgoingHistory.push(
        this.cosmosClient.searchTxFromRPC({
          rpcEndpoint: this.getClientUrl().rpc,
          messageAction,
          transferSender: address,
          page: index,
          limit: MAX_TX_COUNT_PER_PAGE,
          txMinHeight,
          txMaxHeight,
        }),
      )
    }

    const incomingSearchResult = await Promise.all(promiseTotalTxIncomingHistory)
    const outgoingSearchResult = await Promise.all(promiseTotalTxOutgoingHistory)

    const totalTxIncomingHistory: RPCTxResult[] = incomingSearchResult.reduce((allTxs, searchResult) => {
      return [...allTxs, ...searchResult.txs]
    }, [] as RPCTxResult[])
    const totalTxOutgoingHistory: RPCTxResult[] = outgoingSearchResult.reduce((allTxs, searchResult) => {
      return [...allTxs, ...searchResult.txs]
    }, [] as RPCTxResult[])

    let history: RPCTxResult[] = totalTxIncomingHistory
      .concat(totalTxOutgoingHistory)
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

    history = history.filter((_, index) => index >= offset && index < offset + limit)
    const total = history.length

    const txs: Tx[] = []

    for (let i = 0; i < history.length; i += 10) {
      const batch = history.slice(i, i + 10)
      const result = await Promise.all(
        batch.map(async ({ hash }) => {
          const data = await this.getTransactionData(hash, address)
          return data
        }),
      )
      txs.push(...result)
      delay(2000) // Delay to avoid 503 from ninerealms server
    }

    return {
      total,
      txs,
    }
  }
  /**
   *
   * @param txId - tx hash
   * @returns txResponse
   */
  async fetchTransaction(txId: string) {
    try {
      const transaction = await this.cosmosClient.txsHashGet(txId)
      return transaction
    } catch (error) {
      for (const fallback of FallBackUrls) {
        for (const network of Object.keys(fallback)) {
          try {
            const networkObj = fallback[network as keyof typeof fallback]
            const clientUrl = networkObj.node as string | string[]
            const cosmosClient = new CosmosSDKClient({
              server: Array.isArray(clientUrl) ? clientUrl[0] : clientUrl,
              chainId: this.getChainId(network as Network),
              prefix: getPrefix(network as Network),
            })
            const tx = await cosmosClient.txsHashGet(txId)
            return tx
          } catch (error) {
            // Handle specific error if needed
          }
        }
      }
      return null
    }
  }

  /**
   * Get the transaction details of a given transaction id.
   *
   * @param {string} txId The transaction id.
   * @returns {Tx} The transaction details of the given transaction id.
   */
  async getTransactionData(txId: string, address?: string): Promise<Tx> {
    const txResult = await this.fetchTransaction(txId)
    if (txResult && txResult.logs) {
      // extract values from the response
      const transferEvent = txResult.logs[0].events?.find((event) => event.type === 'transfer')
      const messageEvent = txResult.logs[0].events?.find((event) => event.type === 'message')

      if (!transferEvent || !messageEvent) {
        throw new Error('Invalid transaction data')
      }
      const attributeGroups: { [key: string]: string[] } = {}

      for (const attr of transferEvent.attributes) {
        if (!attributeGroups[attr.key]) {
          attributeGroups[attr.key] = []
        }
        attributeGroups[attr.key].push(attr.value)
      }
      const assetAmount = attributeGroups['amount'][1]
        ? attributeGroups['amount'][1].split(/(?<=\d)(?=\D)/).filter(Boolean)[0]
        : attributeGroups['amount'][0].split(/(?<=\d)(?=\D)/).filter(Boolean)[0]
      const assetString = attributeGroups['amount'][1]
        ? attributeGroups['amount'][1]
            .split(/(?<=\d)(?=\D)/)
            .filter(Boolean)[1]
            .replace(/[a-z]/g, (letter) => letter.toUpperCase())
        : attributeGroups['amount'][0]
            .split(/(?<=\d)(?=\D)/)
            .filter(Boolean)[1]
            .replace(/[a-z]/g, (letter) => letter.toUpperCase())
      const fromAddress = transferEvent.attributes.find((attr) => attr.key === 'sender')?.value
        ? transferEvent.attributes.find((attr) => attr.key === 'sender')?.value
        : address
      const memo = txResult.tx?.body ? txResult.tx.body.memo.split(':') : ''
      const toAddress = memo[2] ? memo[2] : ''
      const toAsset = memo[1] ? assetFromStringEx(memo[1]) : AssetRuneNative
      const date = new Date(txResult.timestamp)
      const typeString = messageEvent.attributes.find((attr) => attr.key === 'action')?.value
      const hash = txResult.txhash

      if (assetString && hash && fromAddress && typeString) {
        const fromAsset = assetString === 'RUNE' ? AssetRuneNative : assetFromStringEx(assetString)
        const txData: TxData | null =
          txResult && txResult.raw_log
            ? getDepositTxDataFromLogs(txResult.logs, `${fromAddress}`, fromAsset, toAsset)
            : null
        if (!txData) throw new Error(`Failed to get transaction data (tx-hash: ${txId})`)

        if (isAssetRuneNative(toAsset) || toAsset.synth) {
          const { from, to, type } = txData
          const tx: Tx = {
            asset: fromAsset,
            from: from,
            to: to,
            date: date,
            type: type,
            hash: hash,
          }
          return tx
        } else {
          const tx: Tx = {
            asset: fromAsset,
            from: [{ from: fromAddress, amount: baseAmount(assetAmount), asset: fromAsset }],
            to: [{ to: toAddress, amount: baseAmount(memo[3]), asset: toAsset }],
            date: date,
            type: TxType.Transfer,
            hash: hash,
          }
          return tx
        }
      } else {
        const tx: Tx = {
          asset: {
            chain: '',
            symbol: '',
            ticker: '',
            synth: false,
          },
          from: [],
          to: [],
          date: new Date(),
          type: TxType.Transfer,
          hash: '',
        }
        return tx
      }
    } else {
      return await this.getTransactionDataThornode(txId)
    }
  }
  /** This function is used when in bound or outbound tx is not of thorchain
   *
   * @param txId - transaction hash
   * @returns - Tx object
   */
  private async getTransactionDataThornode(txId: string): Promise<Tx> {
    const txResult = JSON.stringify(await this.thornodeAPIGet(`/tx/${txId}`))
    const getTx: TxResult = JSON.parse(txResult)
    if (!getTx) throw Error(`Could not return tx data`)
    const senderAsset = assetFromStringEx(`${getTx.observed_tx?.tx.coins[0].asset}`)
    const fromAddress = `${getTx.observed_tx.tx.from_address}`
    const from: TxFrom[] = [
      { from: fromAddress, amount: baseAmount(getTx.observed_tx?.tx.coins[0].amount), asset: senderAsset },
    ]
    const splitMemo = getTx.observed_tx.tx.memo?.split(':')

    if (!splitMemo) throw Error(`Could not parse memo`)
    let asset: Asset
    let amount: string
    if (splitMemo[0] === 'OUT') {
      asset = assetFromStringEx(getTx.observed_tx.tx.coins[0].asset)
      amount = getTx.observed_tx.tx.coins[0].amount
      const addressTo = getTx.observed_tx.tx.to_address ? getTx.observed_tx.tx.to_address : 'undefined'
      const to: TxTo[] = [{ to: addressTo, amount: baseAmount(amount, RUNE_DECIMAL), asset: asset }]
      const txData: Tx = {
        hash: txId,
        asset: senderAsset,
        from,
        to,
        date: new Date(),
        type: TxType.Transfer,
      }
      return txData
    }
    asset = assetFromStringEx(splitMemo[1])
    const address = splitMemo[2]
    amount = splitMemo[3]
    const receiverAsset = asset
    const recieverAmount = amount
    const to: TxTo[] = [{ to: address, amount: baseAmount(recieverAmount, RUNE_DECIMAL), asset: receiverAsset }]
    const txData: Tx = {
      hash: txId,
      asset: senderAsset,
      from,
      to,
      date: new Date(),
      type: TxType.Transfer,
    }
    return txData
  }

  /**
   * Get the transaction details of a given transaction id. (from /thorchain/txs/hash)
   *
   * Node: /thorchain/txs/hash response doesn't have timestamp field.
   *
   * @param {string} txId The transaction id.
   * @returns {Tx} The transaction details of the given transaction id.
   */
  async getDepositTransaction(txId: string): Promise<Omit<Tx, 'date'>> {
    const result: TxResult = (await axios.get(`${this.getClientUrl().node}/thorchain/tx/${txId}`)).data

    if (!result || !result.observed_tx) throw new Error('transaction not found')

    const from: TxFrom[] = []
    const to: TxTo[] = []
    let asset
    result.observed_tx.tx.coins.forEach((coin) => {
      from.push({
        from: result.observed_tx.tx.from_address,
        amount: baseAmount(coin.amount, RUNE_DECIMAL),
      })
      to.push({
        to: result.observed_tx.tx.to_address,
        amount: baseAmount(coin.amount, RUNE_DECIMAL),
      })
      asset = assetFromString(coin.asset)
    })

    return {
      asset: asset || AssetRuneNative,
      from,
      to,
      type: TxType.Transfer,
      hash: txId,
    }
  }

  /**
   * Transaction with MsgNativeTx.
   *
   * @param {DepositParam} params The transaction options.
   * @returns {TxHash} The transaction hash.
   *
   * @throws {"insufficient funds"} Thrown if the wallet has insufficient funds.
   * @throws {"Invalid transaction hash"} Thrown by missing tx hash
   */
  async deposit({
    walletIndex = 0,
    asset = AssetRuneNative,
    amount,
    memo,
    gasLimit = new BigNumber(DEPOSIT_GAS_LIMIT_VALUE),
    sequence,
  }: DepositParam): Promise<TxHash> {
    const balances = await this.getBalance(this.getAddress(walletIndex))
    const runeBalance: BaseAmount =
      balances.filter(({ asset }) => isAssetRuneNative(asset))[0]?.amount ?? baseAmount(0, RUNE_DECIMAL)
    const assetBalance: BaseAmount =
      balances.filter(({ asset: assetInList }) => assetToString(assetInList) === assetToString(asset))[0]?.amount ??
      baseAmount(0, RUNE_DECIMAL)

    const { average: fee } = await this.getFees()

    if (isAssetRuneNative(asset)) {
      // amount + fee < runeBalance
      if (runeBalance.lt(amount.plus(fee))) {
        throw new Error('insufficient funds')
      }
    } else {
      // amount < assetBalances && runeBalance < fee
      if (assetBalance.lt(amount) || runeBalance.lt(fee)) {
        throw new Error('insufficient funds')
      }
    }

    const privKey = this.getPrivateKey(walletIndex)
    const signerPubkey = privKey.pubKey()

    const fromAddress = this.getAddress(walletIndex)
    const fromAddressAcc = cosmosclient.AccAddress.fromString(fromAddress)

    const depositTxBody = await buildDepositTx({
      msgNativeTx: {
        memo: memo,
        signer: fromAddressAcc,
        coins: [
          {
            asset: asset,
            amount: amount.amount().toString(),
          },
        ],
      },
      nodeUrl: this.getClientUrl().node,
      chainId: this.getChainId(),
    })

    const account = await this.getCosmosClient().getAccount(fromAddressAcc)
    const { account_number: accountNumber } = account
    if (!accountNumber) throw Error(`Deposit failed - could not get account number ${accountNumber}`)

    const txBuilder = buildUnsignedTx({
      cosmosSdk: this.getCosmosClient().sdk,
      txBody: depositTxBody,
      signerPubkey: cosmosclient.codec.instanceToProtoAny(signerPubkey),
      gasLimit: Long.fromString(gasLimit.toFixed(0)),
      sequence: sequence ? Long.fromNumber(sequence) : account.sequence || Long.ZERO,
    })

    const txHash = await this.getCosmosClient().signAndBroadcast(txBuilder, privKey, accountNumber)

    if (!txHash) throw Error(`Invalid transaction hash: ${txHash}`)

    return txHash
  }

  /**
   * Transfer balances with MsgSend
   *
   * @param {TxParams} params The transfer options.
   * @returns {TxHash} The transaction hash.
   *
   * @throws {"insufficient funds"} Thrown if the wallet has insufficient funds.
   * @throws {"Invalid transaction hash"} Thrown by missing tx hash
   */
  async transfer({
    walletIndex = 0,
    asset = AssetRuneNative,
    amount,
    recipient,
    memo,
    gasLimit = new BigNumber(DEFAULT_GAS_LIMIT_VALUE),
    sequence,
  }: TxParams & { gasLimit?: BigNumber; sequence?: number }): Promise<TxHash> {
    const balances = await this.getBalance(this.getAddress(walletIndex))
    const runeBalance: BaseAmount =
      balances.filter(({ asset }) => isAssetRuneNative(asset))[0]?.amount ?? baseAmount(0, RUNE_DECIMAL)
    const assetBalance: BaseAmount =
      balances.filter(({ asset: assetInList }) => assetToString(assetInList) === assetToString(asset))[0]?.amount ??
      baseAmount(0, RUNE_DECIMAL)

    const fee = (await this.getFees()).average

    if (isAssetRuneNative(asset)) {
      // amount + fee < runeBalance
      if (runeBalance.lt(amount.plus(fee))) {
        throw new Error('insufficient funds')
      }
    } else {
      // amount < assetBalances && runeBalance < fee
      if (assetBalance.lt(amount) || runeBalance.lt(fee)) {
        throw new Error('insufficient funds')
      }
    }
    const privKey = this.getPrivateKey(walletIndex)
    const from = this.getAddress(walletIndex)
    const signerPubkey = privKey.pubKey()
    const accAddress = cosmosclient.AccAddress.fromString(from)

    const denom = getDenom(asset)

    const txBody = await buildTransferTx({
      fromAddress: from,
      toAddress: recipient,
      memo: memo,
      assetAmount: amount,
      assetDenom: denom,
      chainId: this.getChainId(),
      nodeUrl: this.getClientUrl().node,
    })
    const account = await this.getCosmosClient().getAccount(accAddress)
    const { account_number: accountNumber } = account
    if (!accountNumber) throw Error(`Deposit failed - could not get account number ${accountNumber}`)

    const txBuilder = buildUnsignedTx({
      cosmosSdk: this.getCosmosClient().sdk,
      txBody: txBody,
      gasLimit: Long.fromString(gasLimit.toString()),
      signerPubkey: cosmosclient.codec.instanceToProtoAny(signerPubkey),
      sequence: sequence ? Long.fromNumber(sequence) : account.sequence || Long.ZERO,
    })

    const txHash = await this.cosmosClient.signAndBroadcast(txBuilder, privKey, accountNumber)

    if (!txHash) throw Error(`Invalid transaction hash: ${txHash}`)

    return txHash
  }

  async broadcastTx(txHex: string): Promise<TxHash> {
    return await this.getCosmosClient().broadcast(txHex)
  }

  /**
   * Transfer without broadcast balances with MsgSend
   *
   * @param {TxOfflineParams} params The transfer offline options.
   * @returns {string} The signed transaction bytes.
   */
  async transferOffline({
    walletIndex = 0,
    asset = AssetRuneNative,
    amount,
    recipient,
    memo,
    fromRuneBalance: from_rune_balance,
    fromAssetBalance: from_asset_balance = baseAmount(0, RUNE_DECIMAL),
    fromAccountNumber = Long.ZERO,
    fromSequence = Long.ZERO,
    gasLimit = new BigNumber(DEFAULT_GAS_LIMIT_VALUE),
  }: TxOfflineParams): Promise<string> {
    const fee = (await this.getFees()).average

    if (isAssetRuneNative(asset)) {
      // amount + fee < runeBalance
      if (from_rune_balance.lt(amount.plus(fee))) {
        throw new Error('insufficient funds')
      }
    } else {
      // amount < assetBalances && runeBalance < fee
      if (from_asset_balance.lt(amount) || from_rune_balance.lt(fee)) {
        throw new Error('insufficient funds')
      }
    }

    const txBody = await buildTransferTx({
      fromAddress: this.getAddress(walletIndex),
      toAddress: recipient,
      memo,
      assetAmount: amount,
      assetDenom: getDenom(asset),
      chainId: this.getChainId(),
      nodeUrl: this.getClientUrl().node,
    })
    const privKey = this.getPrivateKey(walletIndex)

    const txBuilder = buildUnsignedTx({
      cosmosSdk: this.getCosmosClient().sdk,
      txBody: txBody,
      gasLimit: Long.fromString(gasLimit.toFixed(0)),
      signerPubkey: cosmosclient.codec.instanceToProtoAny(privKey.pubKey()),
      sequence: fromSequence,
    })

    const signDocBytes = txBuilder.signDocBytes(fromAccountNumber)
    txBuilder.addSignature(privKey.sign(signDocBytes))
    return txBuilder.txBytes()
  }

  /**
   * Gets fees from Node
   *
   * @returns {Fees}
   */
  async getFees(): Promise<Fees> {
    try {
      const {
        data: {
          int_64_values: { NativeTransactionFee: fee },
        },
      } = await axios.get<ThorchainConstantsResponse>(`${this.getClientUrl().node}/thorchain/constants`)

      // validate data
      if (!fee || isNaN(fee) || fee < 0) throw Error(`Invalid fee: ${fee.toString()}`)

      return singleFee(FeeType.FlatFee, baseAmount(fee))
    } catch {
      return getDefaultFees()
    }
  }
}

export { Client }
