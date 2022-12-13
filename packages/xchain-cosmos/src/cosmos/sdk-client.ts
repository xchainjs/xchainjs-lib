import cosmosclient from '@cosmos-client/core'
import { proto, rest } from '@cosmos-client/core/cjs/module'
import { TxHash, TxHistoryParams } from '@xchainjs/xchain-client'
import * as xchainCrypto from '@xchainjs/xchain-crypto'
import axios from 'axios'
import * as BIP32 from 'bip32'
import Long from 'long'

import { DEFAULT_GAS_LIMIT } from '../const'
import { getQueryString, protoAuthInfo, protoTxBody } from '../util'

import {
  APIQueryParam,
  CosmosSDKClientParams,
  GetTxByHashResponse,
  RPCResponse,
  RPCTxSearchResult,
  SearchTxParams,
  TransferOfflineParams,
  TransferParams,
  TxHistoryResponse,
  TxResponse,
} from './types'

const DEFAULT_FEE = new proto.cosmos.tx.v1beta1.Fee({
  amount: [],
  gas_limit: Long.fromString(DEFAULT_GAS_LIMIT),
})

export class CosmosSDKClient {
  sdk: cosmosclient.CosmosSDK

  server: string
  chainId: string

  prefix = ''

  // by default, cosmos chain
  constructor({ server, chainId, prefix = 'cosmos' }: CosmosSDKClientParams) {
    this.server = server
    this.chainId = chainId
    this.sdk = new cosmosclient.CosmosSDK(server, this.chainId)

    this.updatePrefix(prefix)
  }

  updatePrefix(prefix: string) {
    this.prefix = prefix
    this.setPrefix()
  }

  setPrefix(): void {
    cosmosclient.config.setBech32Prefix({
      accAddr: this.prefix,
      accPub: this.prefix + 'pub',
      valAddr: this.prefix + 'valoper',
      valPub: this.prefix + 'valoperpub',
      consAddr: this.prefix + 'valcons',
      consPub: this.prefix + 'valconspub',
    })
  }

  getAddressFromPrivKey(privkey: proto.cosmos.crypto.secp256k1.PrivKey): string {
    this.setPrefix()

    return cosmosclient.AccAddress.fromPublicKey(privkey.pubKey()).toString()
  }

  getAddressFromMnemonic(mnemonic: string, derivationPath: string): string {
    this.setPrefix()
    const privKey = this.getPrivKeyFromMnemonic(mnemonic, derivationPath)

    return cosmosclient.AccAddress.fromPublicKey(privKey.pubKey()).toString()
  }

  getPrivKeyFromMnemonic(mnemonic: string, derivationPath: string): proto.cosmos.crypto.secp256k1.PrivKey {
    this.setPrefix()
    const seed = xchainCrypto.getSeed(mnemonic)
    const node = BIP32.fromSeed(seed)
    const child = node.derivePath(derivationPath)

    if (!child.privateKey) throw new Error('child does not have a privateKey')

    return new proto.cosmos.crypto.secp256k1.PrivKey({ key: child.privateKey })
  }

  checkAddress(address: string): boolean {
    this.setPrefix()

    if (!address.startsWith(this.prefix)) return false

    try {
      return cosmosclient.AccAddress.fromString(address).toString() === address
    } catch (err) {
      return false
    }
  }

  async getBalance(address: string): Promise<proto.cosmos.base.v1beta1.Coin[]> {
    this.setPrefix()

    const accAddress = cosmosclient.AccAddress.fromString(address)
    const response = await rest.bank.allBalances(this.sdk, accAddress)
    const balances: proto.cosmos.base.v1beta1.Coin[] =
      response.data.balances?.reduce(
        (acc: proto.cosmos.base.v1beta1.Coin[], { amount, denom }) =>
          !!amount && !!denom ? [...acc, new proto.cosmos.base.v1beta1.Coin({ amount, denom })] : acc,
        [],
      ) || []
    return balances
  }

  async getAccount(address: cosmosclient.AccAddress): Promise<proto.cosmos.auth.v1beta1.IBaseAccount> {
    const account = await rest.auth
      .account(this.sdk, address)
      .then((res) => {
        return cosmosclient.codec.protoJSONToInstance(cosmosclient.codec.castProtoJSONOfProtoAny(res.data.account))
      })
      .catch((_) => undefined)

    if (!(account instanceof proto.cosmos.auth.v1beta1.BaseAccount)) {
      throw Error('could not get account')
    }

    return account
  }

  async searchTx({ messageAction, messageSender, page, limit }: SearchTxParams): Promise<TxHistoryResponse> {
    const queryParameter: APIQueryParam = {}

    if (!messageAction && !messageSender) {
      throw new Error('One of messageAction or messageSender must be specified')
    }

    let eventsParam = ''

    if (messageAction !== undefined) {
      eventsParam = `message.action='${messageAction}'`
    }
    if (messageSender !== undefined) {
      const prefix = eventsParam.length > 0 ? ',' : ''
      eventsParam = `${eventsParam}${prefix}message.sender='${messageSender}'`
    }
    if (page !== undefined) {
      queryParameter['page'] = page.toString()
    }
    if (limit !== undefined) {
      queryParameter['limit'] = limit.toString()
    }

    queryParameter['events'] = eventsParam

    this.setPrefix()

    const { data } = await axios.get<TxHistoryParams, { data: TxHistoryResponse }>(
      `${this.server}/cosmos/tx/v1beta1/txs?${getQueryString(queryParameter)}`,
    )

    return data
  }

  async searchTxFromRPC({
    messageAction,
    messageSender,
    transferSender,
    transferRecipient,
    page,
    limit,
    txMinHeight,
    txMaxHeight,
    rpcEndpoint,
  }: SearchTxParams & {
    rpcEndpoint: string
  }): Promise<RPCTxSearchResult> {
    const queryParameter: string[] = []
    if (messageAction !== undefined) {
      queryParameter.push(`message.action='${messageAction}'`)
    }
    if (messageSender !== undefined) {
      queryParameter.push(`message.sender='${messageSender}'`)
    }
    if (transferSender !== undefined) {
      queryParameter.push(`transfer.sender='${transferSender}'`)
    }
    if (transferRecipient !== undefined) {
      queryParameter.push(`transfer.recipient='${transferRecipient}'`)
    }
    if (txMinHeight !== undefined) {
      queryParameter.push(`tx.height>='${txMinHeight}'`)
    }
    if (txMaxHeight !== undefined) {
      queryParameter.push(`tx.height<='${txMaxHeight}'`)
    }

    const searchParameter: string[] = []
    searchParameter.push(`query="${queryParameter.join(' AND ')}"`)

    if (page !== undefined) {
      searchParameter.push(`page="${page}"`)
    }
    if (limit !== undefined) {
      searchParameter.push(`per_page="${limit}"`)
    }
    searchParameter.push(`order_by="desc"`)

    const response: RPCResponse<RPCTxSearchResult> = (
      await axios.get(`${rpcEndpoint}/tx_search?${searchParameter.join('&')}`)
    ).data

    return response.result
  }

  async txsHashGet(hash: string): Promise<TxResponse> {
    this.setPrefix()

    return (await axios.get<GetTxByHashResponse>(`${this.server}/cosmos/tx/v1beta1/txs/${hash}`)).data.tx_response
  }

  async transfer({ privkey, from, to, amount, denom, memo, fee = DEFAULT_FEE }: TransferParams): Promise<TxHash> {
    this.setPrefix()

    const txBody = protoTxBody({ from, to, amount, denom, memo })

    const pubKey = privkey.pubKey()
    const signer = cosmosclient.AccAddress.fromPublicKey(pubKey)

    const account = await this.getAccount(signer)
    const { sequence, account_number: accountNumber } = account
    if (!sequence) throw Error(`Transfer failed - missing sequence`)
    if (!accountNumber) throw Error(`Transfer failed - missing account number`)

    const authInfo = protoAuthInfo({
      pubKey,
      sequence,
      fee,
      mode: proto.cosmos.tx.signing.v1beta1.SignMode.SIGN_MODE_DIRECT,
    })

    const txBuilder = new cosmosclient.TxBuilder(this.sdk, txBody, authInfo)

    return this.signAndBroadcast(txBuilder, privkey, accountNumber)
  }

  async transferSignedOffline({
    privkey,
    from,
    from_account_number = '0',
    from_sequence = '0',
    to,
    amount,
    denom,
    memo = '',
    fee = DEFAULT_FEE,
  }: TransferOfflineParams): Promise<string> {
    const txBody = protoTxBody({ from, to, amount, denom, memo })

    const authInfo = new proto.cosmos.tx.v1beta1.AuthInfo({
      signer_infos: [
        {
          public_key: cosmosclient.codec.instanceToProtoAny(privkey.pubKey()),
          mode_info: {
            single: {
              mode: proto.cosmos.tx.signing.v1beta1.SignMode.SIGN_MODE_DIRECT,
            },
          },
          sequence: Long.fromString(from_sequence),
        },
      ],
      fee,
    })

    const txBuilder = new cosmosclient.TxBuilder(this.sdk, txBody, authInfo)

    const signDocBytes = txBuilder.signDocBytes(Long.fromString(from_account_number))
    txBuilder.addSignature(privkey.sign(signDocBytes))
    return txBuilder.txBytes()
  }

  async signAndBroadcast(
    txBuilder: cosmosclient.TxBuilder,
    privKey: proto.cosmos.crypto.secp256k1.PrivKey,
    accountNumber: Long.Long,
  ): Promise<TxHash> {
    this.setPrefix()

    // sign
    const signDocBytes = txBuilder.signDocBytes(accountNumber)
    txBuilder.addSignature(privKey.sign(signDocBytes))

    // broadcast
    const res = await rest.tx.broadcastTx(this.sdk, {
      tx_bytes: txBuilder.txBytes(),
      mode: rest.tx.BroadcastTxMode.Sync,
    })

    if (res?.data?.tx_response?.code !== 0) {
      throw new Error('Error broadcasting: ' + res?.data?.tx_response?.raw_log)
    }

    if (!res.data?.tx_response?.txhash) {
      throw new Error('Error broadcasting, txhash not present on response')
    }

    return res.data.tx_response.txhash
  }
}
