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
import { CosmosSDKClient, getTxsFromHistory } from '@xchainjs/xchain-cosmos'
import { Asset, baseAmount } from '@xchainjs/xchain-util'
import * as xchainCrypto from '@xchainjs/xchain-crypto'

import { PrivKey } from 'cosmos-client'
import { MsgSend, MsgMultiSend } from 'cosmos-client/x/bank'
import { codec } from 'cosmos-client/codec'

import { AssetRune } from './types'
import { getDenom, getAsset } from './util'

/**
 * Interface for custom Thorchain client
 */
export interface ThorchainClient {
  validateAddress(address: string): boolean
}

class Client implements ThorchainClient, XChainClient {
  private network: Network
  private thorClient: CosmosSDKClient
  private phrase = ''
  private address: Address = ''
  private privateKey: PrivKey | null = null

  private derive_path = "44'/931'/0'/0/0"

  constructor({ network = 'testnet', phrase }: XChainClientParams) {
    this.network = network
    this.thorClient = new CosmosSDKClient({
      server: this.getClientUrl(),
      chainId: this.getChainId(),
      prefix: this.getPrefix(),
      derive_path: this.derive_path,
    })

    if (phrase) this.setPhrase(phrase)
  }

  purgeClient(): void {
    this.phrase = ''
    this.address = ''
    this.privateKey = null
  }

  setNetwork(network: Network): XChainClient {
    this.network = network
    this.thorClient = new CosmosSDKClient({
      server: this.getClientUrl(),
      chainId: this.getChainId(),
      prefix: this.getPrefix(),
      derive_path: this.derive_path,
    })
    this.address = ''

    return this
  }

  getNetwork(): Network {
    return this.network
  }

  getClientUrl = (): string => {
    return this.network === 'testnet' ? 'http://134.209.138.247:1317' : 'http://138.68.125.107:1317'
  }

  getChainId = (): string => {
    return 'thorchain'
  }

  private getPrefix = (): string => {
    return this.network === 'testnet' ? 'tthor' : 'thor'
  }

  private registerCodecs = (): void => {
    codec.registerCodec('thorchain/MsgSend', MsgSend, MsgSend.fromJSON)
    codec.registerCodec('thorchain/MsgMultiSend', MsgMultiSend, MsgMultiSend.fromJSON)
  }

  getExplorerUrl = (): string => {
    return 'https://thorchain.net'
  }

  getExplorerAddressUrl = (address: Address): string => {
    return `${this.getExplorerUrl()}/addresses/${address}`
  }

  getExplorerTxUrl = (txID: string): string => {
    return `${this.getExplorerUrl()}/txs/${txID}`
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

      this.privateKey = this.thorClient.getPrivKeyFromMnemonic(this.phrase)
    }

    return this.privateKey
  }

  getAddress = (): string => {
    if (!this.address) {
      const address = this.thorClient.getAddressFromPrivKey(this.getPrivateKey())
      if (!address) {
        throw new Error('address not defined')
      }

      this.address = address
    }

    return this.address
  }

  validateAddress = (address: Address): boolean => {
    return this.thorClient.checkAddress(address)
  }

  getBalance = async (address?: Address, asset?: Asset): Promise<Balances> => {
    try {
      const balances = await this.thorClient.getBalance(address || this.getAddress())

      return balances
        .map((balance) => ({
          asset: (balance.denom && getAsset(balance.denom)) || AssetRune,
          amount: baseAmount(balance.amount, 8),
        }))
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

      const txHistory = await this.thorClient.searchTx({
        messageAction,
        messageSender,
        page,
        limit,
        txMinHeight,
        txMaxHeight,
      })

      return {
        total: parseInt(txHistory.total_count?.toString() || '0'),
        txs: getTxsFromHistory(txHistory.txs || [], AssetRune),
      }
    } catch (error) {
      return Promise.reject(error)
    }
  }

  getTransactionData = async (txId: string): Promise<Tx> => {
    try {
      const txResult = await this.thorClient.txsHashGet(txId)
      const txs = getTxsFromHistory([txResult], AssetRune)

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

      const transferResult = await this.thorClient.transfer({
        privkey: this.getPrivateKey(),
        from: this.getAddress(),
        to: recipient,
        amount: amount.amount().toString(),
        asset: getDenom(asset || AssetRune),
        memo,
      })

      return transferResult?.txhash || ''
    } catch (err) {
      return ''
    }
  }

  // Need to be updated
  getFees = async (): Promise<Fees> => {
    const fee = baseAmount(0)

    return Promise.resolve({
      type: 'base',
      fast: fee,
      fastest: fee,
      average: fee,
    })
  }
}

export { Client }
