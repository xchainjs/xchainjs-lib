/**
 * Import necessary modules and types for the Thorchain client.
 */
import { StdFee } from '@cosmjs/amino'
import { Bip39, EnglishMnemonic, Secp256k1, Slip10, Slip10Curve } from '@cosmjs/crypto'
import { fromBase64, toBase64 } from '@cosmjs/encoding'
import {
  // Import transaction-related types and functions from @cosmjs/proto-signing for transaction encoding/decoding.
  DecodedTxRaw,
  DirectSecp256k1HdWallet,
  EncodeObject,
  TxBodyEncodeObject,
  decodeTxRaw,
} from '@cosmjs/proto-signing'
import { DeliverTxResponse, SigningStargateClient } from '@cosmjs/stargate'
import { AssetInfo, Network, PreparedTx, TxHash, TxParams } from '@xchainjs/xchain-client'
import {
  // Import client-related types and functions from @xchainjs/xchain-cosmos-sdk for Cosmos SDK client configuration.
  Client as CosmosSDKClient,
  CosmosSdkClientParams,
  MsgTypes,
  bech32ToBase64,
  makeClientPath,
} from '@xchainjs/xchain-cosmos-sdk'
import { getSeed } from '@xchainjs/xchain-crypto'
import { Address, Asset, BaseAmount, assetFromString, eqAsset } from '@xchainjs/xchain-util'
import { encode, toWords } from 'bech32'
import { BigNumber } from 'bignumber.js'
import { fromSeed } from 'bip32'
import { TxRaw } from 'cosmjs-types/cosmos/tx/v1beta1/tx'
import { createHash } from 'crypto'
import { publicKeyCreate } from 'secp256k1'

/**
 * Import constants and types
 */
import {
  AssetRuneNative as AssetRUNE,
  DEFAULT_GAS_LIMIT_VALUE,
  DEPOSIT_GAS_LIMIT_VALUE,
  MSG_DEPOSIT_TYPE_URL,
  MSG_SEND_TYPE_URL,
  RUNE_DECIMAL,
  RUNE_DENOM,
  defaultClientConfig,
} from './const'
import { DepositParam, DepositTx, TxOfflineParams } from './types'
import { getDefaultExplorers, getDenom, getExplorerAddressUrl, getExplorerTxUrl, getPrefix } from './utils'

/**
 * Interface for custom Thorchain client
 */
export interface ThorchainClient {
  deposit(params: DepositParam): Promise<TxHash>
  getDepositTransaction(txId: string): Promise<DepositTx>
  transferOffline(params: TxOfflineParams): Promise<string>
}

/**
 * Thorchain client params to instantiate the Thorchain client
 */
export type ThorchainClientParams = Partial<CosmosSdkClientParams>

/**
 * Thorchain client
 */
export class Client extends CosmosSDKClient implements ThorchainClient {
  /**
   * Thorchain client constructor
   *
   * @param {ThorchainClientParams} config Optional - Client configuration. If it is not set, default values will be used
   */
  constructor(config: ThorchainClientParams = defaultClientConfig) {
    super({
      ...defaultClientConfig,
      ...config,
    })
  }

  /**
   * Asynchronous version of getAddress method.
   * @param {number} index Derivation path index of the address to be generated.
   * @returns {string} A promise that resolves to the generated address.
   */
  async getAddressAsync(index = 0): Promise<string> {
    return this.getAddress(index)
  }

  /**
   * Get the address derived from the provided phrase.
   * @param {number | undefined} walletIndex The index of the address derivation path. Default is 0.
   * @returns {string} The user address at the specified walletIndex.
   */
  public getAddress(walletIndex?: number | undefined): string {
    const seed = getSeed(this.phrase)
    const node = fromSeed(seed)
    const child = node.derivePath(this.getFullDerivationPath(walletIndex || 0))

    if (!child.privateKey) throw new Error('child does not have a privateKey')

    // TODO: Make this method async and use CosmosJS official address generation strategy
    const pubKey = publicKeyCreate(child.privateKey)
    const rawAddress = this.hash160(Uint8Array.from(pubKey))
    const words = toWords(Buffer.from(rawAddress))
    const address = encode(this.prefix, words)
    return address
  }

  public async transfer(params: TxParams): Promise<string> {
    const sender = await this.getAddressAsync(params.walletIndex || 0)

    const { rawUnsignedTx } = await this.prepareTx({
      sender,
      recipient: params.recipient,
      asset: params.asset,
      amount: params.amount,
      memo: params.memo,
    })

    const unsignedTx: DecodedTxRaw = decodeTxRaw(fromBase64(rawUnsignedTx))

    const signer = await DirectSecp256k1HdWallet.fromMnemonic(this.phrase as string, {
      prefix: this.prefix,
      hdPaths: [makeClientPath(this.getFullDerivationPath(params.walletIndex || 0))],
    })

    const tx = await this.roundRobinSignAndBroadcastTx(sender, unsignedTx, signer)

    return tx.transactionHash
  }

  /**
   * Get address prefix by network
   * @param {Network} network The network of which return the prefix
   * @returns the address prefix
   */
  protected getPrefix(network: Network): string {
    return getPrefix(network)
  }

  /**
   * Get client native asset
   *
   * @returns {AssetInfo} Thorchain native asset
   */
  public getAssetInfo(): AssetInfo {
    return {
      asset: AssetRUNE,
      decimal: RUNE_DECIMAL,
    }
  }

  /**
   * Returns the number of the decimals of known assets
   *
   * @param {Asset} asset - Asset of which return the number of decimals
   * @returns {number} the number of decimals of the assets
   */
  public getAssetDecimals(asset: Asset): number {
    if (eqAsset(asset, AssetRUNE)) return RUNE_DECIMAL
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
   * @param {Address} address The address for which to get the explorer URL.
   * @returns {string} The explorer url for the given address.
   */
  public getExplorerAddressUrl(address: string): string {
    return getExplorerAddressUrl(address)[this.network]
  }

  /**
   * Get the explorer url for the given transaction id.
   *
   * @param {string} txID The transaction ID for which to get the explorer URL.
   * @returns {string} The explorer url for the given transaction id.
   */
  public getExplorerTxUrl(txID: string): string {
    return getExplorerTxUrl(txID)[this.network]
  }

  /**
   * Get Asset from denomination
   *
   * @param {string} denom The denomination for which to get the asset.
   * @returns {Asset|null} The asset of the given denomination.
   */
  public assetFromDenom(denom: string): Asset | null {
    if (denom === RUNE_DENOM) return AssetRUNE
    return assetFromString(denom.toUpperCase())
  }

  /**
   * Get denomination from Asset
   *
   * @param {Asset} asset The asset for which to get the denomination.
   * @returns {string} The denomination of the given asset.
   */
  public getDenom(asset: Asset): string | null {
    return getDenom(asset)
  }

  /**
   * Prepare transfer transaction.
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
    // Validate sender and recipient addresses
    if (!this.validateAddress(sender)) throw Error('Invalid sender address')
    if (!this.validateAddress(recipient)) throw Error('Invalid recipient address')
    // Get denomination of the asset
    const denom = this.getDenom(asset || this.getAssetInfo().asset)
    if (!denom)
      throw Error(`Invalid asset ${asset?.symbol} - Only ${this.baseDenom} asset is currently supported to transfer`)

    // Prepare transaction body
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

    // Encode transaction body
    const rawTx = TxRaw.fromPartial({
      bodyBytes: this.registry.encode(txBody),
    })
    // Return raw unsigned transaction
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
    asset = AssetRUNE,
    amount,
    memo,
    gasLimit = new BigNumber(DEPOSIT_GAS_LIMIT_VALUE),
  }: DepositParam): Promise<string> {
    // Get sender address
    const sender = await this.getAddressAsync(walletIndex)

    // Create signer
    const signer = await DirectSecp256k1HdWallet.fromMnemonic(this.phrase as string, {
      prefix: this.prefix,
      hdPaths: [makeClientPath(this.getFullDerivationPath(walletIndex || 0))],
    })

    const tx = await this.roundRobinSignAndBroadcastDeposit(sender, signer, gasLimit, amount, memo, asset)

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
    // Get sender address
    const sender = await this.getAddressAsync(walletIndex)
    // Prepare unsigned transaction
    const { rawUnsignedTx } = await this.prepareTx({
      sender,
      recipient: recipient,
      asset: asset,
      amount: amount,
      memo: memo,
    })

    // Decode unsigned transaction
    const unsignedTx: DecodedTxRaw = decodeTxRaw(fromBase64(rawUnsignedTx))

    // Create signer
    const signer = await DirectSecp256k1HdWallet.fromMnemonic(this.phrase as string, {
      prefix: this.prefix,
      hdPaths: [makeClientPath(this.getFullDerivationPath(walletIndex))],
    })

    const rawTx = await this.roundRobinSign(sender, unsignedTx, signer, gasLimit)

    // Return encoded signed transaction
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
    // Generate seed from mnemonic
    const mnemonicChecked = new EnglishMnemonic(this.phrase)
    const seed = await Bip39.mnemonicToSeed(mnemonicChecked)
    // Derive private key
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
    // Get private key
    const privateKey = await this.getPrivateKey(index)
    // Derive public key
    const { pubkey } = await Secp256k1.makeKeypair(privateKey)
    return Secp256k1.compressPubkey(pubkey)
  }

  /**
   * Get deposit transaction
   *
   * @deprecated Use getTransactionData instead
   * @param {string} txId The transaction ID for which to get the deposit transaction
   */
  public async getDepositTransaction(txId: string): Promise<DepositTx> {
    return this.getTransactionData(txId)
  }

  /**
   * Get the message type url by type used by the cosmos-sdk client to make certain actions
   *
   * @param {MsgTypes} msgType The message type of which return the type url
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
    return { amount: [], gas: '6000000' }
  }

  /**
   * Hashes a buffer using SHA256 followed by RIPEMD160 or RMD160.
   * @param {Uint8Array} buffer The buffer to hash
   * @returns {Uint8Array} The hashed buffer
   */
  private hash160(buffer: Uint8Array): Buffer {
    const sha256Hash: Buffer = createHash('sha256').update(buffer).digest()
    try {
      return createHash('rmd160').update(sha256Hash).digest()
    } catch (err) {
      return createHash('ripemd160').update(sha256Hash).digest()
    }
  }

  /**
   * Sign a transaction making a round robin over the clients urls provided to the client
   *
   * @param {string} sender Sender address
   * @param {DecodedTxRaw} unsignedTx Unsigned transaction
   * @param {DirectSecp256k1HdWallet} signer Signer
   * @param {BigNumber} gasLimit Transaction gas limit
   * @returns {TxRaw} The raw signed transaction
   */
  private async roundRobinSign(
    sender: string,
    unsignedTx: DecodedTxRaw,
    signer: DirectSecp256k1HdWallet,
    gasLimit: BigNumber,
  ): Promise<TxRaw> {
    // Connect to signing client
    for (const url of this.clientUrls[this.network]) {
      const signingClient = await SigningStargateClient.connectWithSigner(url, signer, {
        registry: this.registry,
      })

      // Prepare messages
      const messages: EncodeObject[] = unsignedTx.body.messages.map((message) => {
        return { typeUrl: this.getMsgTypeUrlByType(MsgTypes.TRANSFER), value: signingClient.registry.decode(message) }
      })

      // Sign transaction
      return await signingClient.sign(
        sender,
        messages,
        {
          amount: [],
          gas: gasLimit.toString(),
        },
        unsignedTx.body.memo,
      )
    }
    throw Error('No clients available. Can not sign transaction')
  }

  /**
   * Sign and broadcast a transaction making a round robin over the clients urls provided to the client
   *
   * @param {string} sender Sender address
   * @param {DecodedTxRaw} unsignedTx Unsigned transaction
   * @param {DirectSecp256k1HdWallet} signer Signer
   * @returns {DeliverTxResponse} The transaction broadcasted
   */
  private async roundRobinSignAndBroadcastTx(
    sender: string,
    unsignedTx: DecodedTxRaw,
    signer: DirectSecp256k1HdWallet,
  ): Promise<DeliverTxResponse> {
    for (const url of this.clientUrls[this.network]) {
      const signingClient = await SigningStargateClient.connectWithSigner(url, signer, {
        registry: this.registry,
      })

      const messages: EncodeObject[] = unsignedTx.body.messages.map((message) => {
        return { typeUrl: this.getMsgTypeUrlByType(MsgTypes.TRANSFER), value: signingClient.registry.decode(message) }
      })

      return await signingClient.signAndBroadcast(sender, messages, this.getStandardFee(), unsignedTx.body.memo)
    }
    throw Error('No clients available. Can not sign and broadcast transaction')
  }

  /**
   * Sign and broadcast a transaction making a round robin over the clients urls provided to the client
   *
   * @param {string} sender Sender address
   * @param {DirectSecp256k1HdWallet} signer Signer
   * @param {BigNumber} gasLimit Gas limit for the transaction
   * @param {BaseAmount} amount Amount to deposit
   * @param {string} memo Deposit memo
   * @param {Asset} asset Asset to deposit
   * @returns {DeliverTxResponse} The transaction broadcasted
   */
  private async roundRobinSignAndBroadcastDeposit(
    sender: string,
    signer: DirectSecp256k1HdWallet,
    gasLimit: BigNumber,
    amount: BaseAmount,
    memo: string,
    asset: Asset,
  ): Promise<DeliverTxResponse> {
    for (const url of this.clientUrls[this.network]) {
      try {
        const signingClient = await SigningStargateClient.connectWithSigner(url, signer, {
          registry: this.registry,
        })

        // Sign and broadcast transaction
        return await signingClient.signAndBroadcast(
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
      } catch {}
    }
    throw Error('No clients available. Can not sign and broadcast deposit transaction')
  }
}
