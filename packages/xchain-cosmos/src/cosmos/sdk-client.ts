import { TxHash, TxHistoryParams } from '@xchainjs/xchain-client'
import * as xchainCrypto from '@xchainjs/xchain-crypto'
import axios from 'axios'
import * as BIP32 from 'bip32'
import { cosmosclient, proto, rest } from 'cosmos-client'
import { setBech32Prefix } from 'cosmos-client/cjs/config/module'
import { Coin } from 'cosmos-client/cjs/openapi/api'

import { getQueryString } from '../util'

import {
  APIQueryParam,
  CosmosSDKClientParams,
  RPCResponse,
  RPCTxSearchResult,
  SearchTxParams,
  TransferParams,
  TxHistoryResponse,
  TxResponse,
} from './types'

const DEFAULT_FEE = new proto.cosmos.tx.v1beta1.Fee({
  amount: [],
  gas_limit: cosmosclient.Long.fromString('200000'),
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
    this.prefix = prefix
    this.sdk = new cosmosclient.CosmosSDK(this.server, this.chainId)
  }

  updatePrefix(prefix: string) {
    this.prefix = prefix
    this.setPrefix()
  }

  setPrefix(): void {
    setBech32Prefix({
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

  async getBalance(address: string): Promise<Coin[]> {
    this.setPrefix()

    const accAddress = cosmosclient.AccAddress.fromString(address)
    const response = await rest.cosmos.bank.allBalances(this.sdk, accAddress)
    return response.data.balances as Coin[]
  }

  async getAccount(address: cosmosclient.AccAddress): Promise<proto.cosmos.auth.v1beta1.IBaseAccount> {
    const account = await rest.cosmos.auth
      .account(this.sdk, address)
      .then((res) => res.data.account && cosmosclient.codec.unpackCosmosAny(res.data.account))
      .catch((_) => undefined)
    if (!(account instanceof proto.cosmos.auth.v1beta1.BaseAccount)) {
      throw Error('could not get account')
    }
    return account
  }
  async searchTx({
    messageAction,
    messageSender,
    page,
    limit,
    txMinHeight,
    txMaxHeight,
  }: SearchTxParams): Promise<TxHistoryResponse> {
    const queryParameter: APIQueryParam = {}
    if (messageAction !== undefined) {
      queryParameter['message.action'] = messageAction
    }
    if (messageSender !== undefined) {
      queryParameter['message.sender'] = messageSender
    }
    if (page !== undefined) {
      queryParameter['page'] = page.toString()
    }
    if (limit !== undefined) {
      queryParameter['limit'] = limit.toString()
    }
    if (txMinHeight !== undefined) {
      queryParameter['tx.minheight'] = txMinHeight.toString()
    }
    if (txMaxHeight !== undefined) {
      queryParameter['tx.maxheight'] = txMaxHeight.toString()
    }

    this.setPrefix()

    return (await axios.get<TxHistoryParams>(`${this.server}/txs?${getQueryString(queryParameter)}`)).data
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

    return (await axios.get<TxResponse>(`${this.server}/txs/${hash}`)).data
  }

  async transfer({ privkey, from, to, amount, asset, memo = '', fee = DEFAULT_FEE }: TransferParams): Promise<TxHash> {
    this.setPrefix()

    const msgSend = new proto.cosmos.bank.v1beta1.MsgSend({
      from_address: from,
      to_address: to,
      amount: [
        {
          amount: amount.toString(),
          denom: asset,
        },
      ],
    })

    const pubKey = privkey.pubKey()
    const signer = cosmosclient.AccAddress.fromPublicKey(pubKey)
    const account = await this.getAccount(signer)
    const txBody = new proto.cosmos.tx.v1beta1.TxBody({
      messages: [cosmosclient.codec.packAny(msgSend)],
      memo,
    })
    const authInfo = new proto.cosmos.tx.v1beta1.AuthInfo({
      signer_infos: [
        {
          public_key: cosmosclient.codec.packAny(pubKey),
          mode_info: {
            single: {
              mode: proto.cosmos.tx.signing.v1beta1.SignMode.SIGN_MODE_DIRECT,
            },
          },
          sequence: account.sequence,
        },
      ],
      fee,
    })
    // console.log(JSON.stringify(txBody, null, 2))
    // console.log(JSON.stringify(authInfo, null, 2))
    // sign
    const txBuilder = new cosmosclient.TxBuilder(this.sdk, txBody, authInfo)

    return this.signAndBroadcast(txBuilder, privkey, account)
  }

  async signAndBroadcast(
    txBuilder: cosmosclient.TxBuilder,
    privKey: proto.cosmos.crypto.secp256k1.PrivKey,
    signerAccount: proto.cosmos.auth.v1beta1.IBaseAccount,
  ): Promise<string> {
    this.setPrefix()

    if (!signerAccount || !signerAccount.account_number) throw new Error('Invalid Account')

    // sign
    const signDocBytes = txBuilder.signDocBytes(signerAccount.account_number)
    txBuilder.addSignature(privKey.sign(signDocBytes))

    //  this broadcast finction does not work!!
    // const res = await rest.cosmos.tx.broadcastTx(this.sdk, {
    //   tx_bytes: txBuilder.txBytes(),
    //   mode: rest.cosmos.tx.BroadcastTxMode.Sync,
    // })
    const res = await axios.post(`${this.server}/cosmos/tx/v1beta1/txs`, {
      tx_bytes: txBuilder.txBytes(),
      mode: rest.cosmos.tx.BroadcastTxMode.Block,
    })

    if (res?.data?.tx_response?.code !== 0) {
      throw new Error('Error broadcasting: ' + res?.data?.tx_response?.raw_log)
    }
    return res.data.tx_response.txhash
  }
}
