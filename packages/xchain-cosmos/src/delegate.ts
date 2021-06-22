import {
  Address,
  Balance,
  Delegate as BaseDelegate,
  FeeType,
  Fees,
  Tx,
  TxHash,
  TxHistoryParams,
  TxParams,
  TxsPage,
} from '@xchainjs/xchain-client'
import { Asset, assetToString, baseAmount } from '@xchainjs/xchain-util'
import * as xchainCrypto from '@xchainjs/xchain-crypto'
import { codec } from 'cosmos-client'
import { MsgMultiSend, MsgSend } from 'cosmos-client/x/bank'

import { ClientParams } from './client'
import { DECIMAL, getAsset, getDenom, getTxsFromHistory } from './util'
import { CosmosSDKClient } from './cosmos'

const registerCodecsOnce = (() => {
  let codecsRegistered = false
  return async () => {
    if (codecsRegistered) return
    codec.registerCodec('cosmos-sdk/MsgSend', MsgSend, MsgSend.fromJSON)
    codec.registerCodec('cosmos-sdk/MsgMultiSend', MsgMultiSend, MsgMultiSend.fromJSON)
    codecsRegistered = true
  }
})()

export class Delegate implements BaseDelegate<ClientParams> {
  private readonly phrase: string
  private readonly sdkClients = new Map<string, CosmosSDKClient>()

  constructor(phrase: string) {
    this.phrase = phrase
  }

  static async create(phrase: string): Promise<Delegate> {
    if (!xchainCrypto.validatePhrase(phrase)) throw new Error('Invalid phrase')
    const out = new Delegate(phrase)
    await registerCodecsOnce()
    return out
  }

  async getSDKClient(clientParams: Readonly<ClientParams>): Promise<CosmosSDKClient> {
    const clientCompositeKey = JSON.stringify([clientParams.sdkServer, clientParams.sdkChainId])
    const cachedClient = this.sdkClients.get(clientCompositeKey)
    if (cachedClient !== undefined) return cachedClient

    const out = new CosmosSDKClient({
      server: clientParams.sdkServer,
      chainId: clientParams.sdkServer,
    })
    this.sdkClients.set(clientCompositeKey, out)
    return out
  }

  async validateAddress(clientParams: Readonly<ClientParams>, address: Address): Promise<boolean> {
    const sdkClient = await this.getSDKClient(clientParams)
    return sdkClient.checkAddress(address)
  }

  async getAddress(clientParams: Readonly<ClientParams>, walletIndex = 0): Promise<Address> {
    const sdkClient = await this.getSDKClient(clientParams)
    return sdkClient.getAddressFromMnemonic(this.phrase, clientParams.getFullDerivationPath(walletIndex))
  }

  async getBalance(clientParams: Readonly<ClientParams>, address: Address, assets?: Asset[]): Promise<Balance[]> {
    const sdkClient = await this.getSDKClient(clientParams)
    const balances = await sdkClient.getBalance(address)

    return balances
      .map((balance) => {
        return {
          asset: (balance.denom && getAsset(balance.denom)) || clientParams.mainAsset,
          amount: baseAmount(balance.amount, DECIMAL),
        }
      })
      .filter(
        (balance) => !assets || assets.filter((asset) => assetToString(balance.asset) === assetToString(asset)).length,
      )
  }

  async getTransactions(clientParams: Readonly<ClientParams>, params: TxHistoryParams): Promise<TxsPage> {
    const messageAction = undefined
    const page = (params && params.offset) || undefined
    const limit = (params && params.limit) || undefined
    const txMinHeight = undefined
    const txMaxHeight = undefined

    const txHistory = await (await this.getSDKClient(clientParams)).searchTx({
      messageAction,
      messageSender: (params && params.address) || (await this.getAddress(clientParams)),
      page,
      limit,
      txMinHeight,
      txMaxHeight,
    })

    return {
      total: parseInt(txHistory.total_count?.toString() || '0'),
      txs: getTxsFromHistory(txHistory.txs || [], clientParams.mainAsset),
    }
  }

  async getTransactionData(clientParams: Readonly<ClientParams>, txId: string): Promise<Tx> {
    const sdkClient = await this.getSDKClient(clientParams)
    const txResult = await sdkClient.txsHashGet(txId)
    const txs = getTxsFromHistory([txResult], clientParams.mainAsset)

    if (txs.length === 0) throw new Error('transaction not found')

    return txs[0]
  }

  async getFees(_clientParams: Readonly<ClientParams>): Promise<Fees> {
    return {
      type: FeeType.FlatFee,
      fast: baseAmount(750, DECIMAL),
      fastest: baseAmount(2500, DECIMAL),
      average: baseAmount(0, DECIMAL),
    }
  }

  async transfer(clientParams: Readonly<ClientParams>, params: TxParams): Promise<TxHash> {
    const sdkClient = await this.getSDKClient(clientParams)
    const privateKey = sdkClient.getPrivKeyFromMnemonic(
      this.phrase,
      clientParams.getFullDerivationPath(params.walletIndex ?? 0),
    )

    const txResult = await sdkClient.transfer({
      privkey: privateKey,
      from: sdkClient.getAddressFromPrivKey(privateKey),
      to: params.recipient,
      amount: params.amount.amount().toString(),
      asset: getDenom(params.asset ?? clientParams.mainAsset),
      memo: params.memo,
    })
    const out = txResult?.txhash

    if (out === undefined) throw new Error(`unable to complete transaction, result: ${txResult}`)
    return out
  }
}
