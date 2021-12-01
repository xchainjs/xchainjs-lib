import { TxHistoryParams } from '@xchainjs/xchain-client'
import * as xchainCrypto from '@xchainjs/xchain-crypto'
import axios from 'axios'
import * as BIP32 from 'bip32'
import { AccAddress, CosmosSDK, Msg, PrivKey, PrivKeySecp256k1 } from 'cosmos-client'
import { BroadcastTxCommitResult, Coin, StdTxSignature } from 'cosmos-client/api'
import { BaseAccount, StdTx, auth } from 'cosmos-client/x/auth'
import { MsgSend, bank } from 'cosmos-client/x/bank'

import { getQueryString } from '../util'

import {
  APIQueryParam,
  BaseAccountResponse,
  CosmosSDKClientParams,
  RPCResponse,
  RPCTxSearchResult,
  SearchTxParams,
  TransferParams,
  TxHistoryResponse,
  TxResponse,
} from './types'

export class CosmosSDKClient {
  sdk: CosmosSDK

  server: string
  chainId: string

  prefix = ''

  // by default, cosmos chain
  constructor({ server, chainId, prefix = 'cosmos' }: CosmosSDKClientParams) {
    this.server = server
    this.chainId = chainId
    this.prefix = prefix
    this.sdk = new CosmosSDK(this.server, this.chainId)
  }

  updatePrefix(prefix: string) {
    this.prefix = prefix
    this.setPrefix()
  }

  setPrefix(): void {
    AccAddress.setBech32Prefix(
      this.prefix,
      this.prefix + 'pub',
      this.prefix + 'valoper',
      this.prefix + 'valoperpub',
      this.prefix + 'valcons',
      this.prefix + 'valconspub',
    )
  }

  getAddressFromPrivKey(privkey: PrivKey): string {
    this.setPrefix()

    return AccAddress.fromPublicKey(privkey.getPubKey()).toBech32()
  }

  getAddressFromMnemonic(mnemonic: string, derivationPath: string): string {
    this.setPrefix()
    const privKey = this.getPrivKeyFromMnemonic(mnemonic, derivationPath)

    return AccAddress.fromPublicKey(privKey.getPubKey()).toBech32()
  }

  getPrivKeyFromMnemonic(mnemonic: string, derivationPath: string): PrivKey {
    const seed = xchainCrypto.getSeed(mnemonic)
    const node = BIP32.fromSeed(seed)
    const child = node.derivePath(derivationPath)

    if (!child.privateKey) throw new Error('child does not have a privateKey')

    return new PrivKeySecp256k1(child.privateKey)
  }

  checkAddress(address: string): boolean {
    this.setPrefix()

    if (!address.startsWith(this.prefix)) return false

    try {
      return AccAddress.fromBech32(address).toBech32() === address
    } catch (err) {
      return false
    }
  }

  async getBalance(address: string): Promise<Coin[]> {
    this.setPrefix()

    const accAddress = AccAddress.fromBech32(address)

    return (await bank.balancesAddressGet(this.sdk, accAddress)).data.result
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

  async transfer({
    privkey,
    from,
    to,
    amount,
    asset,
    memo = '',
    fee = {
      amount: [],
      gas: '200000',
    },
  }: TransferParams): Promise<BroadcastTxCommitResult> {
    this.setPrefix()

    const msg: Msg = [
      MsgSend.fromJSON({
        from_address: from,
        to_address: to,
        amount: [
          {
            amount: amount.toString(),
            denom: asset,
          },
        ],
      }),
    ]
    const signatures: StdTxSignature[] = []

    const unsignedStdTx = StdTx.fromJSON({
      msg,
      fee,
      signatures,
      memo,
    })

    return this.signAndBroadcast(unsignedStdTx, privkey, AccAddress.fromBech32(from))
  }

  async sign(unsignedStdTx: StdTx, privkey: PrivKey, signer: AccAddress): Promise<StdTx> {
    this.setPrefix()

    let account: BaseAccount = (await auth.accountsAddressGet(this.sdk, signer)).data.result
    if (account.account_number === undefined) {
      account = BaseAccount.fromJSON((account as BaseAccountResponse).value)
    }

    return auth.signStdTx(
      this.sdk,
      privkey,
      unsignedStdTx,
      account.account_number.toString(),
      account.sequence.toString(),
    )
  }

  async broadcast(signedStdTx: StdTx): Promise<BroadcastTxCommitResult> {
    return (await auth.txsPost(this.sdk, signedStdTx, 'sync')).data
  }

  async signAndBroadcast(unsignedStdTx: StdTx, privkey: PrivKey, signer: AccAddress): Promise<BroadcastTxCommitResult> {
    const signedTx = await this.sign(unsignedStdTx, privkey, signer)
    return await this.broadcast(signedTx)
  }
}
