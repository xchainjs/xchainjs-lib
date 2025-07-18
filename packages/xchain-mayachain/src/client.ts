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
import { DeliverTxResponse, SigningStargateClient } from '@cosmjs/stargate'
import { AssetInfo, Network, PreparedTx, TxHash } from '@xchainjs/xchain-client'
import {
  Client as CosmosSDKClient,
  CosmosSdkClientParams,
  MsgTypes,
  bech32ToBase64,
  makeClientPath,
} from '@xchainjs/xchain-cosmos-sdk'
import { getSeed } from '@xchainjs/xchain-crypto'
import { Address, BaseAmount, assetFromString, eqAsset, isSynthAsset } from '@xchainjs/xchain-util'
import { bech32 } from '@scure/base'
import BigNumber from 'bignumber.js'
import { HDKey } from '@scure/bip32'
import { TxRaw } from 'cosmjs-types/cosmos/tx/v1beta1/tx.js'
import { createHash } from 'crypto'
import * as secp from '@bitcoin-js/tiny-secp256k1-asmjs'

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
  SYNTH_DECIMAL,
  defaultClientConfig,
} from './const'
import { CompatibleAsset, DepositParam, DepositTx, TxOfflineParams, TxParams } from './types'
import {
  getDefaultExplorers,
  getDenom,
  getExplorerAddressUrl,
  getExplorerTxUrl,
  getPrefix,
  parseAssetToMayanodeAsset,
} from './utils'

/**
 * Interface representing a MayaChain client.
 */
export interface MayachainClient {
  /**
   * Deposit funds into the MayaChain.
   *
   * @param {DepositParam} params Parameters for the deposit.
   * @returns {Promise<TxHash>} The transaction hash of the deposit.
   */
  deposit(params: DepositParam): Promise<TxHash>
  /**
   * Get the deposit transaction details.
   *
   * @param {string} txId The transaction ID.
   * @returns {Promise<DepositTx>} The deposit transaction details.
   */
  getDepositTransaction(txId: string): Promise<DepositTx>
  /**
   * Transfer funds offline within the MayaChain.
   *
   * @param {TxOfflineParams} params Parameters for the offline transfer.
   * @returns {Promise<string>} The result of the offline transfer.
   */
  transferOffline(params: TxOfflineParams): Promise<string>
}

/**
 * Parameters to instantiate the MayaChain client.
 */
export type MayachainClientParams = Partial<CosmosSdkClientParams>

/**
 * Custom MayaChain client.
 */
export class Client extends CosmosSDKClient implements MayachainClient {
  /**
   * Constructor for the MayaChain client.
   *
   * @param {MayachainClientParams} config Optional configuration for the client. Default values will be used if not provided.
   */
  constructor(config: MayachainClientParams = defaultClientConfig) {
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
    const node = HDKey.fromMasterSeed(seed)
    const child = node.derive(this.getFullDerivationPath(walletIndex || 0))

    if (!child.privateKey) throw new Error('child does not have a privateKey')

    // TODO: Make this method async and use CosmosJS official address generation strategy
    const pubKey = secp.pointFromScalar(child.privateKey, true)
    if (!pubKey) throw new Error('pubKey is null')
    const rawAddress = this.hash160(pubKey)
    const words = bech32.toWords(new Uint8Array(rawAddress))
    const address = bech32.encode(this.prefix, words)
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
   * Get the address prefix for the given network.
   *
   * @param {Network} network The network identifier.
   * @returns {string} The address prefix.
   */
  protected getPrefix(network: Network): string {
    return getPrefix(network)
  }

  /**
   * Get information about the native asset of the MayaChain.
   *
   * @returns {AssetInfo} Information about the native asset.
   */
  public getAssetInfo(): AssetInfo {
    return {
      asset: AssetCacao,
      decimal: CACAO_DECIMAL,
    }
  }

  /**
   * Get the number of decimals for a given asset.
   *
   * @param {CompatibleAsset} asset The asset for which to retrieve the decimals.
   * @returns {number} The number of decimals.
   */
  public getAssetDecimals(asset: CompatibleAsset): number {
    if (eqAsset(asset, AssetCacao)) return CACAO_DECIMAL
    if (eqAsset(asset, AssetMaya)) return MAYA_DECIMAL
    if (isSynthAsset(asset)) return SYNTH_DECIMAL
    return this.defaultDecimals
  }

  /**
   * Get the explorer URL for the current network.
   *
   * @returns {string} The explorer URL for the current network.
   */
  public getExplorerUrl(): string {
    return getDefaultExplorers()[this.network]
  }

  /**
   * Get the explorer URL for the given address.
   *
   * @param {Address} address The address for which to retrieve the explorer URL.
   * @returns {string} The explorer URL for the given address.
   */
  public getExplorerAddressUrl(address: string): string {
    return getExplorerAddressUrl(address)[this.network]
  }

  /**
   * Get the explorer URL for the given transaction ID.
   *
   * @param {string} txID The transaction ID for which to retrieve the explorer URL.
   * @returns {string} The explorer URL for the given transaction ID.
   */
  public getExplorerTxUrl(txID: string): string {
    return getExplorerTxUrl(txID)[this.network]
  }

  /**
   * Get the asset corresponding to the provided denomination.
   *
   * @param {string} denom The denomination for which to retrieve the asset.
   * @returns {CompatibleAsset|null} The asset corresponding to the denomination, or null if not found.
   */
  public assetFromDenom(denom: string): CompatibleAsset | null {
    if (denom === CACAO_DENOM) return AssetCacao
    if (denom === MAYA_DENOM) return AssetMaya
    return assetFromString(denom.toUpperCase())
  }

  /**
   * Get the denomination of the provided asset.
   *
   * @param {CompatibleAsset} asset The asset for which to retrieve the denomination.
   * @returns {string|null} The denomination of the asset, or null if not found.
   */
  public getDenom(asset: CompatibleAsset): string | null {
    return getDenom(asset)
  }

  /**
   * Prepare a transaction for transfer.
   *
   * @param {TxParams&Address} params The transfer options.
   * @returns {Promise<PreparedTx>} The raw unsigned transaction.
   * @throws {Error} If sender or recipient addresses are invalid, or if the asset symbol is invalid.
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
   * Deposit assets into the Mayachain network.
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
    // Get the sender's address
    const sender = await this.getAddressAsync(walletIndex)
    // Create a signer from the mnemonic
    const signer = await DirectSecp256k1HdWallet.fromMnemonic(this.phrase as string, {
      prefix: this.prefix,
      hdPaths: [makeClientPath(this.getFullDerivationPath(walletIndex || 0))],
    })
    // Connect to the signing client

    const tx = await this.roundRobinSignAndBroadcastDeposit(sender, signer, gasLimit, amount, memo, asset)
    // Return the transaction hash
    return tx.transactionHash
  }

  /**
   * Create and sign a transaction without broadcasting it.
   *
   * @deprecated Use prepareTx instead.
   * @param {TxOfflineParams} params The offline transaction parameters.
   * @returns {Promise<string>} The raw unsigned transaction.
   */
  public async transferOffline({
    walletIndex = 0,
    recipient,
    asset,
    amount,
    memo,
    gasLimit = new BigNumber(DEFAULT_GAS_LIMIT_VALUE),
  }: TxOfflineParams & { gasLimit?: BigNumber }): Promise<string> {
    // Get the sender's address
    const sender = await this.getAddressAsync(walletIndex)
    // Prepare the transaction
    const { rawUnsignedTx } = await this.prepareTx({
      sender,
      recipient,
      asset,
      amount,
      memo,
    })
    // Decode the unsigned transaction
    const unsignedTx: DecodedTxRaw = decodeTxRaw(fromBase64(rawUnsignedTx))
    // Create a signer from the mnemonic
    const signer = await DirectSecp256k1HdWallet.fromMnemonic(this.phrase as string, {
      prefix: this.prefix,
      hdPaths: [makeClientPath(this.getFullDerivationPath(walletIndex))],
    })
    // Connect to the signing client
    const rawTx = await this.roundRobinSign(sender, unsignedTx, signer, gasLimit)
    // Return the raw unsigned transaction
    return toBase64(TxRaw.encode(rawTx).finish())
  }

  /**
   * Retrieve the private key associated with the specified index.
   *
   * @param {number} index Optional - The index to use to generate the private key. If it is not set, address associated with
   * index 0 will be used
   * @returns {Uint8Array} The private key
   */
  public async getPrivateKey(index = 0): Promise<Uint8Array> {
    // Generate a mnemonic object from the provided mnemonic phrase
    const mnemonicChecked = new EnglishMnemonic(this.phrase)
    // Derive the seed from the mnemonic
    const seed = await Bip39.mnemonicToSeed(mnemonicChecked)
    // Derive the private key from the seed and derivation path
    const { privkey } = Slip10.derivePath(
      Slip10Curve.Secp256k1,
      seed,
      makeClientPath(this.getFullDerivationPath(index)),
    )
    return privkey
  }

  /**
   * Retrieve the compressed public key associated with the specified index.
   *
   * @param {number} index Optional - The index to use to generate the public key. If not set, the address associated with index 0 will be used.
   * @returns {Uint8Array} The compressed public key
   */
  public async getPubKey(index = 0): Promise<Uint8Array> {
    // Retrieve the private key associated with the specified index
    const privateKey = await this.getPrivateKey(index)
    // Derive the public key from the private key
    const { pubkey } = await Secp256k1.makeKeypair(privateKey)
    // Compress the public key
    return Secp256k1.compressPubkey(pubkey)
  }

  /**
   * Retrieve the deposit transaction information.
   *
   * @deprecated Use getTransactionData instead
   * @param txId The transaction ID.
   */
  public async getDepositTransaction(txId: string): Promise<DepositTx> {
    return this.getTransactionData(txId)
  }

  /**
   * Retrieve the message type URL by type used by the Cosmos SDK client to make certain actions.
   *
   * @param {MsgTypes} msgType The message type of which to return the type URL.
   * @returns {string} The type URL of the message.
   */
  protected getMsgTypeUrlByType(msgType: MsgTypes): string {
    // Define message type URLs for known message types
    const messageTypeUrls: Record<MsgTypes, string> = {
      [MsgTypes.TRANSFER]: MSG_SEND_TYPE_URL,
    }
    // Return the type URL for the specified message type
    return messageTypeUrls[msgType]
  }

  /**
   * Retrieve the standard fee used by the client.
   *
   * @returns {StdFee} The standard fee.
   */
  protected getStandardFee(): StdFee {
    return { amount: [], gas: '4000000' }
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
    for (const url of this.clientUrls[this.network]) {
      try {
        const signingClient = await SigningStargateClient.connectWithSigner(url, signer, {
          registry: this.registry,
        })
        // Map messages and sign the transaction
        const messages: EncodeObject[] = unsignedTx.body.messages.map((message) => {
          return { typeUrl: this.getMsgTypeUrlByType(MsgTypes.TRANSFER), value: signingClient.registry.decode(message) }
        })

        return await signingClient.sign(
          sender,
          messages,
          {
            amount: [],
            gas: gasLimit.toString(),
          },
          unsignedTx.body.memo,
        )
      } catch {}
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
      try {
        const signingClient = await SigningStargateClient.connectWithSigner(url, signer, {
          registry: this.registry,
        })

        const messages: EncodeObject[] = unsignedTx.body.messages.map((message) => {
          return { typeUrl: this.getMsgTypeUrlByType(MsgTypes.TRANSFER), value: signingClient.registry.decode(message) }
        })

        return await signingClient.signAndBroadcast(sender, messages, this.getStandardFee(), unsignedTx.body.memo)
      } catch {}
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
    asset: CompatibleAsset,
  ): Promise<DeliverTxResponse> {
    for (const url of this.clientUrls[this.network]) {
      try {
        const signingClient = await SigningStargateClient.connectWithSigner(url, signer, {
          registry: this.registry,
        })
        // Sign and broadcast the deposit transaction
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
                    asset: parseAssetToMayanodeAsset(asset),
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
