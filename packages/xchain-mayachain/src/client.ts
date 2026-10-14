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
import { AssetInfo, Network, PreparedTx, TxHash } from '@xchainjs/xchain-client'
import {
  Client as CosmosSDKClient,
  CosmosSdkClientParams,
  MsgTypes,
  bech32ToBase64,
  makeClientPath,
  roundRobinTry,
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

export interface MayachainClient {
  deposit(params: DepositParam): Promise<TxHash>
  getDepositTransaction(txId: string): Promise<DepositTx>
  transferOffline(params: TxOfflineParams): Promise<string>
}

export type MayachainClientParams = Partial<CosmosSdkClientParams>

export class Client extends CosmosSDKClient implements MayachainClient {
  constructor(config: MayachainClientParams = defaultClientConfig) {
    super({
      ...defaultClientConfig,
      ...config,
    })
  }

  async getAddressAsync(index = 0): Promise<string> {
    return this.getAddress(index)
  }

  public getAddress(walletIndex?: number): string {
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
    return this.withTxLock(async () => {
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

      // Sign once, then round-robin only the broadcast. Retrying signAndBroadcast after a
      // transport timeout can re-sign with a new sequence and submit a second transaction.
      const rawTx = await this.roundRobinSign(sender, unsignedTx, signer, new BigNumber(this.getStandardFee().gas))

      return this.broadcastTx(toBase64(TxRaw.encode(rawTx).finish()))
    })
  }

  protected getPrefix(network: Network): string {
    return getPrefix(network)
  }

  public getAssetInfo(): AssetInfo {
    return {
      asset: AssetCacao,
      decimal: CACAO_DECIMAL,
    }
  }

  public getAssetDecimals(asset: CompatibleAsset): number {
    if (eqAsset(asset, AssetCacao)) return CACAO_DECIMAL
    if (eqAsset(asset, AssetMaya)) return MAYA_DECIMAL
    if (isSynthAsset(asset)) return SYNTH_DECIMAL
    return this.defaultDecimals
  }

  public getExplorerUrl(): string {
    return getDefaultExplorers()[this.network]
  }

  public getExplorerAddressUrl(address: string): string {
    return getExplorerAddressUrl(address)[this.network]
  }

  public getExplorerTxUrl(txID: string): string {
    return getExplorerTxUrl(txID)[this.network]
  }

  public assetFromDenom(denom: string): CompatibleAsset | null {
    if (denom === CACAO_DENOM) return AssetCacao
    if (denom === MAYA_DENOM) return AssetMaya
    return assetFromString(denom.toUpperCase())
  }

  public getDenom(asset: CompatibleAsset): string | null {
    return getDenom(asset)
  }

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

  public async deposit({
    walletIndex = 0,
    asset = AssetCacao,
    amount,
    memo,
    gasLimit = new BigNumber(DEPOSIT_GAS_LIMIT_VALUE),
  }: DepositParam): Promise<string> {
    return this.withTxLock(async () => {
      const sender = await this.getAddressAsync(walletIndex)
      const signer = await DirectSecp256k1HdWallet.fromMnemonic(this.phrase as string, {
        prefix: this.prefix,
        hdPaths: [makeClientPath(this.getFullDerivationPath(walletIndex || 0))],
      })

      // Sign once, then round-robin only the broadcast (same bytes → same tx hash).
      const rawTx = await this.roundRobinSignDeposit(sender, signer, gasLimit, amount, memo, asset)

      return this.broadcastTx(toBase64(TxRaw.encode(rawTx).finish()))
    })
  }

  /** @deprecated Use prepareTx instead. */
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
      recipient,
      asset,
      amount,
      memo,
    })
    const unsignedTx: DecodedTxRaw = decodeTxRaw(fromBase64(rawUnsignedTx))
    const signer = await DirectSecp256k1HdWallet.fromMnemonic(this.phrase as string, {
      prefix: this.prefix,
      hdPaths: [makeClientPath(this.getFullDerivationPath(walletIndex))],
    })
    const rawTx = await this.roundRobinSign(sender, unsignedTx, signer, gasLimit)
    return toBase64(TxRaw.encode(rawTx).finish())
  }

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

  public async getPubKey(index = 0): Promise<Uint8Array> {
    const privateKey = await this.getPrivateKey(index)
    const { pubkey } = await Secp256k1.makeKeypair(privateKey)
    return Secp256k1.compressPubkey(pubkey)
  }

  /** @deprecated Use getTransactionData instead */
  public async getDepositTransaction(txId: string): Promise<DepositTx> {
    return this.getTransactionData(txId)
  }

  protected getMsgTypeUrlByType(msgType: MsgTypes): string {
    const messageTypeUrls: Record<MsgTypes, string> = {
      [MsgTypes.TRANSFER]: MSG_SEND_TYPE_URL,
    }
    return messageTypeUrls[msgType]
  }

  protected getStandardFee(): StdFee {
    return { amount: [], gas: '4000000' }
  }

  /** Hashes a buffer using SHA256 followed by RIPEMD160 or RMD160. */
  private hash160(buffer: Uint8Array): Buffer {
    const sha256Hash: Buffer = createHash('sha256').update(buffer).digest()
    try {
      return createHash('rmd160').update(sha256Hash).digest()
    } catch (_err) {
      return createHash('ripemd160').update(sha256Hash).digest()
    }
  }

  private async roundRobinSign(
    sender: string,
    unsignedTx: DecodedTxRaw,
    signer: DirectSecp256k1HdWallet,
    gasLimit: BigNumber,
  ): Promise<TxRaw> {
    return roundRobinTry(this.clientUrls[this.network], 'sign transaction', async (url) => {
      const signingClient = await SigningStargateClient.connectWithSigner(url, signer, {
        registry: this.registry,
      })
      const messages: EncodeObject[] = unsignedTx.body.messages.map((message) => {
        return { typeUrl: this.getMsgTypeUrlByType(MsgTypes.TRANSFER), value: signingClient.registry.decode(message) }
      })

      return signingClient.sign(
        sender,
        messages,
        {
          amount: [],
          gas: gasLimit.toString(),
        },
        unsignedTx.body.memo,
      )
    })
  }

  /** Does not broadcast — callers must broadcast the signed bytes once via broadcastTx. */
  private async roundRobinSignDeposit(
    sender: string,
    signer: DirectSecp256k1HdWallet,
    gasLimit: BigNumber,
    amount: BaseAmount,
    memo: string,
    asset: CompatibleAsset,
  ): Promise<TxRaw> {
    return roundRobinTry(this.clientUrls[this.network], 'sign deposit transaction', async (url) => {
      const signingClient = await SigningStargateClient.connectWithSigner(url, signer, {
        registry: this.registry,
      })
      return signingClient.sign(
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
    })
  }
}
