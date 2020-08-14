import * as BIP39 from 'bip39'
import axios from 'axios'
import {
  Address,
  MultiTransfer,
  Network,
  TransferResult,
  Balances,
  Prefix,
  GetTxsParams,
  TxPage,
  TxFees,
} from './types/binance'

import { crypto } from '@binance-chain/javascript-sdk'
import { BncClient } from '@binance-chain/javascript-sdk/lib/client'

/**
 * Interface for custom Binance client
 */
export interface BinanceClient {
  setNetwork(net: Network): BinanceClient
  getNetwork(): Network
  getClientUrl(): string
  getExplorerUrl(): string
  getPrefix(): Prefix
  setPhrase(phrase?: string): BinanceClient
  getAddress(): string
  validateAddress(address: string): boolean
  getBalance(address?: Address): Promise<Balances>
  getTransactions(params?: GetTxsParams): Promise<TxPage>
  vaultTx(addressTo: Address, amount: number, asset: string, memo: string): Promise<TransferResult>
  normalTx(addressTo: Address, amount: number, asset: string): Promise<TransferResult>
  //isTestnet(): boolean
  // setPrivateKey(privateKey: string): Promise<BinanceClient>
  // removePrivateKey(): Promise<void>
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  getMarkets(limit?: number, offset?: number): Promise<any>
  multiSend(address: Address, transactions: MultiTransfer[], memo?: string): Promise<TransferResult>
  getFees(): Promise<TxFees>
}

/**
 * Custom Binance client
 *
 * @example
 * ```
 * import { Client as BinanceClient } from '@thorchain/asgardex-binance'
 *
 * # testnet (by default)
 * const client = new BinanceClient('any BIP39 mnemonic')
 * await client.transfer(...)
 * # mainnet
 * const client = await binance.client('any BIP39 mnemonic', Network.MAINNET)
 * await client.transfer(...)
 *
 * ```
 *
 * @class Binance
 * @implements {BinanceClient}
 */
class Client implements BinanceClient {
  private network: Network
  private bncClient: BncClient
  private phrase: string
  private address: string | null = null
  private privateKey: string | null = null
  private dirtyPrivateKey = true

  /**
   * Client has to be initialised with network type and phrase
   * It will throw an error if an invalid phrase has been passed
   **/

  constructor(phrase: string, network: Network = 'testnet') {
    // Invalid phrase will throw an error!
    this.setPhrase(phrase)
    this.network = network
    this.phrase = phrase
    this.bncClient = new BncClient(this.getClientUrl())
    this.bncClient.chooseNetwork(network)
  }

  // update network
  setNetwork(network: Network): BinanceClient {
    this.network = network
    this.bncClient = new BncClient(this.getClientUrl())
    this.bncClient.chooseNetwork(network)
    return this
  }

  // Will return the desired network
  getNetwork(): Network {
    return this.network
  }

  getClientUrl = (): string => {
    return this.network === 'testnet' ? 'https://testnet-dex.binance.org' : 'https://dex.binance.org'
  }

  getExplorerUrl = (): string => {
    return this.network === 'testnet' ? 'https://testnet-explorer.binance.org' : 'https://explorer.binance.org'
  }

  getPrefix = (): Prefix => {
    return this.network === 'testnet' ? 'tbnb' : 'bnb'
  }
  static generatePhrase = (): string => {
    return BIP39.generateMnemonic()
  }

  // Sets this.phrase to be accessed later
  setPhrase = (phrase: string): BinanceClient => {
    if (this.phrase && this.phrase === phrase) return this

    if (!Client.validatePhrase(phrase)) {
      throw Error('Invalid BIP39 phrase passed to Binance Client')
    }
    this.phrase = phrase
    // whenever a new phrase has been added, a private key + address need to be renewed
    this.address = null
    this.privateKey = null
    this.dirtyPrivateKey = true
    return this
  }

  static validatePhrase = (phrase: string): boolean => {
    return BIP39.validateMnemonic(phrase)
  }

  private getPrivateKey = () => {
    if (!this.privateKey) {
      const privateKey = crypto.getPrivateKeyFromMnemonic(this.phrase)
      this.privateKey = privateKey
      return privateKey
    }
    return this.privateKey
  }

  private setPrivateKey = async () => {
    if (this.dirtyPrivateKey) {
      const privateKey = this.getPrivateKey()
      await this.bncClient.setPrivateKey(privateKey).catch((error) => Promise.reject(error))
      this.dirtyPrivateKey = false
    }
    return Promise.resolve()
  }

  getAddress = (): string => {
    if (this.address) return this.address

    const privateKey = this.getPrivateKey() // Extract private key
    const address = crypto.getAddressFromPrivateKey(privateKey, this.getPrefix()) // Extract address with prefix
    this.address = address
    return address
  }

  validateAddress = (address: Address): boolean => {
    return this.bncClient.checkAddress(address, this.getPrefix())
  }

  getBalance = async (address?: Address): Promise<Balances> => {
    await this.bncClient.initChain()
    return this.bncClient.getBalance(address || this.getAddress())
  }

  getTransactions = async (params: GetTxsParams = {}): Promise<TxPage> => {
    const {
      address = this.getAddress(),
      blockHeight,
      endTime,
      limit,
      offset,
      side,
      startTime,
      txAsset,
      txType,
    } = params

    const clientUrl = `${this.getClientUrl()}/api/v1/transactions`
    const url = new URL(clientUrl)
    if (address) url.searchParams.set('address', address)
    if (blockHeight) url.searchParams.set('blockHeight', blockHeight.toString())
    if (endTime) url.searchParams.set('endTime', endTime.toString())
    if (limit) url.searchParams.set('limit', limit.toString())
    if (offset) url.searchParams.set('offset', offset.toString())
    if (side) url.searchParams.set('side', side.toString())
    if (startTime) url.searchParams.set('startTime', startTime.toString())
    if (txAsset) url.searchParams.set('txAsset', txAsset.toString())
    if (txType) url.searchParams.set('txType', txType.toString())

    await this.bncClient.initChain()

    try {
      const response = await axios.get<TxPage>(url.toString())
      return response.data
    } catch (error) {
      return Promise.reject(error)
    }
  }

  vaultTx = async (addressTo: Address, amount: number, asset: string, memo: string): Promise<TransferResult> => {
    await this.bncClient.initChain()
    await this.setPrivateKey()
    try {
      const addressFrom = this.getAddress()
      const result = await this.bncClient.transfer(addressFrom, addressTo, amount, asset, memo)
      return result
    } catch (error) {
      return Promise.reject(error)
    }
  }

  normalTx = async (addressTo: Address, amount: number, asset: string): Promise<TransferResult> => {
    await this.bncClient.initChain()
    await this.setPrivateKey()
    try {
      const addressFrom = this.getAddress()
      const result = await this.bncClient.transfer(addressFrom, addressTo, amount, asset)
      return result
    } catch (error) {
      return Promise.reject(error)
    }
  }

  getMarkets = async (limit = 1000, offset = 0) => {
    await this.bncClient.initChain()
    return this.bncClient.getMarkets(limit, offset)
  }

  multiSend = async (address: Address, transactions: MultiTransfer[], memo = '') => {
    await this.bncClient.initChain()
    return await this.bncClient.multiSend(address, transactions, memo)
  }

  getFees = async (): Promise<TxFees> => {
    await this.bncClient.initChain()
    try {
      const response = await axios.get<TxFees>(`${this.getClientUrl()}/api/v1/fees`)
      return response.data
    } catch (error) {
      return Promise.reject(error)
    }
  }
}
export { Client }
