import { Bip39, EnglishMnemonic, Secp256k1, Slip10, Slip10Curve } from '@cosmjs/crypto'
import { fromBase64, toBase64 } from '@cosmjs/encoding'
import { DecodedTxRaw, DirectSecp256k1HdWallet, EncodeObject, decodeTxRaw } from '@cosmjs/proto-signing'
import { Account, SigningStargateClient } from '@cosmjs/stargate'
import { MsgTypes, bech32ToBase64, makeClientPath, roundRobinTry } from '@xchainjs/xchain-cosmos-sdk'
import { getSeed } from '@xchainjs/xchain-crypto'
import { BaseAmount } from '@xchainjs/xchain-util'
import { bech32 } from '@scure/base'
import BigNumber from 'bignumber.js'
import { HDKey } from '@scure/bip32'
import { TxRaw } from 'cosmjs-types/cosmos/tx/v1beta1/tx.js'
import { createHash } from 'crypto'
import * as secp from '@bitcoin-js/tiny-secp256k1-asmjs'

import { Client } from './client'
import {
  AssetRuneNative as AssetRUNE,
  DEFAULT_GAS_LIMIT_VALUE,
  DEPOSIT_GAS_LIMIT_VALUE,
  MSG_DEPOSIT_TYPE_URL,
} from './const'
import { CompatibleAsset, DepositParam, TxOfflineParams, TxParams } from './types'
import { parseAssetToTHORNodeAsset } from './utils'

export class ClientKeystore extends Client {
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

  async getAccountDetails(walletIndex?: number): Promise<Account> {
    const account = await this.getAccount(this.getAddress(walletIndex))
    return account
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

  public async deposit({
    walletIndex = 0,
    asset = AssetRUNE,
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

  /** @deprecated Use prepare Tx instead */
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

    const rawTx = await this.roundRobinSign(sender, unsignedTx, signer, gasLimit)

    return toBase64(TxRaw.encode(rawTx).finish())
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
                  asset: parseAssetToTHORNodeAsset(asset),
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
