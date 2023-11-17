import cosmosclient from '@cosmos-client/core'
import { proto } from '@cosmos-client/core/cjs/module'
import {
  AssetInfo,
  Balance,
  BaseXChainClient,
  FeeType,
  Fees,
  Network,
  PreparedTx,
  Tx,
  TxHash,
  TxHistoryParams,
  TxParams,
  TxsPage,
  XChainClient,
  XChainClientParams,
  singleFee,
} from '@xchainjs/xchain-client'
import { Address, Asset, BaseAmount, assetToString, baseAmount, eqAsset } from '@xchainjs/xchain-util'
import BigNumber from 'bignumber.js'

import { AssetATOM, COSMOS_DECIMAL, DEFAULT_FEE, DEFAULT_GAS_LIMIT, GAIAChain } from './const'
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
  protoTxBody,
} from './utils'

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
    super(GAIAChain, { network, rootDerivationPaths, phrase })

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
   * @deprecated this function eventually will be removed use getAddressAsync instead
   */
  getAddress(index = 0): string {
    if (!this.phrase) throw new Error('Phrase not set')

    return this.getSDKClient().getAddressFromMnemonic(this.phrase, this.getFullDerivationPath(index))
  }

  /**
   * Get the current address.
   *
   * @returns {Address} The current address.
   *
   * @throws {Error} Thrown if phrase has not been set before. A phrase is needed to create a wallet and to derive an address from it.
   */
  async getAddressAsync(index = 0): Promise<string> {
    return this.getAddress(index)
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
   *
   * @returns asset info
   */
  getAssetInfo(): AssetInfo {
    const assetInfo: AssetInfo = {
      asset: AssetATOM,
      decimal: COSMOS_DECIMAL,
    }
    return assetInfo
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
    const asset = getAsset(params?.asset ?? '') || AssetATOM
    const messageSender = params?.address ?? (await this.getAddressAsync())

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

    const txs = getTxsFromHistory([txResult], AssetATOM)
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
    walletIndex = 0,
    asset = AssetATOM,
    amount,
    recipient,
    memo,
    gasLimit = new BigNumber(DEFAULT_GAS_LIMIT),
    feeAmount = DEFAULT_FEE,
  }: TxParams & { gasLimit?: BigNumber; feeAmount?: BaseAmount }): Promise<TxHash> {
    const sender = this.getAddress(walletIndex || 0)

    const unsignedTxData = await this.prepareTx({
      sender,
      asset,
      amount,
      recipient,
      memo,
      gasLimit,
      feeAmount,
    })

    const decodedTx = cosmosclient.proto.cosmos.tx.v1beta1.TxRaw.decode(
      Buffer.from(unsignedTxData.rawUnsignedTx, 'base64'),
    )

    const privKey = this.getSDKClient().getPrivKeyFromMnemonic(this.phrase, this.getFullDerivationPath(walletIndex))
    const authInfo = cosmosclient.proto.cosmos.tx.v1beta1.AuthInfo.decode(decodedTx.auth_info_bytes)

    if (!authInfo.signer_infos[0].public_key) {
      authInfo.signer_infos[0].public_key = cosmosclient.codec.instanceToProtoAny(privKey.pubKey())
    }

    const txBuilder = new cosmosclient.TxBuilder(
      this.getSDKClient().sdk,
      cosmosclient.proto.cosmos.tx.v1beta1.TxBody.decode(decodedTx.body_bytes),
      authInfo,
    )

    const address = cosmosclient.AccAddress.fromString(sender)
    const { account_number: accountNumber } = await this.sdkClient.getAccount(address)

    if (!accountNumber) throw Error(`Transfer failed - missing account number`)

    const signDocBytes = txBuilder.signDocBytes(accountNumber)
    txBuilder.addSignature(privKey.sign(signDocBytes))

    const signedTx = txBuilder.txBytes()

    return this.broadcastTx(signedTx)
  }

  /**
   * Transfer offline balances.
   *
   * @param {TxOfflineParams} params The transfer offline options.
   * @returns {string} The signed transaction bytes.
   */
  async transferOffline({
    walletIndex,
    asset = AssetATOM,
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
      from: await this.getAddressAsync(fromAddressIndex),
      from_account_number,
      from_sequence,
      to: recipient,
      amount,
      denom,
      memo,
      fee,
    })
  }
  async broadcastTx(txHex: string): Promise<TxHash> {
    return await this.getSDKClient().broadcast(txHex)
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

  /**
   * Prepare transfer.
   *
   * @param {TxParams&Address&BaseAmount&BigNumber} params The transfer options.
   * @returns {PreparedTx} The raw unsigned transaction.
   */
  async prepareTx({
    sender,
    recipient,
    amount,
    memo,
    asset = AssetATOM,
    feeAmount = DEFAULT_FEE,
    gasLimit = new BigNumber(DEFAULT_GAS_LIMIT),
  }: TxParams & { sender: Address; feeAmount?: BaseAmount; gasLimit?: BigNumber }): Promise<PreparedTx> {
    const denom = getDenom(asset)

    if (!denom)
      throw Error(`Invalid asset ${assetToString(asset)} - Only ATOM asset is currently supported to transfer`)

    if (!this.validateAddress(sender)) throw Error('Invalid sender address')
    if (!this.validateAddress(recipient)) throw Error('Invalid recipient address')

    this.sdkClient.setPrefix()

    const address = cosmosclient.AccAddress.fromString(sender)
    const account = await this.sdkClient.getAccount(address)

    const { sequence, account_number: accountNumber, pub_key: pubkey } = account
    if (!sequence) throw Error(`Transfer failed - missing sequence`)
    if (!accountNumber) throw Error(`Transfer failed - missing account number`)
    const txBody = protoTxBody({ from: sender, to: recipient, amount, denom, memo })
    const fee = protoFee({ denom, amount: feeAmount, gasLimit })

    const authInfo = new cosmosclient.proto.cosmos.tx.v1beta1.AuthInfo({
      fee,
      signer_infos: [
        {
          public_key: pubkey,
          mode_info: {
            single: {
              mode: cosmosclient.proto.cosmos.tx.signing.v1beta1.SignMode.SIGN_MODE_DIRECT,
            },
          },
          sequence,
        },
      ],
    })

    return { rawUnsignedTx: new cosmosclient.TxBuilder(this.sdkClient.sdk, txBody, authInfo).txBytes() }
  }
}

export { Client }
