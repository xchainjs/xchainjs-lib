import { AminoMsg, StdFee } from '@cosmjs/amino'
import { toBase64 } from '@cosmjs/encoding'
import { encodePubkey, makeAuthInfoBytes } from '@cosmjs/proto-signing'
import { AminoTypes } from '@cosmjs/stargate'
import Transport from '@ledgerhq/hw-transport'
import THORChainApp, { extractSignatureFromTLV } from '@xchainjs/ledger-thorchain'
import { TxParams } from '@xchainjs/xchain-client'
import { base64ToBech32, bech32ToBase64 } from '@xchainjs/xchain-cosmos-sdk'
import { Asset, assetFromStringEx, assetToString } from '@xchainjs/xchain-util'
import { BigNumber } from 'bignumber.js'
import { SignMode } from 'cosmjs-types/cosmos/tx/signing/v1beta1/signing'
import { TxRaw } from 'cosmjs-types/cosmos/tx/v1beta1/tx'

import { Client, ThorchainClientParams } from './client'
import { AssetRuneNative, DEPOSIT_GAS_LIMIT_VALUE, defaultClientConfig } from './const'
import { DepositParam } from './types'
import { parseDerivationPath, sortAndStringifyJson, sortedObject } from './utils'

export class ClientLedger extends Client {
  private app: THORChainApp

  constructor(params: ThorchainClientParams & { transport: Transport }) {
    super({ ...defaultClientConfig, ...params })
    this.app = new THORChainApp(params.transport)
  }

  public async getAddressAsync(index?: number, verify = false): Promise<string> {
    const derivationPath = parseDerivationPath(this.getFullDerivationPath(index || 0))
    const { bech32Address } = verify
      ? await this.app.showAddressAndPubKey(derivationPath, this.getPrefix(this.network))
      : await this.app.getAddressAndPubKey(derivationPath, this.getPrefix(this.network))

    return bech32Address
  }

  public getAddress(): string {
    throw Error('Sync method not supported for Ledger')
  }

  public async transfer(params: TxParams): Promise<string> {
    const signedTx = await this.transferOffline(params)
    return this.broadcastTx(signedTx)
  }

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
          coins: params.coins.map((coin: { asset: Asset }) => {
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
              asset: assetFromStringEx(coin.asset),
            }
          }),
        }),
      },
    })
  }
}
