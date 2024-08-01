import { AminoMsg, StdFee } from '@cosmjs/amino'
import { toBase64 } from '@cosmjs/encoding'
import { encodePubkey, makeAuthInfoBytes } from '@cosmjs/proto-signing'
import { AminoTypes } from '@cosmjs/stargate'
import Transport from '@ledgerhq/hw-transport'
import THORChainApp, { extractSignatureFromTLV } from '@xchainjs/ledger-thorchain'
import { CompatibleAsset, base64ToBech32, bech32ToBase64 } from '@xchainjs/xchain-cosmos-sdk'
import { assetFromStringEx, assetToString } from '@xchainjs/xchain-util'
import { BigNumber } from 'bignumber.js'
import { SignMode } from 'cosmjs-types/cosmos/tx/signing/v1beta1/signing'
import { TxRaw } from 'cosmjs-types/cosmos/tx/v1beta1/tx'

import { Client, ThorchainClientParams } from './client'
import { AssetRuneNative, DEPOSIT_GAS_LIMIT_VALUE, defaultClientConfig } from './const'
import { DepositParam, TxParams } from './types'
import { parseAssetToTHORNodeAsset, parseDerivationPath, sortAndStringifyJson, sortedObject } from './utils'

/**
 * Thorchain Ledger client
 */
export class ClientLedger extends Client {
  private app: THORChainApp

  constructor(params: ThorchainClientParams & { transport: Transport }) {
    super({ ...defaultClientConfig, ...params })
    this.app = new THORChainApp(params.transport)
  }

  /**
   * Asynchronous version of getAddress method.
   * @param {number} index Derivation path index of the address to be generated.
   * @param {boolean} verify True to check the address against the Ledger device, otherwise false
   * @returns {string} A promise that resolves to the generated address.
   */
  public async getAddressAsync(index?: number, verify = false): Promise<string> {
    const derivationPath = parseDerivationPath(this.getFullDerivationPath(index || 0))
    const { bech32Address } = verify
      ? await this.app.showAddressAndPubKey(derivationPath, this.getPrefix(this.network))
      : await this.app.getAddressAndPubKey(derivationPath, this.getPrefix(this.network))

    return bech32Address
  }

  /**
   * @deprecated
   * Asynchronous version of getAddress method. Not supported for ledger client
   * @throws {Error} Not supported method
   */
  public getAddress(): string {
    throw Error('Sync method not supported for Ledger')
  }

  /**
   * Transfers RUNE or synth token
   *
   * @param {TxParams} params The transfer options.
   * @param {number} params.walletIndex Optional - The index to use to generate the address from the transaction will be done.
   * If it is not set, address associated with index 0 will be used
   * @param {asset} params.asset Optional - The asset that will be deposit. If it is not set, Thorchain native asset will be
   * used
   * @param {BaseAmount} params.amount The amount that will be transfer
   * @param {string} params.recipient Recipient of the transfer
   * @param {string} params.memo Optional - The memo associated with the transfer
   * @returns {TxHash} The transaction hash.
   */
  public async transfer(params: TxParams): Promise<string> {
    const signedTx = await this.transferOffline(params)
    return this.broadcastTx(signedTx)
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
    asset = AssetRuneNative,
    amount,
    memo,
    gasLimit = new BigNumber(DEPOSIT_GAS_LIMIT_VALUE),
  }: DepositParam): Promise<string> {
    const sender = await this.getAddressAsync(walletIndex || 0)
    const account = await this.getAccount(sender)

    const formattedDP = parseDerivationPath(this.getFullDerivationPath(walletIndex || 0))

    const { compressedPk } = await this.app.getAddressAndPubKey(formattedDP, this.getPrefix(this.getNetwork()))

    const pubkey = encodePubkey({
      type: 'tendermint/PubKeySecp256k1',
      value: toBase64(compressedPk),
    })

    const msgs = sortedObject([
      {
        type: 'thorchain/MsgDeposit',
        value: {
          signer: sender,
          memo,
          coins: [
            {
              amount: amount.amount().toString(),
              asset: assetToString(asset),
            },
          ],
        },
      },
    ])

    const fee: StdFee = { amount: [], gas: gasLimit.toString() }

    const { signature, returnCode, errorMessage } = await this.app.sign(
      formattedDP,
      sortAndStringifyJson({
        account_number: account.accountNumber.toString(),
        chain_id: await this.getChainId(),
        fee,
        memo,
        msgs,
        sequence: account.sequence.toString(),
      }),
    )

    if (!signature) throw Error(`Can not sign deposit transaction. Return code ${returnCode}. Error: ${errorMessage}`)

    const aminoTypes = this.getProtocolAminoMessages()

    const rawTx = TxRaw.fromPartial({
      bodyBytes: await this.registry.encodeTxBody({
        memo,
        messages: msgs.map((msg: AminoMsg) => aminoTypes.fromAmino(msg)),
      }),
      authInfoBytes: makeAuthInfoBytes(
        [
          {
            pubkey,
            sequence: account.sequence,
          },
        ],
        fee.amount,
        Number.parseInt(fee.gas),
        undefined,
        undefined,
        SignMode.SIGN_MODE_LEGACY_AMINO_JSON,
      ),
      signatures: [extractSignatureFromTLV(signature)],
    })

    return this.broadcastTx(toBase64(TxRaw.encode(rawTx).finish()))
  }

  /**
   * @deprecated
   * Create a transaction and sign it without broadcasting it
   *
   * @param {TxParams} params The transfer options.
   * @param {number} params.walletIndex Optional - The index to use to generate the address from the transaction will be done.
   * If it is not set, address associated with index 0 will be used
   * @param {asset} params.asset Optional - The asset that will be deposit. If it is not set, Thorchain native asset will be
   * used
   * @param {BaseAmount} params.amount The amount that will be transfer
   * @param {string} params.recipient Recipient of the transfer
   * @param {string} params.memo Optional - The memo associated with the transfer
   * @returns {TxHash} The transaction hash.
   */
  public async transferOffline(params: TxParams): Promise<string> {
    const sender = await this.getAddressAsync(params.walletIndex || 0)
    const account = await this.getAccount(sender)

    const formattedDP = parseDerivationPath(this.getFullDerivationPath(params.walletIndex || 0))

    const { compressedPk } = await this.app.getAddressAndPubKey(formattedDP, this.getPrefix(this.getNetwork()))

    const pubkey = encodePubkey({
      type: 'tendermint/PubKeySecp256k1',
      value: toBase64(compressedPk),
    })

    const msgs = sortedObject([
      {
        type: 'thorchain/MsgSend',
        value: {
          from_address: sender,
          to_address: params.recipient,
          amount: [
            {
              amount: params.amount.amount().toString(),
              denom: this.getDenom(params.asset || AssetRuneNative),
            },
          ],
        },
      },
    ])

    const fee = this.getStandardFee()

    const { signature, returnCode, errorMessage } = await this.app.sign(
      formattedDP,
      sortAndStringifyJson({
        account_number: account.accountNumber.toString(),
        chain_id: await this.getChainId(),
        fee,
        memo: params.memo || '',
        msgs,
        sequence: account.sequence.toString(),
      }),
    )

    if (!signature) throw Error(`Can not sign transfer transaction. Return code ${returnCode}. Error: ${errorMessage}`)

    const aminoTypes = this.getProtocolAminoMessages()

    const rawTx = TxRaw.fromPartial({
      bodyBytes: await this.registry.encodeTxBody({
        messages: msgs.map((msg: AminoMsg) => aminoTypes.fromAmino(msg)),
        memo: params.memo,
      }),
      authInfoBytes: makeAuthInfoBytes(
        [
          {
            pubkey,
            sequence: account.sequence,
          },
        ],
        fee.amount,
        Number.parseInt(fee.gas),
        undefined,
        undefined,
        SignMode.SIGN_MODE_LEGACY_AMINO_JSON,
      ),
      signatures: [extractSignatureFromTLV(signature)],
    })

    return toBase64(TxRaw.encode(rawTx).finish())
  }

  private getProtocolAminoMessages(): AminoTypes {
    const prefix = this.getPrefix(this.network)
    return new AminoTypes({
      '/types.MsgSend': {
        aminoType: `thorchain/MsgSend`,
        toAmino: (params) => ({
          from_address: base64ToBech32(params.fromAddress, prefix),
          to_address: base64ToBech32(params.toAddress, prefix),
          amount: [...params.amount],
        }),
        fromAmino: (params) => ({
          fromAddress: bech32ToBase64(params.from_address),
          toAddress: bech32ToBase64(params.to_address),
          amount: [...params.amount],
        }),
      },
      '/types.MsgDeposit': {
        aminoType: `thorchain/MsgDeposit`,
        toAmino: (params) => ({
          signer: base64ToBech32(params.signer, prefix),
          memo: params.memo,
          coins: params.coins.map((coin: { asset: CompatibleAsset }) => {
            return {
              ...coin,
              asset: assetToString(coin.asset),
            }
          }),
        }),
        fromAmino: (params) => ({
          signer: bech32ToBase64(params.signer),
          memo: params.memo,
          coins: params.coins.map((coin: { asset: string; amount: string }) => {
            return {
              ...coin,
              asset: parseAssetToTHORNodeAsset(assetFromStringEx(coin.asset)),
            }
          }),
        }),
      },
    })
  }
}
