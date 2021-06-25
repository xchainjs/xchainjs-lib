import axios from 'axios'
import { ApiPromise, WsProvider, Keyring } from '@polkadot/api'
import { hexToU8a, isHex } from '@polkadot/util'
import {
  Address,
  Balance,
  Client as BaseClient,
  ClientParams as BaseClientParams,
  Fees,
  Network,
  SingleFeePerByte,
  Tx,
  TxHistoryParams,
  TxParams,
  TxType,
  TxsPage,
  Wallet,
} from '@xchainjs/xchain-client'
import { Asset, assetAmount, assetToString, assetToBase, baseAmount } from '@xchainjs/xchain-util'

import { SubscanResponse, Account, AssetDOT, TransfersResult, Extrinsic, Transfer } from './types'
import { isSuccess, getDecimal } from './util'

export interface ClientParams extends BaseClientParams {
  clientUrl: string
  wsEndpoint: string
  ss58Format: number
}

export const MAINNET_PARAMS: ClientParams = {
  network: Network.Mainnet,
  getFullDerivationPath: (index: number) => `44//354//0//0//0'${index === 0 ? '' : `//${index}`}`, //TODO IS the root path we want to use?
  explorer: {
    url: 'https://polkadot.subscan.io',
    getAddressUrl(address: string) {
      return `${this.url}/account/${address}`
    },
    getTxUrl(txid: string) {
      return `${this.url}/extrinsic/${txid}`
    },
  },
  clientUrl: 'https://polkadot.subscan.io',
  wsEndpoint: 'wss://rpc.polkadot.io',
  ss58Format: 0,
}

export const TESTNET_PARAMS: ClientParams = {
  ...MAINNET_PARAMS,
  network: Network.Testnet,
  explorer: {
    ...MAINNET_PARAMS.explorer,
    url: 'https://westend.subscan.io',
  },
  clientUrl: 'https://westend.subscan.io',
  wsEndpoint: 'wss://westend-rpc.polkadot.io',
  ss58Format: 42,
}

export class Client extends BaseClient<ClientParams, Wallet> {
  static readonly create = Client.bindFactory((x: ClientParams) => new Client(x))

  getClientUrl(): string {
    return this.params.clientUrl
  }
  getWsEndpoint(): string {
    return this.params.wsEndpoint
  }
  getSS58Format(): number {
    return this.params.ss58Format
  }

  /**
   * @private
   * Private function to get the polkadotjs API provider.
   *
   * @see https://polkadot.js.org/docs/api/start/create#api-instance
   *
   * @returns {ApiPromise} The polkadotjs API provider based on the network.
   * */
  async getAPI(): Promise<ApiPromise> {
    const api = new ApiPromise({ provider: new WsProvider(this.getWsEndpoint()) })
    await api.isReady
    if (!api.isConnected) await api.connect()
    return api
  }

  async validateAddress(address: string): Promise<boolean> {
    try {
      const key = new Keyring({ ss58Format: this.params.ss58Format, type: 'ed25519' })
      return key.encodeAddress(isHex(address) ? hexToU8a(address) : key.decodeAddress(address)) === address
    } catch (error) {
      return false
    }
  }

  async getBalance(address: Address, assets?: Asset[]): Promise<Balance[]> {
    const response: SubscanResponse<Account> = await axios
      .post(`${this.params.clientUrl}/api/open/account`, { address: address || this.getAddress() })
      .then((res) => res.data)

    if (!isSuccess(response)) {
      throw new Error('Invalid address')
    }

    const account = response.data

    return account && (!assets || assets.filter((asset) => assetToString(AssetDOT) === assetToString(asset)).length)
      ? [
          {
            asset: AssetDOT,
            amount: assetToBase(assetAmount(account.balance, getDecimal(this.params.network))),
          },
        ]
      : []
  }

  async getTransactions(params: TxHistoryParams): Promise<TxsPage> {
    const limit = params.limit ?? 10
    const offset = params.offset ?? 0

    const response: SubscanResponse<TransfersResult> = await axios
      .post(`${this.params.clientUrl}/api/scan/transfers`, {
        address: params?.address,
        row: limit,
        page: offset,
      })
      .then((res) => res.data)

    if (!isSuccess(response) || !response.data) throw new Error('Failed to get transactions')

    const transferResult: TransfersResult = response.data

    return {
      total: transferResult.count,
      txs: (transferResult.transfers || []).map((transfer) => ({
        asset: AssetDOT,
        from: [
          {
            from: transfer.from,
            amount: assetToBase(assetAmount(transfer.amount, getDecimal(this.params.network))),
          },
        ],
        to: [
          {
            to: transfer.to,
            amount: assetToBase(assetAmount(transfer.amount, getDecimal(this.params.network))),
          },
        ],
        date: new Date(transfer.block_timestamp * 1000),
        type: TxType.Transfer,
        hash: transfer.hash,
      })),
    }
  }

  async getTransactionData(txId: string): Promise<Tx> {
    const response: SubscanResponse<Extrinsic> = await axios
      .post(`${this.params.clientUrl}/api/scan/extrinsic`, {
        hash: txId,
      })
      .then((res) => res.data)

    if (!isSuccess(response) || !response.data) {
      throw new Error('Failed to get transactions')
    }

    const extrinsic: Extrinsic = response.data
    const transfer: Transfer = extrinsic.transfer

    return {
      asset: AssetDOT,
      from: [
        {
          from: transfer.from,
          amount: assetToBase(assetAmount(transfer.amount, getDecimal(this.params.network))),
        },
      ],
      to: [
        {
          to: transfer.to,
          amount: assetToBase(assetAmount(transfer.amount, getDecimal(this.params.network))),
        },
      ],
      date: new Date(extrinsic.block_timestamp * 1000),
      type: TxType.Transfer,
      hash: extrinsic.extrinsic_hash,
    }
  }

  estimateFees(index: number, params: TxParams): Promise<Fees>
  estimateFees(params: TxParams & { walletIndex?: number }): Promise<Fees>
  async estimateFees(
    indexOrParams: number | (TxParams & { walletIndex?: number }),
    maybeParams?: TxParams,
  ): Promise<Fees> {
    const [index, params] = this.normalizeParams(indexOrParams, maybeParams)
    const api = await this.getAPI()
    const info = await api.tx.balances
      .transfer(params.recipient, params.amount.amount().toNumber())
      .paymentInfo(await this.getAddress(index))

    const fee = baseAmount(info.partialFee.toString(), getDecimal(this.params.network))
    await api.disconnect()

    return SingleFeePerByte(fee)
  }

  async getFees(index?: number): Promise<Fees> {
    index = index ?? 0
    return await this.estimateFees(index, {
      recipient: await this.getAddress(index),
      amount: baseAmount(0, getDecimal(this.params.network)),
    })
  }
}
