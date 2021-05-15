import axios from 'axios'
import * as BIP32 from 'bip32'

import { TxHistoryParams } from '@xchainjs/xchain-client'
import * as xchainCrypto from '@xchainjs/xchain-crypto'

import { CosmosSDK, AccAddress, PrivKeySecp256k1, PrivKey, Msg } from 'cosmos-client'
import { BroadcastTxCommitResult, Coin, StdTxSignature } from 'cosmos-client/api'
import { auth, StdTx, BaseAccount } from 'cosmos-client/x/auth'
import { bank, MsgSend } from 'cosmos-client/x/bank'

import {
  APIQueryParam,
  BaseAccountResponse,
  SearchTxParams,
  TransferParams,
  TxHistoryResponse,
  CosmosSDKClientParams,
  TxResponse,
  RPCTxSearchResult,
  RPCResponse,
} from './types'
import { getQueryString } from '../util'

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

  updatePrefix = (prefix: string) => {
    this.prefix = prefix
    this.setPrefix()
  }

  setPrefix = (): void => {
    AccAddress.setBech32Prefix(
      this.prefix,
      this.prefix + 'pub',
      this.prefix + 'valoper',
      this.prefix + 'valoperpub',
      this.prefix + 'valcons',
      this.prefix + 'valconspub',
    )
  }

  getAddressFromPrivKey = (privkey: PrivKey): string => {
    this.setPrefix()

    return AccAddress.fromPublicKey(privkey.getPubKey()).toBech32()
  }

  getAddressFromMnemonic = (mnemonic: string, derivationPath: string): string => {
    this.setPrefix()
    const privKey = this.getPrivKeyFromMnemonic(mnemonic, derivationPath)

    return AccAddress.fromPublicKey(privKey.getPubKey()).toBech32()
  }

  getPrivKeyFromMnemonic = (mnemonic: string, derivationPath: string): PrivKey => {
    const seed = xchainCrypto.getSeed(mnemonic)
    const node = BIP32.fromSeed(seed)
    const child = node.derivePath(derivationPath)

    if (!child.privateKey) {
      throw new Error('child does not have a privateKey')
    }

    return new PrivKeySecp256k1(child.privateKey)
  }

  checkAddress = (address: string): boolean => {
    try {
      this.setPrefix()

      if (!address.startsWith(this.prefix)) {
        return false
      }

      return AccAddress.fromBech32(address).toBech32() === address
    } catch (err) {
      return false
    }
  }

  getBalance = async (address: string): Promise<Coin[]> => {
    try {
      this.setPrefix()

      const accAddress = AccAddress.fromBech32(address)

      return bank.balancesAddressGet(this.sdk, accAddress).then((res) => res.data.result)
    } catch (error) {
      return Promise.reject(error)
    }
  }

  searchTx = async ({
    messageAction,
    messageSender,
    page,
    limit,
    txMinHeight,
    txMaxHeight,
  }: SearchTxParams): Promise<TxHistoryResponse> => {
    try {
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

      return await axios
        .get<TxHistoryParams>(`${this.server}/txs?${getQueryString(queryParameter)}`)
        .then((res) => res.data)
    } catch (error) {
      return Promise.reject(error)
    }
  }

  searchTxFromRPC = async ({
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
  }): Promise<RPCTxSearchResult> => {
    try {
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

      const response: RPCResponse<RPCTxSearchResult> = await axios
        .get(`${rpcEndpoint}/tx_search?${searchParameter.join('&')}`)
        .then((res) => res.data)

      return response.result
    } catch (error) {
      return Promise.reject(error)
    }
  }

  txsHashGet = async (hash: string): Promise<TxResponse> => {
    try {
      this.setPrefix()

      return await axios.get<TxResponse>(`${this.server}/txs/${hash}`).then((res) => res.data)
    } catch (error) {
      throw new Error('transaction not found')
    }
  }

  transfer = async ({
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
  }: TransferParams): Promise<BroadcastTxCommitResult> => {
    try {
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
    } catch (error) {
      return Promise.reject(error)
    }
  }

  signAndBroadcast = async (
    unsignedStdTx: StdTx,
    privkey: PrivKey,
    signer: AccAddress,
  ): Promise<BroadcastTxCommitResult> => {
    try {
      this.setPrefix()

      let account: BaseAccount = await auth.accountsAddressGet(this.sdk, signer).then((res) => res.data.result)
      if (account.account_number === undefined) {
        account = BaseAccount.fromJSON((account as BaseAccountResponse).value)
      }

      const signedStdTx = auth.signStdTx(
        this.sdk,
        privkey,
        unsignedStdTx,
        account.account_number.toString(),
        account.sequence.toString(),
      )

      return await auth.txsPost(this.sdk, signedStdTx, 'block').then((res) => res.data)
    } catch (error) {
      return Promise.reject(error)
    }
  }
}
