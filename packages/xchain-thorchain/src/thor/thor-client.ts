import axios from 'axios'
import * as BIP39 from 'bip39'
import * as BIP32 from 'bip32'

import { CosmosSDK, AccAddress, PrivKeySecp256k1, PrivKey, Msg } from 'cosmos-client'
import { BroadcastTxCommitResult, Coin, StdTxFee, StdTxSignature } from 'cosmos-client/api'
import { auth, StdTx, BaseAccount } from 'cosmos-client/x/auth'
import { bank, MsgSend, MsgMultiSend } from 'cosmos-client/x/bank'
import { codec } from 'cosmos-client/codec'

import { SearchTxParams, TransferParams, BaseAccountResponse, TxHistoryResponse, APIQueryParam } from './types'

export class ThorClient {
  sdk: CosmosSDK

  server: string
  chainId: string
  prefix = ''

  private derive_path = "44'/931'/0'/0/0"

  constructor(server: string, chainId: string, prefix: string) {
    this.server = server
    this.chainId = chainId
    this.sdk = new CosmosSDK(this.server, this.chainId)

    this.setPrifix(prefix)
    codec.registerCodec('thorchain/MsgSend', MsgSend, MsgSend.fromJSON)
    codec.registerCodec('thorchain/MsgMultiSend', MsgMultiSend, MsgMultiSend.fromJSON)
  }

  static getQueryString = (v: APIQueryParam): string => {
    const keys = Object.keys(v).filter((key) => key.length > 0)
    return keys.map((key) => (v[key] == null ? key : `${key}=${encodeURIComponent(v[key].toString())}`)).join('&')
  }

  setPrifix = (prefix: string): void => {
    this.prefix = prefix
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
    return AccAddress.fromPublicKey(privkey.getPubKey()).toBech32()
  }

  getPrivKeyFromMnemonic = (mnemonic: string): PrivKey => {
    const seed = BIP39.mnemonicToSeedSync(mnemonic)
    const node = BIP32.fromSeed(seed)
    const child = node.derivePath(this.derive_path)

    if (!child.privateKey) {
      throw new Error('child does not have a privateKey')
    }

    return new PrivKeySecp256k1(child.privateKey)
  }

  checkAddress = (address: string): boolean => {
    try {
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

      return await axios
        .get<TxHistoryResponse>(`${this.server}/txs?${ThorClient.getQueryString(queryParameter)}`)
        .then((response) => response.data)
    } catch (error) {
      return Promise.reject(error)
    }
  }

  transfer = async ({ privkey, from, to, amount, asset, memo }: TransferParams): Promise<BroadcastTxCommitResult> => {
    try {
      const fromAddress = AccAddress.fromBech32(from)
      const toAddress = AccAddress.fromBech32(to)

      let account: BaseAccount = await auth.accountsAddressGet(this.sdk, fromAddress).then((res) => res.data.result)
      if (account.account_number === undefined) {
        account = BaseAccount.fromJSON((account as BaseAccountResponse).value)
      }

      const msg: Msg = [
        MsgSend.fromJSON({
          from_address: fromAddress.toBech32(),
          to_address: toAddress.toBech32(),
          amount: [
            {
              denom: asset,
              amount: amount.toString(),
            },
          ],
        }),
      ]
      const fee: StdTxFee = {
        gas: '200000',
        amount: [],
      }
      const signatures: StdTxSignature[] = []

      const unsignedStdTx = StdTx.fromJSON({
        msg,
        fee,
        signatures,
        memo,
      })

      const signedStdTx = auth.signStdTx(
        this.sdk,
        privkey,
        unsignedStdTx,
        account.account_number.toString(),
        account.sequence.toString(),
      )

      const result = await auth.txsPost(this.sdk, signedStdTx, 'block').then((res) => res.data)

      return result
    } catch (error) {
      return Promise.reject(error)
    }
  }
}
