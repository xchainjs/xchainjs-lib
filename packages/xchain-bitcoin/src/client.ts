import * as Utils from './utils'
import * as sochain from './sochain-api'
import {
  TxHistoryParams,
  TxsPage,
  Address,
  Tx,
  Balance,
  Fees,
  UTXOClient,
  TxType,
  FeeType,
  Network,
  ClientParams as BaseClientParams,
  Client as BaseClient,
  ClientFactory,
  Wallet as BaseWallet,
  TxParams,
  TxHash,
  FeeRate,
} from '@xchainjs/xchain-client'
import { AssetBTC, assetAmount, assetToBase } from '@xchainjs/xchain-util'

import { BTC_DECIMAL } from './const'
import { FeesWithRates, FeeRates } from './types/client-types'

export interface ClientParams extends BaseClientParams {
  sochainUrl: string
  blockstreamUrl: string
}

export const MAINNET_PARAMS: ClientParams = {
  network: Network.Mainnet,
  getFullDerivationPath: (index: number) => `84'/0'/0'/0/${index}`,
  explorer: {
    url: 'https://blockstream.info',
    getAddressUrl(address: string) {
      return `${this.url}/address/${address}`
    },
    getTxUrl(txid: string) {
      return `${this.url}/tx/${txid}`
    },
  },
  sochainUrl: 'https://sochain.com/api/v2',
  blockstreamUrl: 'https://blockstream.info',
}

export const TESTNET_PARAMS: ClientParams = {
  ...MAINNET_PARAMS,
  network: Network.Testnet,
  getFullDerivationPath: (index: number) => `84'/1'/0'/0/${index}`,
  explorer: {
    ...MAINNET_PARAMS.explorer,
    url: 'https://blockstream.info/testnet',
  },
}

export class Client extends BaseClient<ClientParams, BaseWallet> implements UTXOClient<ClientParams, BaseWallet> {
  static readonly create: ClientFactory<Client> = Client.bindFactory((x: ClientParams) => new Client(x))

  async validateAddress(address: string): Promise<boolean> {
    return Utils.validateAddress(address, Utils.btcNetwork(this.params.network))
  }

  async getBalance(address: Address): Promise<Balance[]> {
    return Utils.getBalance({
      sochainUrl: this.params.sochainUrl,
      network: this.params.network,
      address: address,
    })
  }

  async getTransactions(params: TxHistoryParams): Promise<TxsPage> {
    // Sochain API doesn't have pagination parameter
    const offset = params?.offset ?? 0
    const limit = params?.limit || 10

    const response = await sochain.getAddress({
      address: params?.address + '',
      sochainUrl: this.params.sochainUrl,
      network: this.params.network,
    })
    const total = response.txs.length
    const transactions: Tx[] = []

    const txs = response.txs.filter((_, index) => offset <= index && index < offset + limit)
    for (const txItem of txs) {
      const rawTx = await sochain.getTx({
        sochainUrl: this.params.sochainUrl,
        network: this.params.network,
        hash: txItem.txid,
      })
      const tx: Tx = {
        asset: AssetBTC,
        from: rawTx.inputs.map((i) => ({
          from: i.address,
          amount: assetToBase(assetAmount(i.value, BTC_DECIMAL)),
        })),
        to: rawTx.outputs
          .filter((i) => i.type !== 'nulldata')
          .map((i) => ({ to: i.address, amount: assetToBase(assetAmount(i.value, BTC_DECIMAL)) })),
        date: new Date(rawTx.time * 1000),
        type: TxType.Transfer,
        hash: rawTx.txid,
      }
      transactions.push(tx)
    }

    const result: TxsPage = {
      total,
      txs: transactions,
    }
    return result
  }

  async getTransactionData(txId: string): Promise<Tx> {
    const rawTx = await sochain.getTx({
      sochainUrl: this.params.sochainUrl,
      network: this.params.network,
      hash: txId,
    })
    return {
      asset: AssetBTC,
      from: rawTx.inputs.map((i) => ({
        from: i.address,
        amount: assetToBase(assetAmount(i.value, BTC_DECIMAL)),
      })),
      to: rawTx.outputs.map((i) => ({ to: i.address, amount: assetToBase(assetAmount(i.value, BTC_DECIMAL)) })),
      date: new Date(rawTx.time * 1000),
      type: TxType.Transfer,
      hash: rawTx.txid,
    }
  }

  async getFeesWithRates(memo?: string): Promise<FeesWithRates> {
    const txFee = await sochain.getSuggestedTxFee()
    const rates: FeeRates = {
      fastest: txFee * 5,
      fast: txFee * 1,
      average: txFee * 0.5,
    }

    const fees: Fees = {
      type: FeeType.PerByte,
      fast: Utils.calcFee(rates.fast, memo),
      average: Utils.calcFee(rates.average, memo),
      fastest: Utils.calcFee(rates.fastest, memo),
    }

    return { fees, rates }
  }

  async getFees(): Promise<Fees> {
    const { fees } = await this.getFeesWithRates()
    return fees
  }

  async getFeesWithMemo(memo: string): Promise<Fees> {
    const { fees } = await this.getFeesWithRates(memo)
    return fees
  }

  async getFeeRates(): Promise<FeeRates> {
    const { rates } = await this.getFeesWithRates()
    return rates
  }

  transfer(index: number, params: TxParams & { feeRate?: FeeRate }): Promise<TxHash>
  transfer(params: TxParams & { walletIndex?: number; feeRate?: FeeRate }): Promise<TxHash>
  transfer(indexOrParams: number | (TxParams & { walletIndex?: number }), maybeParams?: TxParams): Promise<TxHash> {
    return super.transfer(...this.normalizeParams(indexOrParams, maybeParams))
  }
}
