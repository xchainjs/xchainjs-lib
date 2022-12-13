import { proto } from '@cosmos-client/core/cjs/module'
import {
  Balance,
  BaseXChainClient,
  FeeType,
  Fees,
  Network,
  Tx,
  TxHash,
  TxHistoryParams,
  TxParams,
  TxsPage,
  XChainClient,
  XChainClientParams,
  singleFee,
} from '@xchainjs/xchain-client'
import { Address, Asset, AssetAtom, BaseAmount, Chain, assetToString, baseAmount, eqAsset } from '@xchainjs/xchain-util'
import BigNumber from 'bignumber.js'

import { COSMOS_DECIMAL, DEFAULT_FEE, DEFAULT_GAS_LIMIT } from './const'
import { CosmosSDKClient } from './cosmos/sdk-client'
import { TxOfflineParams } from './cosmos/types'
import { ChainIds, ClientUrls, CosmosClientParams } from './types'
import {
  getAsset,
  getDefaultChainIds,
  getDefaultClientUrls,
  getDefaultRootDerivationPaths,
  getDenom,
  getTxsFromHistory,
  protoFee,
} from './util'

/**
 * Interface for custom Cosmos client
 */
export interface CosmosClient {
  getSDKClient(): CosmosSDKClient
}

/**
 * Custom Cosmos client
 */
class Client extends BaseXChainClient implements CosmosClient, XChainClient {
  private sdkClient: CosmosSDKClient
  private clientUrls: ClientUrls
  private chainIds: ChainIds

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
    clientUrls = getDefaultClientUrls(),
    chainIds = getDefaultChainIds(),
    rootDerivationPaths = getDefaultRootDerivationPaths(),
  }: XChainClientParams & CosmosClientParams) {
    super(Chain.Cosmos, { network, rootDerivationPaths, phrase })

    this.clientUrls = clientUrls
    this.chainIds = chainIds

    this.sdkClient = new CosmosSDKClient({
      server: this.clientUrls[network],
      chainId: this.chainIds[network],
    })
  }

  /**
   * Updates current network.
   *
   * @param {Network} network
   * @returns {void}
   */
  setNetwork(network: Network): void {
    // dirty check to avoid using and re-creation of same data
    if (network === this.network) return

    super.setNetwork(network)

    this.sdkClient = new CosmosSDKClient({
      server: this.clientUrls[network],
      chainId: this.chainIds[network],
    })
  }

  /**
   * Get the explorer url.
   *
   * @returns {string} The explorer url.
   */
  getExplorerUrl(): string {
    switch (this.network) {
      case Network.Mainnet:
      case Network.Stagenet:
        return 'https://cosmos.bigdipper.live'
      case Network.Testnet:
        return 'https://explorer.theta-testnet.polypore.xyz'
    }
  }

  /**
   * Get the explorer url for the given address.
   *
   * @param {Address} address
   * @returns {string} The explorer url for the given address.
   */
  getExplorerAddressUrl(address: Address): string {
    return `${this.getExplorerUrl()}/account/${address}`
  }

  /**
   * Get the explorer url for the given transaction id.
   *
   * @param {string} txID
   * @returns {string} The explorer url for the given transaction id.
   */
  getExplorerTxUrl(txID: string): string {
    return `${this.getExplorerUrl()}/transactions/${txID}`
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
  private getPrivateKey(index = 0): proto.cosmos.crypto.secp256k1.PrivKey {
    if (!this.phrase) throw new Error('Phrase not set')

    return this.getSDKClient().getPrivKeyFromMnemonic(this.phrase, this.getFullDerivationPath(index))
  }

  getSDKClient(): CosmosSDKClient {
    return this.sdkClient
  }

  /**
   * Get the current address.
   *
   * @returns {Address} The current address.
   *
   * @throws {Error} Thrown if phrase has not been set before. A phrase is needed to create a wallet and to derive an address from it.
   */
  getAddress(index = 0): string {
    if (!this.phrase) throw new Error('Phrase not set')

    return this.getSDKClient().getAddressFromMnemonic(this.phrase, this.getFullDerivationPath(index))
  }

  /**
   * Validate the given address.
   *
   * @param {Address} address
   * @returns {boolean} `true` or `false`
   */
  validateAddress(address: Address): boolean {
    return this.getSDKClient().checkAddress(address)
  }

  /**
   * Get the balance of a given address.
   *
   * @param {Address} address By default, it will return the balance of the current wallet. (optional)
   * @param {Asset} asset If not set, it will return all assets available. (optional)
   * @returns {Balance[]} The balance of the address.
   */
  async getBalance(address: Address, assets?: Asset[]): Promise<Balance[]> {
    const coins = await this.getSDKClient().getBalance(address)

    const balances = coins
      .reduce((acc: Balance[], { denom, amount }) => {
        const asset = getAsset(denom)
        return asset ? [...acc, { asset, amount: baseAmount(amount || '0', COSMOS_DECIMAL) }] : acc
      }, [])
      .filter(({ asset: balanceAsset }) => !assets || assets.filter((asset) => eqAsset(balanceAsset, asset)).length)

    return balances
  }

  /**
   * Get transaction history of a given address and asset with pagination options.
   * If `asset` is not set, history will include `ATOM` txs only
   * By default it will return the transaction history of the current wallet.
   *
   * @param {TxHistoryParams} params The options to get transaction history. (optional)
   * @returns {TxsPage} The transaction history.
   */
  async getTransactions(params?: TxHistoryParams): Promise<TxsPage> {
    const messageAction = undefined
    const page = (params && params.offset) || undefined
    const limit = (params && params.limit) || undefined
    const txMinHeight = undefined
    const txMaxHeight = undefined
    const asset = getAsset(params?.asset ?? '') || AssetAtom
    const messageSender = params?.address ?? this.getAddress()

    const txHistory = await this.getSDKClient().searchTx({
      messageAction,
      messageSender,
      page,
      limit,
      txMinHeight,
      txMaxHeight,
    })

    return {
      total: parseInt(txHistory.pagination?.total || '0'),
      txs: getTxsFromHistory(txHistory.tx_responses || [], asset),
    }
  }

  /**
   * Get the transaction details of a given transaction id. Supports `ATOM` txs only.
   *
   * @param {string} txId The transaction id.
   * @returns {Tx} The transaction details of the given transaction id.
   */
  async getTransactionData(txId: string): Promise<Tx> {
    const txResult = await this.getSDKClient().txsHashGet(txId)

    if (!txResult || txResult.txhash === '') {
      throw new Error('transaction not found')
    }

    const txs = getTxsFromHistory([txResult], AssetAtom)
    if (txs.length === 0) throw new Error('transaction not found')

    return txs[0]
  }

  /**
   * Transfer balances.
   *
   * @param {TxParams} params The transfer options.
   * @returns {TxHash} The transaction hash.
   */
  async transfer({
    walletIndex,
    asset = AssetAtom,
    amount,
    recipient,
    memo,
    gasLimit = new BigNumber(DEFAULT_GAS_LIMIT),
    feeAmount = DEFAULT_FEE,
  }: TxParams & { gasLimit?: BigNumber; feeAmount?: BaseAmount }): Promise<TxHash> {
    const fromAddressIndex = walletIndex || 0

    const denom = getDenom(asset)

    if (!denom)
      throw Error(`Invalid asset ${assetToString(asset)} - Only ATOM asset is currently supported to transfer`)

    const fee = protoFee({ denom, amount: feeAmount, gasLimit })

    return this.getSDKClient().transfer({
      privkey: this.getPrivateKey(fromAddressIndex),
      from: this.getAddress(fromAddressIndex),
      to: recipient,
      amount,
      denom,
      memo,
      fee,
    })
  }

  /**
   * Transfer offline balances.
   *
   * @param {TxOfflineParams} params The transfer offline options.
   * @returns {string} The signed transaction bytes.
   */
  async transferOffline({
    walletIndex,
    asset = AssetAtom,
    amount,
    recipient,
    memo,
    from_account_number,
    from_sequence,
    gasLimit = new BigNumber(DEFAULT_GAS_LIMIT),
    feeAmount = DEFAULT_FEE,
  }: TxOfflineParams): Promise<string> {
    const fromAddressIndex = walletIndex || 0

    const denom = getDenom(asset)

    if (!denom)
      throw Error(`Invalid asset ${assetToString(asset)} - Only ATOM asset is currently supported to transfer`)

    const fee = protoFee({ denom, amount: feeAmount, gasLimit })

    return await this.getSDKClient().transferSignedOffline({
      privkey: this.getPrivateKey(fromAddressIndex),
      from: this.getAddress(fromAddressIndex),
      from_account_number,
      from_sequence,
      to: recipient,
      amount,
      denom,
      memo,
      fee,
    })
  }

  /**
   * Returns fees.
   * It tries to get chain fees from THORChain `inbound_addresses` first
   * If it fails, it returns DEFAULT fees.
   *
   * @returns {Fees} Current fees
   */
  async getFees(): Promise<Fees> {
    try {
      const feeRate = await this.getFeeRateFromThorchain()
      // convert decimal: 1e8 (THORChain) to 1e6 (COSMOS)
      // Similar to `fromCosmosToThorchain` in THORNode
      // @see https://gitlab.com/thorchain/thornode/-/blob/e787022028f662b3a7c594e4a65aca618caa359c/bifrost/pkg/chainclients/gaia/util.go#L86
      const decimalDiff = COSMOS_DECIMAL - 8 /* THORCHAIN_DECIMAL */
      const feeRate1e6 = feeRate * 10 ** decimalDiff
      const fee = baseAmount(feeRate1e6, COSMOS_DECIMAL)
      return singleFee(FeeType.FlatFee, fee)
    } catch (error) {
      return singleFee(FeeType.FlatFee, DEFAULT_FEE)
    }
  }
}

export { Client }
