import {
  Address,
  Balance,
  Client as BaseClient,
  ClientFactory,
  ClientParams as BaseClientParams,
  Fees,
  FeeOption,
  FeeRate,
  FeeRates,
  FeeType,
  FeesWithRates,
  Network,
  Tx,
  TxParams,
  TxHash,
  TxHistoryParams,
  TxsPage,
  TxType,
  UTXOClient,
  Wallet,
} from '@xchainjs/xchain-client'
import { AssetLTC, assetToBase, assetAmount } from '@xchainjs/xchain-util'

import * as sochain from './sochain-api'
import { NodeAuth } from './types'
import { TxIO } from './types/sochain-api-types'
import * as Utils from './utils'

export interface ClientParams extends BaseClientParams {
  sochainUrl: string
  nodeUrl: string
  nodeAuth: NodeAuth
}

export const MAINNET_PARAMS: ClientParams = {
  network: Network.Mainnet,
  getFullDerivationPath: (index: number) => `84'/2'/0'/0/${index}`,
  explorer: {
    url: 'https://ltc.bitaps.com',
    getAddressUrl(address: string) {
      return `${this.url}/${address}`
    },
    getTxUrl(txid: string) {
      return `${this.url}/${txid}`
    },
  },
  sochainUrl: 'https://sochain.com/api/v2',
  nodeUrl: 'https://ltc.thorchain.info',
  nodeAuth: {
    username: 'thorchain',
    password: 'password',
  },
}

export const TESTNET_PARAMS: ClientParams = {
  ...MAINNET_PARAMS,
  network: Network.Testnet,
  getFullDerivationPath: (index: number) => `84'/1'/0'/0/${index}`,
  explorer: {
    ...MAINNET_PARAMS.explorer,
    url: 'https://tltc.bitaps.com',
  },
  nodeUrl: 'https://testnet.ltc.thorchain.info',
}

export class Client extends BaseClient<ClientParams, Wallet> implements UTXOClient<ClientParams, Wallet> {
  static readonly create: ClientFactory<Client> = Client.bindFactory((x: ClientParams) => new Client(x))

  async validateAddress(address: string): Promise<boolean> {
    return Utils.validateAddress(address, this.params.network)
  }

  async getBalance(address: Address): Promise<Balance[]> {
    return Utils.getBalance({
      sochainUrl: this.params.sochainUrl,
      network: this.params.network,
      address,
    })
  }

  async getTransactions(params: TxHistoryParams): Promise<TxsPage> {
    const offset = params.offset ?? 0
    const limit = params.limit ?? 10

    const response = await sochain.getAddress({
      sochainUrl: this.params.sochainUrl,
      network: this.params.network,
      address: `${params.address}`,
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
        asset: AssetLTC,
        from: rawTx.inputs.map((i: TxIO) => ({
          from: i.address,
          amount: assetToBase(assetAmount(i.value, Utils.LTC_DECIMAL)),
        })),
        to: rawTx.outputs
          // ignore tx with type 'nulldata'
          .filter((i: TxIO) => i.type !== 'nulldata')
          .map((i: TxIO) => ({ to: i.address, amount: assetToBase(assetAmount(i.value, Utils.LTC_DECIMAL)) })),
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
      asset: AssetLTC,
      from: rawTx.inputs.map((i) => ({
        from: i.address,
        amount: assetToBase(assetAmount(i.value, Utils.LTC_DECIMAL)),
      })),
      to: rawTx.outputs.map((i) => ({ to: i.address, amount: assetToBase(assetAmount(i.value, Utils.LTC_DECIMAL)) })),
      date: new Date(rawTx.time * 1000),
      type: TxType.Transfer,
      hash: rawTx.txid,
    }
  }

  async getFeesWithRates(memo?: string): Promise<FeesWithRates> {
    const rates = await this.getFeeRates()

    const fees = (Object.entries(rates) as Array<[FeeOption, FeeRate]>)
      .map(([k, v]) => [k, Utils.calcFee(v, memo)] as const)
      .reduce((a, [k, v]) => ((a[k] = v), a), { type: FeeType.PerByte } as Fees)

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
    const nextBlockFeeRate = await sochain.getSuggestedTxFee()
    return {
      average: nextBlockFeeRate * 0.5,
      fast: nextBlockFeeRate * 1,
      fastest: nextBlockFeeRate * 5,
    }
  }

  transfer(index: number, params: TxParams & { feeRate?: FeeRate }): Promise<TxHash>
  transfer(params: TxParams & { walletIndex?: number; feeRate?: FeeRate }): Promise<TxHash>
  transfer(indexOrParams: number | (TxParams & { walletIndex?: number }), maybeParams?: TxParams): Promise<TxHash> {
    return super.transfer(...this.normalizeParams(indexOrParams, maybeParams))
  }
}
