import * as BIP39 from 'bip39'
import bncClient from '@binance-chain/javascript-sdk'
import { BncClient, Address, MultiTransfer, Market, Balance, Network, TransferResult } from './types/binance'
const axios = require('axios').default

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
  generatePhrase(): string
  setPhrase(phrase?: string): void
  validatePhrase(phrase: string): boolean
  getAddress(): string
  validateAddress(address: string): boolean
  getBalance(address?: Address): Promise<Balance>
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
  private phrase = ''

  // Client is initialised with network type
  constructor(_network: Network = Network.TESTNET, _phrase?: string) {
    this.network = _network
    if (_phrase) {
      this.phrase = _phrase
    }
    this.bncClient = new bncClient(this.getClientUrl())
    this.bncClient.chooseNetwork(_network)
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

  generatePhrase = (): string => {
    return BIP39.generateMnemonic()
  }

  // Sets this.phrase to be accessed later
  setPhrase = (phrase?: string) => {
    if (phrase) {
      if (BIP39.validateMnemonic(phrase)) {
        this.phrase = phrase
        this.bncClient.setPrivateKey(bncClient.crypto.getPrivateKeyFromMnemonic(this.phrase))
      } else {
        console.log('Invalid BIP39 phrase passed to Binance Client')
      }
    }
  }

  validatePhrase = (phrase: string): boolean => {
    if (phrase) {
      return BIP39.validateMnemonic(phrase)
    } else {
      return false
    }
  }

  getAddress = (): string => {
    const privateKey = bncClient.crypto.getPrivateKeyFromMnemonic(this.phrase) // Extract private key
    const address = bncClient.crypto.getAddressFromPrivateKey(privateKey, this.getPrefix()) // Extract address with prefix
    return address
  }

  validateAddress = (address: Address): boolean => {
    return this.bncClient.checkAddress(address, this.getPrefix())
  }

  getBalance = async (address?: Address): Promise<Balance> => {
    let balance
    if (address) {
      balance = this.bncClient.getBalance(address)
    } else {
      balance = this.bncClient.getBalance(this.getAddress())
    }
    return balance
  }

  getTransactions = async (date: number, address?: string): Promise<any[]> => {
    const pathTx = '/api/v1/transactions?address='
    const startTime = '&startTime=' // 3 months back. might need to think this.
    let transactions = []
    let address_ = ''
    address_ = address ? address : this.getAddress()
    try {
      const response = await axios.get(this.getClientUrl() + pathTx + address_ + startTime + date)
      transactions = response.data.tx
    } catch (error) {
      return Promise.reject(error)
    }
    return transactions
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

export default Client
