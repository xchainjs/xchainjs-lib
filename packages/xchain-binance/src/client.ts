import axios from 'axios'
import { BncClient } from '@binance-chain/javascript-sdk/lib/client'
import { SignedSend } from '@binance-chain/javascript-sdk/lib/types'
import {
  Address,
  Balance,
  ClientFactory,
  ClientParams as BaseClientParams,
  Fees,
  MultiAssetClient,
  MultiSendClient,
  MultiSendWallet,
  Network,
  SingleAndMultiFees,
  SingleFlatFee,
  Tx,
  TxHistoryParams,
  TxsPage,
} from '@xchainjs/xchain-client'
import {
  Asset,
  AssetBNB,
  BNBChain,
  assetAmount,
  assetFromString,
  assetToBase,
  assetToString,
  baseAmount,
} from '@xchainjs/xchain-util'

import {
  Balance as BinanceBalance,
  Fee as BinanceFee,
  TxPage as BinanceTxPage,
  TransactionResult,
  TransferFee,
} from './types/binance'
import { isTransferFee, parseTx } from './util'

export interface ClientParams extends BaseClientParams {
  clientUrl: string
}

export const MAINNET_PARAMS: ClientParams = {
  network: Network.Mainnet,
  getFullDerivationPath: (index: number) => `44'/714'/0'/0/${index}`,
  explorer: {
    url: 'https://explorer.binance.org',
    getAddressUrl(address: string) {
      return `${this.url}/address/${address}`
    },
    getTxUrl(txid: string) {
      return `${this.url}/tx/${txid}`
    },
  },
  clientUrl: 'https://dex.binance.org',
}

export const TESTNET_PARAMS: ClientParams = {
  ...MAINNET_PARAMS,
  network: Network.Testnet,
  getFullDerivationPath: (index: number) => `44'/714'/0'/0/${index}`,
  explorer: {
    ...MAINNET_PARAMS.explorer,
    url: 'https://testnet-explorer.binance.org',
  },
  clientUrl: 'https://testnet-dex.binance.org',
}

export class Client
  extends MultiSendClient<ClientParams, MultiSendWallet>
  implements MultiAssetClient<ClientParams, MultiSendWallet> {
  readonly bncClient: BncClient

  protected constructor(params: ClientParams) {
    super(params)
    this.bncClient = new BncClient(params.clientUrl)
    this.bncClient.chooseNetwork(params.network)
  }

  protected async init() {
    await super.init()
    await this.bncClient.initChain()
  }

  static readonly create: ClientFactory<Client> = Client.bindFactory((x: ClientParams) => new Client(x))

  async validateAddress(address: Address): Promise<boolean> {
    return this.bncClient.checkAddress(address)
  }

  async getBalance(address: Address, assets?: Asset[]): Promise<Balance[]> {
    const balances = (await this.bncClient.getBalance(address)) as BinanceBalance[]

    return balances
      .map((balance) => ({
        asset: assetFromString(`${BNBChain}.${balance.symbol}`) || AssetBNB,
        amount: assetToBase(assetAmount(balance.free, 8)),
      }))
      .filter(
        (balance) => !assets || assets.filter((asset) => assetToString(balance.asset) === assetToString(asset)).length,
      )
  }

  private async searchTransactions(params: { [x: string]: string | undefined }): Promise<TxsPage> {
    const url = new URL(`${this.params.clientUrl}/api/v1/transactions`)

    const endTime = Date.now()
    const diffTime = 90 * 24 * 60 * 60 * 1000
    url.searchParams.set('endTime', endTime.toString())
    url.searchParams.set('startTime', (endTime - diffTime).toString())

    for (const [key, value] of Object.entries(params)) {
      if (!value) continue
      url.searchParams.set(key, value)
      if (key === 'startTime' && !params['endTime']) {
        url.searchParams.set('endTime', (parseInt(value) + diffTime).toString())
      }
      if (key === 'endTime' && !params['startTime']) {
        url.searchParams.set('startTime', (parseInt(value) - diffTime).toString())
      }
    }

    const txHistory = (await axios.get<BinanceTxPage>(url.toString())).data

    return {
      total: txHistory.total,
      txs: txHistory.tx.map(parseTx).filter(Boolean) as Tx[],
    }
  }

  async getTransactions(params: TxHistoryParams): Promise<TxsPage> {
    return await this.searchTransactions({
      address: params.address,
      limit: params.limit?.toString(),
      offset: params.offset?.toString(),
      startTime: params.startTime?.getTime?.()?.toString(),
      txAsset: params.asset,
    })
  }

  async getTransactionData(txId: string): Promise<Tx> {
    const txResult: TransactionResult = await axios
      .get(`${this.params.clientUrl}/api/v1/tx/${txId}?format=json`)
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

    const txHistory = await this.searchTransactions({ address, blockHeight })
    const [transaction] = txHistory.txs.filter((tx) => tx.hash === txId)

    if (!transaction) throw new Error('transaction not found')
    return transaction
  }

  private async getTransferFee(): Promise<TransferFee> {
    const feesArray = (await axios.get<BinanceFee[]>(`${this.params.clientUrl}/api/v1/fees`)).data

    for (const fee of feesArray) {
      if (isTransferFee(fee)) return fee
    }
    throw new Error('failed to get transfer fees')
  }

  async getFees(): Promise<Fees> {
    const transferFee = await this.getTransferFee()
    const singleTxFee = baseAmount(transferFee.fixed_fee_params.fee)
    return SingleFlatFee(singleTxFee)
  }

  async getMultiSendFees(): Promise<Fees> {
    const transferFee = await this.getTransferFee()
    const multiTxFee = baseAmount(transferFee.multi_transfer_fee)
    return SingleFlatFee(multiTxFee)
  }

  async getSingleAndMultiFees(): Promise<SingleAndMultiFees> {
    const transferFee = await this.getTransferFee()
    const singleTxFee = baseAmount(transferFee.fixed_fee_params.fee)
    const multiTxFee = baseAmount(transferFee.multi_transfer_fee)

    return {
      single: SingleFlatFee(singleTxFee),
      multi: SingleFlatFee(multiTxFee),
    }
  }
}
