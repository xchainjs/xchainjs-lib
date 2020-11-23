import axios from 'axios'
import {
  Address,
  Balances,
  Fees,
  Network,
  Tx,
  TxParams,
  TxHash,
  TxHistoryParams,
  TxsPage,
  XChainClient,
  XChainClientParams,
} from '@xchainjs/xchain-client'
import { Asset, assetAmount, assetToString, assetToBase, baseAmount } from '@xchainjs/xchain-util/lib'
import * as xchainCrypto from '@xchainjs/xchain-crypto'

import { ApiPromise, WsProvider, Keyring } from '@polkadot/api'
import { KeyringPair } from '@polkadot/keyring/types'

import { SubscanResponse, Account, AssetDOT, TransfersResult, Extrinsic, Transfer } from './types'
import { isSuccess } from './util'

const DECIMAL = 10

/**
 * Interface for custom Polkadot client
 */
export interface PolkadotClient {
  getSS58Format(): number
  getWsEndpoint(): string
  estimateFees(params: TxParams): Promise<Fees>

  purgeProvider(): void
}

class Client implements PolkadotClient, XChainClient {
  private network: Network
  private phrase = ''
  private address: Address = ''
  private api: ApiPromise | null = null

  constructor({ network = 'testnet', phrase }: XChainClientParams) {
    this.network = network

    if (phrase) this.setPhrase(phrase)
  }

  purgeProvider = (): void => {
    this.api?.disconnect()
  }

  purgeClient = (): void => {
    this.purgeProvider()

    this.api = null
    this.phrase = ''
    this.address = ''
  }

  setNetwork(network: Network): XChainClient {
    if (network !== this.network) {
      this.purgeProvider()

      this.api = null
      this.network = network
      this.address = ''
    }

    return this
  }

  getNetwork(): Network {
    return this.network
  }

  getClientUrl = (): string => {
    return this.network === 'testnet' ? 'https://westend.subscan.io' : 'https://polkadot.subscan.io'
  }

  getWsEndpoint = (): string => {
    return this.network === 'testnet' ? 'wss://westend-rpc.polkadot.io' : 'wss://rpc.polkadot.io'
  }

  getExplorerUrl = (): string => {
    return this.network === 'testnet' ? 'https://westend.subscan.io' : 'https://polkadot.subscan.io'
  }

  getExplorerAddressUrl = (address: Address): string => {
    return `${this.getExplorerUrl()}/account/${address}`
  }

  getExplorerTxUrl = (txID: string): string => {
    return `${this.getExplorerUrl()}/extrinsic/${txID}`
  }

  getSS58Format = (): number => {
    return this.network === 'testnet' ? 42 : 0
  }

  setPhrase = (phrase: string): Address => {
    if (this.phrase !== phrase) {
      if (!xchainCrypto.validatePhrase(phrase)) {
        throw new Error('Invalid BIP39 phrase')
      }

      this.phrase = phrase
      this.address = ''
    }

    return this.getAddress()
  }

  private getKeyringPair = (): KeyringPair => {
    const key = new Keyring({ ss58Format: this.getSS58Format(), type: 'ed25519' })

    return key.createFromUri(this.phrase)
  }

  private getAPI = async (): Promise<ApiPromise> => {
    try {
      if (!this.api) {
        this.api = new ApiPromise({ provider: new WsProvider(this.getWsEndpoint()) })
        await this.api.isReady
      }

      if (!this.api.isConnected) {
        await this.api.connect()
      }

      return this.api
    } catch (error) {
      return Promise.reject(error)
    }
  }

  getAddress = (): Address => {
    if (!this.address) {
      const address = this.getKeyringPair().address

      if (!address) {
        throw new Error('address not defined')
      }

      this.address = address
    }

    return this.address
  }

  getBalance = async (address?: Address, asset?: Asset): Promise<Balances> => {
    try {
      const response: SubscanResponse<Account> = await axios
        .post(`${this.getClientUrl()}/api/open/account`, { address: address || this.getAddress() })
        .then((res) => res.data)

      if (!isSuccess(response)) {
        throw new Error('Invalid address')
      }

      const account = response.data

      return account && (!asset || assetToString(asset) === assetToString(AssetDOT))
        ? [
            {
              asset: AssetDOT,
              amount: assetToBase(assetAmount(account.balance, DECIMAL)),
            },
          ]
        : []
    } catch (error) {
      return Promise.reject(error)
    }
  }

  getTransactions = async (params?: TxHistoryParams): Promise<TxsPage> => {
    const address = params?.address ?? this.getAddress()
    const limit = params?.limit ?? 10
    const offset = params?.offset ?? 0

    try {
      const response: SubscanResponse<TransfersResult> = await axios
        .post(`${this.getClientUrl()}/api/scan/transfers`, {
          address: address,
          row: limit,
          page: offset,
        })
        .then((res) => res.data)

      if (!isSuccess(response) || !response.data) {
        throw new Error('Failed to get transactions')
      }

      const transferResult: TransfersResult = response.data

      return {
        total: transferResult.count,
        txs: (transferResult.transfers || []).map((transfer) => ({
          asset: AssetDOT,
          from: [
            {
              from: transfer.from,
              amount: assetToBase(assetAmount(transfer.amount, DECIMAL)),
            },
          ],
          to: [
            {
              to: transfer.to,
              amount: assetToBase(assetAmount(transfer.amount, DECIMAL)),
            },
          ],
          date: new Date(transfer.block_timestamp * 1000),
          type: 'transfer',
          hash: transfer.hash,
        })),
      }
    } catch (error) {
      return Promise.reject(error)
    }
  }

  getTransactionData = async (txId: string): Promise<Tx> => {
    try {
      const response: SubscanResponse<Extrinsic> = await axios
        .post(`${this.getClientUrl()}/api/scan/extrinsic`, {
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
            amount: assetToBase(assetAmount(transfer.amount, DECIMAL)),
          },
        ],
        to: [
          {
            to: transfer.to,
            amount: assetToBase(assetAmount(transfer.amount, DECIMAL)),
          },
        ],
        date: new Date(extrinsic.block_timestamp * 1000),
        type: 'transfer',
        hash: extrinsic.extrinsic_hash,
      }
    } catch (error) {
      return Promise.reject(error)
    }
  }

  deposit = async (params: TxParams): Promise<TxHash> => {
    return this.transfer(params)
  }

  transfer = async (params: TxParams): Promise<TxHash> => {
    try {
      const api = await this.getAPI()
      const txHash = await api.tx.balances
        .transfer(params.recipient, params.amount.amount().toNumber())
        .signAndSend(this.getKeyringPair())

      return txHash.toString()
    } catch (error) {
      return Promise.reject(error)
    }
  }

  estimateFees = async (params: TxParams): Promise<Fees> => {
    try {
      const api = await this.getAPI()
      const info = await api.tx.balances
        .transfer(params.recipient, params.amount.amount().toNumber())
        .paymentInfo(this.getKeyringPair())

      const fee = baseAmount(info.partialFee.toString(), DECIMAL)

      return {
        type: 'byte',
        average: fee,
        fast: fee,
        fastest: fee,
      }
    } catch (error) {
      return Promise.reject(error)
    }
  }

  getFees = async (): Promise<Fees> => {
    return await this.estimateFees({
      recipient: this.getAddress(),
      amount: baseAmount(0, DECIMAL),
    })
  }
}

export { Client }
