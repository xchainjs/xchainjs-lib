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
import { Asset, baseAmount } from '@xchainjs/xchain-util'
import * as xchainCrypto from '@xchainjs/xchain-crypto'

import { PrivKey } from 'cosmos-client'
import { MsgSend, MsgMultiSend } from 'cosmos-client/x/bank'
import { codec } from 'cosmos-client/codec'

import { CosmosSDKClient } from './cosmos/sdk-client'
import { AssetAtom, AssetMuon } from './types'
import { getDenom, getAsset, getTxsFromHistory } from './util'

/**
 * Interface for custom Cosmos client
 */
export interface CosmosClient {
  validateAddress(address: string): boolean

  getMainAsset(): Asset
}

class Client implements CosmosClient, XChainClient {
  private network: Network
  private sdkClient: CosmosSDKClient
  private phrase = ''
  private address: Address = '' // default address at index 0
  private privateKey: PrivKey | null = null // default private key at index 0

  constructor({ network = 'testnet', phrase }: XChainClientParams) {
    this.network = network
    this.sdkClient = new CosmosSDKClient({ server: this.getClientUrl(), chainId: this.getChainId() })

    if (phrase) this.setPhrase(phrase)
  }

  purgeClient(): void {
    this.phrase = ''
    this.address = ''
    this.privateKey = null
  }

  setNetwork = (network: Network): XChainClient => {
    this.network = network
    this.sdkClient = new CosmosSDKClient({ server: this.getClientUrl(), chainId: this.getChainId() })
    this.address = ''

    return this
  }

  getNetwork(): Network {
    return this.network
  }

  getClientUrl = (): string => {
    return this.network === 'testnet' ? 'http://lcd.gaia.bigdipper.live:1317' : 'https://api.cosmos.network'
  }

  getChainId = (): string => {
    return this.network === 'testnet' ? 'gaia-3a' : 'cosmoshub-3'
  }

  private registerCodecs = (): void => {
    codec.registerCodec('cosmos-sdk/MsgSend', MsgSend, MsgSend.fromJSON)
    codec.registerCodec('cosmos-sdk/MsgMultiSend', MsgMultiSend, MsgMultiSend.fromJSON)
  }

  getExplorerUrl = (): string => {
    return this.network === 'testnet' ? 'https://gaia.bigdipper.live' : 'https://cosmos.bigdipper.live'
  }

  getExplorerAddressUrl = (address: Address): string => {
    return `${this.getExplorerUrl()}/account/${address}`
  }

  getExplorerTxUrl = (txID: string): string => {
    return `${this.getExplorerUrl()}/transactions/${txID}`
  }

  static generatePhrase = (): string => {
    return xchainCrypto.generatePhrase()
  }

  static validatePhrase = (phrase: string): boolean => {
    return xchainCrypto.validatePhrase(phrase)
  }

  setPhrase = (phrase: string): Address => {
    if (this.phrase !== phrase) {
      if (!Client.validatePhrase(phrase)) {
        throw new Error('Invalid BIP39 phrase')
      }

      this.phrase = phrase
      this.privateKey = null
      this.address = ''
    }

    return this.getAddress()
  }

  private getPrivateKey = (): PrivKey => {
    if (!this.privateKey) {
      if (!this.phrase) throw new Error('Phrase not set')

      this.privateKey = this.sdkClient.getPrivKeyFromMnemonic(this.phrase)
    }

    return this.privateKey
  }

  getAddress = (): string => {
    if (!this.address) {
      const address = this.sdkClient.getAddressFromPrivKey(this.getPrivateKey())
      if (!address) {
        throw new Error('address not defined')
      }

      this.address = address
    }

    return this.address
  }

  validateAddress = (address: Address): boolean => {
    return this.sdkClient.checkAddress(address)
  }

  getMainAsset = (): Asset => {
    return this.network === 'testnet' ? AssetMuon : AssetAtom
  }

  getBalance = async (address?: Address, asset?: Asset): Promise<Balances> => {
    try {
      const balances = await this.sdkClient.getBalance(address || this.getAddress())
      const mainAsset = this.getMainAsset()

      return balances
        .map((balance) => {
          return {
            asset: (balance.denom && getAsset(balance.denom)) || mainAsset,
            amount: baseAmount(balance.amount, 6),
          }
        })
        .filter((balance) => !asset || balance.asset === asset)
    } catch (error) {
      return Promise.reject(error)
    }
  }

  getTransactions = async (params?: TxHistoryParams): Promise<TxsPage> => {
    const messageAction = undefined
    const messageSender = (params && params.address) || this.getAddress()
    const page = (params && params.offset) || undefined
    const limit = (params && params.limit) || undefined
    const txMinHeight = undefined
    const txMaxHeight = undefined

    try {
      this.registerCodecs()

      const mainAsset = this.getMainAsset()
      const txHistory = await this.sdkClient.searchTx({
        messageAction,
        messageSender,
        page,
        limit,
        txMinHeight,
        txMaxHeight,
      })

      return {
        total: parseInt(txHistory.total_count?.toString() || '0'),
        txs: getTxsFromHistory(txHistory.txs || [], mainAsset),
      }
    } catch (error) {
      return Promise.reject(error)
    }
  }

  getTransactionData = async (txId: string): Promise<Tx> => {
    try {
      const txResult = await this.sdkClient.txsHashGet(txId)
      const txs = getTxsFromHistory([txResult], this.getMainAsset())

      if (txs.length === 0) {
        throw new Error('transaction not found')
      }

      return txs[0]
    } catch (error) {
      return Promise.reject(error)
    }
  }

  deposit = async ({ asset, amount, recipient, memo }: TxParams): Promise<TxHash> => {
    return this.transfer({ asset, amount, recipient, memo })
  }

  transfer = async ({ asset, amount, recipient, memo }: TxParams): Promise<TxHash> => {
    try {
      this.registerCodecs()

      const mainAsset = this.getMainAsset()
      const transferResult = await this.sdkClient.transfer({
        privkey: this.getPrivateKey(),
        from: this.getAddress(),
        to: recipient,
        amount: amount.amount().toString(),
        asset: getDenom(asset || mainAsset),
        memo,
      })

      return transferResult?.txhash || ''
    } catch (error) {
      return Promise.reject(error)
    }
  }

  // there is no fixed fee, we set fee amount when creating a transaction.
  getFees = async (): Promise<Fees> => {
    return Promise.resolve({
      type: 'base',
      fast: baseAmount(750, 6),
      fastest: baseAmount(2500, 6),
      average: baseAmount(0, 6),
    })
  }
}

export { Client }
