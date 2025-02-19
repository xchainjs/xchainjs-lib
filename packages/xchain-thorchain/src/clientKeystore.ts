import { Bip39, EnglishMnemonic, Secp256k1, Slip10, Slip10Curve } from '@cosmjs/crypto'
import { fromBase64, toBase64 } from '@cosmjs/encoding'
import { DecodedTxRaw, DirectSecp256k1HdWallet, EncodeObject, decodeTxRaw } from '@cosmjs/proto-signing'
import { Account, DeliverTxResponse, SigningStargateClient } from '@cosmjs/stargate'
import {
  // Import client-related types and functions from @xchainjs/xchain-cosmos-sdk for Cosmos SDK client configuration.
  MsgTypes,
  bech32ToBase64,
  makeClientPath,
} from '@xchainjs/xchain-cosmos-sdk'
import { getSeed } from '@xchainjs/xchain-crypto'
import { BaseAmount } from '@xchainjs/xchain-util'
import { encode, toWords } from 'bech32'
import { BigNumber } from 'bignumber.js'
import { fromSeed } from 'bip32'
import { TxRaw } from 'cosmjs-types/cosmos/tx/v1beta1/tx'
import { createHash } from 'crypto'
import { publicKeyCreate } from 'secp256k1'

import { Client } from './client'
import {
  AssetRuneNative as AssetRUNE,
  DEFAULT_GAS_LIMIT_VALUE,
  DEPOSIT_GAS_LIMIT_VALUE,
  MSG_DEPOSIT_TYPE_URL,
} from './const'
import { CompatibleAsset, DepositParam, TxOfflineParams, TxParams } from './types'
import { parseAssetToTHORNodeAsset } from './utils'

/**
 * Thorchain Keystore client
 */
export class ClientKeystore extends Client {
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
  public getAddress(walletIndex?: number): string {
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

  /**
   * Get the Account frmom Address.
   * @param {number | undefined} walletIndex The index of the address derivation path. Default is 0.
   * @returns {Account} The Account holder details or error if account does not exist
   */
  async getAccountDetails(walletIndex?: number): Promise<Account> {
    const account = await this.getAccount(this.getAddress(walletIndex))
    return account
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
   * Make a deposit
   *
   * @param {number} param.walletIndex Optional - The index to use to generate the address from the transaction will be done.
   * If it is not set, address associated with index 0 will be used
   * @param {CompatibleAsset} param.asset Optional - The asset that will be deposit. If it is not set, Thorchain native asset will be
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
      try {
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
   * @param {CompatibleAsset} asset Asset to deposit
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
      } catch {}
    }
    throw Error('No clients available. Can not sign and broadcast deposit transaction')
  }
}
