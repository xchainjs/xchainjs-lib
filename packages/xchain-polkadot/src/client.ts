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
import { Asset, assetAmount, assetToBase } from '@xchainjs/xchain-util/lib'
import * as xchainCrypto from '@xchainjs/xchain-crypto'

import Keyring from '@polkadot/keyring'
import { KeyringPair } from '@polkadot/keyring/types'

import { SubscanResponse, Account, AssetDOT, TransfersResult } from './types'
import { isSuccess } from './util'

/**
 * Interface for custom Polkadot client
 */
export interface PolkadotClient {
  getSS58Format(): number
}

class Client implements PolkadotClient, XChainClient {
  private network: Network
  private phrase = ''
  private address: Address = ''

  constructor({ network = 'testnet', phrase }: XChainClientParams) {
    this.network = network

    if (phrase) this.setPhrase(phrase)
  }

  purgeClient(): void {
    this.phrase = ''
    this.address = ''
  }

  setNetwork(network: Network): XChainClient {
    this.network = network
    this.address = ''

    return this
  }

  getNetwork(): Network {
    return this.network
  }

  getClientUrl = (): string => {
    return this.network === 'testnet' ? 'https://westend.subscan.io' : 'https://polkadot.subscan.io'
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

  getBalance = async (address?: Address, _asset?: Asset): Promise<Balances> => {
    try {
      const response: SubscanResponse<Account> = await axios
        .post(`${this.getClientUrl()}/api/open/account`, { address: address || this.getAddress() })
        .then((res) => res.data)

      if (!isSuccess(response)) {
        throw new Error('Invalid address')
      }

      const account = response.data

      return account
        ? [
            {
              asset: AssetDOT,
              amount: assetToBase(assetAmount(account.balance, 10)),
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
              amount: assetToBase(assetAmount(transfer.amount, 10)),
            },
          ],
          to: [
            {
              to: transfer.from,
              amount: assetToBase(assetAmount(transfer.amount, 10)),
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

  getTransactionData = async (_txId: string): Promise<Tx> => {
    return Promise.reject()
  }

  deposit = async (_params: TxParams): Promise<TxHash> => {
    return Promise.reject()
  }

  transfer = async (_params: TxParams): Promise<TxHash> => {
    return Promise.reject()
  }

  // there is no fixed fee, we set fee amount when creating a transaction.
  getFees = async (): Promise<Fees> => {
    return Promise.reject()
  }
}

export { Client }
