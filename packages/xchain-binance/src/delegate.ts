import axios from 'axios'
import {
  Balance as BinanceBalance,
  Fee as BinanceFee,
  TxPage as BinanceTxPage,
  TransactionResult,
  TransferFee,
} from './types/binance'

import * as crypto from '@binance-chain/javascript-sdk/lib/crypto'
import { BncClient } from '@binance-chain/javascript-sdk/lib/client'
import { Address, Balance, Fees, Tx, TxParams, TxHash, TxHistoryParams, TxsPage } from '@xchainjs/xchain-client'
import {
  Asset,
  AssetBNB,
  assetFromString,
  assetAmount,
  assetToBase,
  baseAmount,
  baseToAsset,
  BNBChain,
  assetToString,
} from '@xchainjs/xchain-util'
import * as xchainCrypto from '@xchainjs/xchain-crypto'
import { isTransferFee, parseTx } from './util'
import { SignedSend } from '@binance-chain/javascript-sdk/lib/types'

import { Delegate as BaseDelegate } from '@xchainjs/xchain-client'

import { FeeType, SingleFlatFee } from '@xchainjs/xchain-client'

import { ClientParams, SingleAndMultiFees, MultiSendParams } from './client'

export class Delegate implements BaseDelegate<ClientParams> {
  private readonly phrase: string
  private readonly privateKeys = new Map<number, string>()
  private readonly bncClients = new Map<string, BncClient>()

  constructor(phrase: string) {
    this.phrase = phrase
  }

  static async create(phrase: string): Promise<Delegate> {
    if (!xchainCrypto.validatePhrase(phrase)) throw new Error('Invalid phrase')
    const out = new Delegate(phrase)
    return out
  }

  async purge(): Promise<void> {
    this.privateKeys.clear()
    this.bncClients.clear()
  }

  async getBncClient(clientParams: Readonly<ClientParams>, walletIndex?: number): Promise<BncClient> {
    const clientCompositeKey = JSON.stringify([clientParams.clientUrl, clientParams.clientNetwork, walletIndex])
    const cachedClient = this.bncClients.get(clientCompositeKey)
    if (cachedClient !== undefined) return cachedClient

    const out = new BncClient(clientParams.clientUrl)
    out.chooseNetwork(clientParams.clientNetwork)
    if (walletIndex !== undefined) {
      const privateKey = await this.getPrivateKey(clientParams, walletIndex)
      await out.setPrivateKey(privateKey)
      await out.initChain()
    }
    this.bncClients.set(clientCompositeKey, out)
    return out
  }

  private async getPrivateKey(_clientParams: Readonly<ClientParams>, index: number): Promise<string> {
    const cachedPrivateKey = this.privateKeys.get(index)
    if (cachedPrivateKey !== undefined) return cachedPrivateKey

    const out = crypto.getPrivateKeyFromMnemonic(this.phrase, true, index)
    this.privateKeys.set(index, out)
    return out
  }

  async getAddress(clientParams: Readonly<ClientParams>, index = 0): Promise<Address> {
    const bncClient = await this.getBncClient(clientParams)
    const privateKey = await this.getPrivateKey(clientParams, index)
    return crypto.getAddressFromPrivateKey(privateKey, bncClient.addressPrefix)
  }

  async validateAddress(clientParams: Readonly<ClientParams>, address: Address): Promise<boolean> {
    const bncClient = await this.getBncClient(clientParams)
    return bncClient.checkAddress(address)
  }

  async getBalance(clientParams: Readonly<ClientParams>, address: Address, assets?: Asset[]): Promise<Balance[]> {
    const bncClient = await this.getBncClient(clientParams)
    const balances = (await bncClient.getBalance(address)) as BinanceBalance[]

    return balances
      .map((balance) => ({
        asset: assetFromString(`${BNBChain}.${balance.symbol}`) || AssetBNB,
        amount: assetToBase(assetAmount(balance.free, 8)),
      }))
      .filter(
        (balance) => !assets || assets.filter((asset) => assetToString(balance.asset) === assetToString(asset)).length,
      )
  }

  private async searchTransactions(
    clientParams: Readonly<ClientParams>,
    params?: { [x: string]: string | undefined },
  ): Promise<TxsPage> {
    const url = new URL(`${clientParams.clientUrl}/api/v1/transactions`)

    const endTime = Date.now()
    const diffTime = 90 * 24 * 60 * 60 * 1000
    url.searchParams.set('endTime', endTime.toString())
    url.searchParams.set('startTime', (endTime - diffTime).toString())

    for (const key in params) {
      const value = params[key]
      if (value) {
        url.searchParams.set(key, value)
        if (key === 'startTime' && !params['endTime']) {
          url.searchParams.set('endTime', (parseInt(value) + diffTime).toString())
        }
        if (key === 'endTime' && !params['startTime']) {
          url.searchParams.set('startTime', (parseInt(value) - diffTime).toString())
        }
      }
    }

    const txHistory = (await axios.get<BinanceTxPage>(url.toString())).data

    return {
      total: txHistory.total,
      txs: txHistory.tx.map(parseTx).filter(Boolean) as Tx[],
    }
  }

  async getTransactions(clientParams: Readonly<ClientParams>, params: TxHistoryParams): Promise<TxsPage> {
    return await this.searchTransactions(clientParams, {
      address: params.address,
      limit: params.limit?.toString(),
      offset: params.offset?.toString(),
      startTime: params.startTime?.getTime?.()?.toString(),
      txAsset: params.asset,
    })
  }

  async getTransactionData(clientParams: Readonly<ClientParams>, txId: string): Promise<Tx> {
    const txResult: TransactionResult = await axios
      .get(`${clientParams.clientUrl}/api/v1/tx/${txId}?format=json`)
      .then((response) => response.data)

    const blockHeight = txResult.height

    let address = ''
    const msgs = txResult.tx.value.msg
    if (msgs.length) {
      const msg = msgs[0].value as SignedSend
      if (msg.inputs && msg.inputs.length) {
        address = msg.inputs[0].address
      } else if (msg.outputs && msg.outputs.length) {
        address = msg.outputs[0].address
      }
    }

    const txHistory = await this.searchTransactions(clientParams, { address, blockHeight })
    const [transaction] = txHistory.txs.filter((tx) => tx.hash === txId)

    if (!transaction) throw new Error('transaction not found')
    return transaction
  }

  async multiSend(
    clientParams: Readonly<ClientParams>,
    { walletIndex = 0, transactions, memo = '' }: MultiSendParams,
  ): Promise<TxHash> {
    const bncClient = await this.getBncClient(clientParams, walletIndex)
    const derivedAddress = bncClient.getClientKeyAddress()

    const transferResult = await bncClient.multiSend(
      derivedAddress,
      transactions.map((transaction) => {
        return {
          to: transaction.to,
          coins: transaction.coins.map((coin) => {
            return {
              denom: coin.asset.symbol,
              amount: baseToAsset(coin.amount).amount().toString(),
            }
          }),
        }
      }),
      memo,
    )

    return transferResult.result.map((txResult: { hash?: TxHash }) => txResult?.hash ?? '')[0]
  }

  async transfer(
    clientParams: Readonly<ClientParams>,
    { walletIndex, asset, amount, recipient, memo }: TxParams,
  ): Promise<TxHash> {
    const bncClient = await this.getBncClient(clientParams, walletIndex)

    const transferResult = await bncClient.transfer(
      await this.getAddress(clientParams),
      recipient,
      baseToAsset(amount).amount().toString(),
      asset ? asset.symbol : AssetBNB.symbol,
      memo,
    )

    return transferResult.result.map((txResult: { hash?: TxHash }) => txResult?.hash ?? '')[0]
  }

  private async getTransferFee(clientParams: Readonly<ClientParams>): Promise<TransferFee> {
    const feesArray = (await axios.get<BinanceFee[]>(`${clientParams.clientUrl}/api/v1/fees`)).data

    for (const fee of feesArray) {
      if (isTransferFee(fee)) return fee
    }
    throw new Error('failed to get transfer fees')
  }

  async getFees(clientParams: Readonly<ClientParams>): Promise<Fees> {
    const transferFee = await this.getTransferFee(clientParams)
    const singleTxFee = baseAmount(transferFee.fixed_fee_params.fee)

    return {
      type: FeeType.FlatFee,
      fast: singleTxFee,
      fastest: singleTxFee,
      average: singleTxFee,
    }
  }

  async getMultiSendFees(clientParams: Readonly<ClientParams>): Promise<Fees> {
    const transferFee = await this.getTransferFee(clientParams)
    const multiTxFee = baseAmount(transferFee.multi_transfer_fee)

    return {
      type: FeeType.FlatFee,
      average: multiTxFee,
      fast: multiTxFee,
      fastest: multiTxFee,
    }
  }

  async getSingleAndMultiFees(clientParams: Readonly<ClientParams>): Promise<SingleAndMultiFees> {
    const transferFee = await this.getTransferFee(clientParams)
    const singleTxFee = baseAmount(transferFee.fixed_fee_params.fee)
    const multiTxFee = baseAmount(transferFee.multi_transfer_fee)

    return {
      single: SingleFlatFee(singleTxFee),
      multi: SingleFlatFee(multiTxFee),
    }
  }
}
