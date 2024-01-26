import { StdFee } from '@cosmjs/amino'
import { Bip39, EnglishMnemonic, Secp256k1, Slip10, Slip10Curve } from '@cosmjs/crypto'
import { fromBase64, toBase64 } from '@cosmjs/encoding'
import {
  DecodedTxRaw,
  DirectSecp256k1HdWallet,
  EncodeObject,
  TxBodyEncodeObject,
  decodeTxRaw,
} from '@cosmjs/proto-signing'
import { SigningStargateClient } from '@cosmjs/stargate'
import { AssetInfo, PreparedTx, TxHash, TxParams } from '@xchainjs/xchain-client'
import {
  Client as CosmosSDKClient,
  CosmosSdkClientParams,
  MsgTypes,
  bech32ToBase64,
  makeClientPath,
} from '@xchainjs/xchain-cosmos-sdk'
import { Address, Asset, assetToString, eqAsset, isSynthAsset } from '@xchainjs/xchain-util'
import BigNumber from 'bignumber.js'
import { TxRaw } from 'cosmjs-types/cosmos/tx/v1beta1/tx'

import {
  AssetCacao,
  AssetMaya,
  CACAO_DECIMAL,
  CACAO_DENOM,
  DEFAULT_GAS_LIMIT_VALUE,
  DEPOSIT_GAS_LIMIT_VALUE,
  MAYA_DECIMAL,
  MAYA_DENOM,
  MSG_DEPOSIT_TYPE_URL,
  MSG_SEND_TYPE_URL,
  defaultClientConfig,
} from './const'
import { DepositParam, DepositTx, TxOfflineParams } from './types'
import { getDefaultExplorers, getExplorerAddressUrl, getExplorerTxUrl } from './utils'

/**
 * Interface for custom Thorchain client
 */
export interface MayachainClient {
  deposit(params: DepositParam): Promise<TxHash>
  getDepositTransaction(txId: string): Promise<DepositTx>
  transferOffline(params: TxOfflineParams): Promise<string>
}

/**
 * Thorchain client params to instantiate the Thorchain client
 */
export type MayachainClientParams = Partial<CosmosSdkClientParams>

/**
 * Custom mayachain Client
 */
export class Client extends CosmosSDKClient implements MayachainClient {
  /**
   * Thorchain client constructor
   *
   * @param {ThorchainClientParams} config Optional - Client configuration. If it is not set, default values will be used
   */
  constructor(config: MayachainClientParams = defaultClientConfig) {
    super({
      ...defaultClientConfig,
      ...config,
    })
  }

  /**
   * Get client native asset
   *
   * @returns {AssetInfo} Thorchain native asset
   */
  public getAssetInfo(): AssetInfo {
    return {
      asset: AssetCacao,
      decimal: CACAO_DECIMAL,
    }
  }

  /**
   * Returns the number of the decimals of known assets
   *
   * @param {Asset} asset - Asset of which return the number of decimals
   * @returns {number} the number of decimals of the assets
   */
  public getAssetDecimals(asset: Asset): number {
    if (eqAsset(asset, AssetCacao)) return CACAO_DECIMAL
    if (eqAsset(asset, AssetMaya)) return MAYA_DECIMAL
    return this.defaultDecimals
  }

  /**
   * Get the explorer url.
   *
   * @returns {string} The explorer url for thorchain based on the current network.
   */
  public getExplorerUrl(): string {
    return getDefaultExplorers()[this.network]
  }

  /**
   * Get the explorer url for the given address.
   *
   * @param {Address} address
   * @returns {string} The explorer url for the given address.
   */
  public getExplorerAddressUrl(address: string): string {
    return getExplorerAddressUrl(address)[this.network]
  }

  /**
   * Get the explorer url for the given transaction id.
   *
   * @param {string} txID
   * @returns {string} The explorer url for the given transaction id.
   */
  public getExplorerTxUrl(txID: string): string {
    return getExplorerTxUrl(txID)[this.network]
  }

  /**
   * Get Asset from denomination
   *
   * @param {string} denom
   * @returns {Asset|null} The asset of the given denomination.
   */
  public assetFromDenom(denom: string): Asset | null {
    if (denom === CACAO_DENOM) return AssetCacao
    if (denom === MAYA_DENOM) return AssetMaya
    return null
  }

  /**
   * Get denomination from Asset
   *
   * @param {Asset} asset
   * @returns {string} The denomination of the given asset.
   */
  public getDenom(asset: Asset): string | null {
    if (eqAsset(asset, AssetCacao)) return CACAO_DENOM
    if (eqAsset(asset, AssetMaya)) return MAYA_DENOM
    if (isSynthAsset(asset)) return assetToString(asset).toLowerCase()
    return asset.symbol.toLowerCase()
  }

  /**
   * Prepare transfer.
   *
   * @param {TxParams&Address} params The transfer options.
   * @returns {PreparedTx} The raw unsigned transaction.
   */
  public async prepareTx({
    sender,
    recipient,
    asset,
    amount,
    memo,
  }: TxParams & { sender: Address }): Promise<PreparedTx> {
    if (!this.validateAddress(sender)) throw Error('Invalid sender address')
    if (!this.validateAddress(recipient)) throw Error('Invalid recipient address')

    const denom = this.getDenom(asset || this.getAssetInfo().asset)
    if (!denom)
      throw Error(`Invalid asset ${asset?.symbol} - Only ${this.baseDenom} asset is currently supported to transfer`)

    const demonAmount = { amount: amount.amount().toString(), denom }

    const txBody: TxBodyEncodeObject = {
      typeUrl: '/cosmos.tx.v1beta1.TxBody',
      value: {
        messages: [
          {
            typeUrl: MSG_SEND_TYPE_URL,
            value: {
              fromAddress: bech32ToBase64(sender),
              toAddress: bech32ToBase64(recipient),
              amount: [demonAmount],
            },
          },
        ],
        memo: memo,
      },
    }

    const rawTx = TxRaw.fromPartial({
      bodyBytes: this.registry.encode(txBody),
    })
    return { rawUnsignedTx: toBase64(TxRaw.encode(rawTx).finish()) }
  }

  /**
   * Make a deposit
   *
   * @param {number} param.walletIndex Optional - The index to use to generate the address from the transaction will be done.
   * If it is not set, address associated with index 0 will be used
   * @param {Asset} param.asset Optional - The asset that will be deposit. If it is not set, Thorchain native asset will be
   * used
   * @param {BaseAmount} param.amount The amount that will be deposit
   * @param {string} param.memo Optional - The memo associated with the deposit
   * @param {BigNumber} param.gasLimit Optional - The limit amount of gas allowed to spend in the deposit. If not set, default
   * value of 600000000 will be used
   * @returns {string} The deposit hash
   */
  public async deposit({
    walletIndex = 0,
    asset = AssetCacao,
    amount,
    memo,
    gasLimit = new BigNumber(DEPOSIT_GAS_LIMIT_VALUE),
  }: DepositParam): Promise<string> {
    const sender = await this.getAddressAsync(walletIndex)

    const signer = await DirectSecp256k1HdWallet.fromMnemonic(this.phrase as string, {
      prefix: this.prefix,
      hdPaths: [makeClientPath(this.getFullDerivationPath(walletIndex || 0))],
    })

    const signingClient = await SigningStargateClient.connectWithSigner(this.clientUrls[this.network], signer, {
      registry: this.registry,
    })

    const tx = await signingClient.signAndBroadcast(
      sender,
      [
        {
          typeUrl: MSG_DEPOSIT_TYPE_URL,
          value: {
            signer: bech32ToBase64(sender),
            memo,
            coins: [
              {
                amount: amount.amount().toString(),
                asset,
              },
            ],
          },
        },
      ],
      {
        amount: [],
        gas: gasLimit.toString(),
      },
      memo,
    )

    return tx.transactionHash
  }

  /**
   * Create and sign transaction without broadcasting it
   *
   * @deprecated Use prepare Tx instead
   */
  public async transferOffline({
    walletIndex = 0,
    recipient,
    asset,
    amount,
    memo,
    gasLimit = new BigNumber(DEFAULT_GAS_LIMIT_VALUE),
  }: TxOfflineParams & { gasLimit?: BigNumber }): Promise<string> {
    const sender = await this.getAddressAsync(walletIndex)
    const { rawUnsignedTx } = await this.prepareTx({
      sender,
      recipient: recipient,
      asset: asset,
      amount: amount,
      memo: memo,
    })

    const unsignedTx: DecodedTxRaw = decodeTxRaw(fromBase64(rawUnsignedTx))

    const signer = await DirectSecp256k1HdWallet.fromMnemonic(this.phrase as string, {
      prefix: this.prefix,
      hdPaths: [makeClientPath(this.getFullDerivationPath(walletIndex))],
    })

    const signingClient = await SigningStargateClient.connectWithSigner(this.clientUrls[this.network], signer, {
      registry: this.registry,
    })

    const messages: EncodeObject[] = unsignedTx.body.messages.map((message) => {
      return { typeUrl: this.getMsgTypeUrlByType(MsgTypes.TRANSFER), value: signingClient.registry.decode(message) }
    })

    const rawTx = await signingClient.sign(
      sender,
      messages,
      {
        amount: [],
        gas: gasLimit.toString(),
      },
      unsignedTx.body.memo,
    )

    return toBase64(TxRaw.encode(rawTx).finish())
  }

  /**
   * Returns the private key associated with an index
   *
   * @param {number} index Optional - The index to use to generate the private key. If it is not set, address associated with
   * index 0 will be used
   * @returns {Uint8Array} The private key
   */
  public async getPrivateKey(index = 0): Promise<Uint8Array> {
    const mnemonicChecked = new EnglishMnemonic(this.phrase)
    const seed = await Bip39.mnemonicToSeed(mnemonicChecked)
    const { privkey } = Slip10.derivePath(
      Slip10Curve.Secp256k1,
      seed,
      makeClientPath(this.getFullDerivationPath(index)),
    )
    return privkey
  }

  /**
   * Returns the compressed public key associated with an index
   *
   * @param {number} index Optional - The index to use to generate the private key. If it is not set, address associated with
   * index 0 will be used
   * @returns {Uint8Array} The public key
   */
  public async getPubKey(index = 0): Promise<Uint8Array> {
    const privateKey = await this.getPrivateKey(index)
    const { pubkey } = await Secp256k1.makeKeypair(privateKey)
    return Secp256k1.compressPubkey(pubkey)
  }

  /**
   * Get deposit transaction
   *
   * @deprecated Use getTransactionData instead
   * @param txId
   */
  public async getDepositTransaction(txId: string): Promise<DepositTx> {
    return this.getTransactionData(txId)
  }

  /**
   * Get the message type url by type used by the cosmos-sdk client to make certain actions
   *
   * @param {MsgTypes} msgType Message type of which return the type url
   * @returns {string} the type url of the message
   */
  protected getMsgTypeUrlByType(msgType: MsgTypes): string {
    const messageTypeUrls: Record<MsgTypes, string> = {
      [MsgTypes.TRANSFER]: MSG_SEND_TYPE_URL,
    }
    return messageTypeUrls[msgType]
  }

  /**
   * Returns the standard fee used by the client
   *
   * @returns {StdFee} the standard fee
   */
  protected getStandardFee(): StdFee {
    return { amount: [], gas: '4000000' }
  }
}
