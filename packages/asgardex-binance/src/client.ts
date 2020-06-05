import * as BIP39 from 'bip39'
import axios from 'axios'
import bncClient from '@binance-chain/javascript-sdk'
import { BncClient, Address, MultiTransfer, Market, Network, TransferResult, Balances } from './types/binance'

/**
 * Interface for custom Binance client
 */
export interface BinanceClient {
  init(): Promise<void>
  setNetwork(net: Network): Promise<void>
  getNetwork(): Network
  getClientUrl(): string
  getExplorerUrl(): string
  getPrefix(): string
  setPhrase(phrase?: string): Promise<void>
  getAddress(): string
  validateAddress(address: string): boolean
  getBalance(address?: Address): Promise<Balances>
  // TODO Add return type
  // https://gitlab.com/thorchain/asgardex-common/asgardex-binance/-/issues/2
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  getTransactions(date: number, address?: string): Promise<any[]>
  vaultTx(addressTo: Address, amount: number, asset: string, memo: string): Promise<TransferResult>
  normalTx(addressTo: Address, amount: number, asset: string): Promise<TransferResult>
  //isTestnet(): boolean
  // setPrivateKey(privateKey: string): Promise<BinanceClient>
  // removePrivateKey(): Promise<void>
  getMarkets(limit?: number, offset?: number): Promise<Market>
  multiSend(address: Address, transactions: MultiTransfer[], memo?: string): Promise<TransferResult>
}

/**
 * Custom Binance client
 *
 * @example
 * ```
 * import { binance } from 'asgardex-common'
 *
 * # testnet
 * const client = await binance.client(binance.Network.TESTNET)
 * await client.transfer(...)
 * # mainnet
 * const client = await binance.client(binance.Network.MAINNET)
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

  // Client is initialised with network type
  constructor(network: Network = Network.TESTNET, phrase = '') {
    this.network = network
    this.phrase = phrase
    this.bncClient = new bncClient(this.getClientUrl())
    this.bncClient.chooseNetwork(network)
    this.setPhrase(this.phrase)
  }

  init = async (): Promise<void> => {
    await this.bncClient.initChain()
  }

  // update network
  setNetwork = async (_network: Network): Promise<void> => {
    this.network = _network
    this.bncClient = new bncClient(this.getClientUrl())
    this.bncClient.chooseNetwork(_network)
    this.setPhrase(this.phrase)
    await this.bncClient.initChain()
  }

  // Will return the desired network
  getNetwork(): Network {
    return this.network
  }

  getClientUrl = (): string => {
    return this.network === Network.TESTNET ? 'https://testnet-dex.binance.org' : 'https://dex.binance.org'
  }

  getExplorerUrl = (): string => {
    return this.network === Network.TESTNET ? 'https://testnet-explorer.binance.org' : 'https://explorer.binance.org'
  }

  getPrefix = (): string => {
    return this.network === Network.TESTNET ? 'tbnb' : 'bnb'
  }

  static generatePhrase = (): string => {
    return BIP39.generateMnemonic()
  }

  // Sets this.phrase to be accessed later
  setPhrase = async (phrase: string): Promise<void> => {
    if (Client.validatePhrase(phrase)) {
      this.phrase = phrase
      await this.bncClient.setPrivateKey(bncClient.crypto.getPrivateKeyFromMnemonic(this.phrase))
    } else {
      Promise.reject('Invalid BIP39 phrase passed to Binance Client')
    }
  }

  static validatePhrase = (phrase: string): boolean => {
    return BIP39.validateMnemonic(phrase)
  }

  getAddress = (): string => {
    const privateKey = bncClient.crypto.getPrivateKeyFromMnemonic(this.phrase) // Extract private key
    const address = bncClient.crypto.getAddressFromPrivateKey(privateKey, this.getPrefix()) // Extract address with prefix
    return address
  }

  validateAddress = (address: Address): boolean => {
    return this.bncClient.checkAddress(address, this.getPrefix())
  }

  getBalance = async (address?: Address): Promise<Balances> => {
    if (address) {
      return this.bncClient.getBalance(address)
    } else {
      try {
        return this.bncClient.getBalance(this.getAddress())
      } catch (e) {
        return Promise.reject(e)
      }
    }
  }

  // TODO Add proper return type
  // https://gitlab.com/thorchain/asgardex-common/asgardex-binance/-/issues/2
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  getTransactions = async (date: number, address?: string): Promise<any[]> => {
    const pathTx = '/api/v1/transactions?address='
    const startTime = '&startTime=' // 3 months back. might need to think this.
    let address_ = ''
    address_ = address ? address : this.getAddress()
    try {
      const response = await axios.get(this.getClientUrl() + pathTx + address_ + startTime + date)
      return response?.data?.tx
    } catch (error) {
      return Promise.reject(error)
    }
  }

  vaultTx = async (addressTo: Address, amount: number, asset: string, memo: string): Promise<TransferResult> => {
    const addressFrom = this.getAddress()
    const result = await this.bncClient.transfer(addressFrom, addressTo, amount, asset, memo)
    return result
  }

  normalTx = async (addressTo: Address, amount: number, asset: string): Promise<TransferResult> => {
    const fromAddress = this.getAddress()
    const result = await this.bncClient.transfer(fromAddress, addressTo, amount, asset)
    return result
  }

  getMarkets = async (limit = 1000, offset = 0): Promise<Market> => {
    return this.bncClient.getMarkets(limit, offset)
  }

  multiSend = async (address: Address, transactions: MultiTransfer[], memo = '') => {
    const result = await this.bncClient.multiSend(address, transactions, memo)
    return result
  }
}
export { Client }
