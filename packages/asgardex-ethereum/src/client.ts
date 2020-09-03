import { generateMnemonic, validateMnemonic } from 'bip39'
import { ethers } from 'ethers'
import { Provider, TransactionResponse } from "@ethersproject/abstract-provider";
import { EtherscanProvider, getDefaultProvider } from "@ethersproject/providers";
import vaultABI from '../data/vault.json'
import erc20ABI from '../data/erc20.json'
import { getAddress, formatEther } from 'ethers/lib/utils';
import { toUtf8String } from "@ethersproject/strings";
import { Network, Address, Phrase } from './types';

const ethAddress = '0x0000000000000000000000000000000000000000'

/**
 * Interface for custom Ethereum client
 */
export interface EthereumClient {
  setNetwork(network: Network): Network
  setPhrase(phrase?: string): void
  getAddress(): string
  getBalance(address: Address): Promise<ethers.BigNumberish>
  getBlockNumber(): Promise<number>
  getTransactions(address?: Address): Promise<Array<TransactionResponse>>
  vaultTx(asset: string, amount: ethers.BigNumberish, memo: string): Promise<TransactionResponse>
  normalTx(addressTo: Address, amount: ethers.BigNumberish, asset: string): Promise<TransactionResponse>
}

/**
 * Custom Ethereum client
 * @todo Error handling
 */
export default class Client implements EthereumClient {
  private _wallet: ethers.Wallet
  private _network: Network
  private _phrase: Phrase
  private _provider: Provider
  private _address: Address
  private _balance: ethers.BigNumberish
  private _etherscan: EtherscanProvider
  private _vault: ethers.Contract | null = null

  constructor(network: Network = Network.TEST, phrase?: Phrase, vault?: string) {
    if (phrase && !validateMnemonic(phrase)) {
      throw new Error('Invalid Phrase')
    } else {
      this._phrase = phrase || generateMnemonic()
      this._network = network
      this._provider = getDefaultProvider(network)
      this._wallet = ethers.Wallet.fromMnemonic(this._phrase)
      this._address = this._wallet.address
      this._balance = 0
      this._etherscan = new EtherscanProvider(this._network) // for tx history
      if (vault) this.setVault(vault)
    }
  }

  /**
   * Getters
   */
  getAddress(): Address {
    return this._address
  }

  get wallet(): ethers.Wallet {
    return this._wallet
  }

  get vault(): ethers.Contract | null {
    return this._vault
  }

  get network(): Network {
    return this._network
  }

  get provider(): Provider {
    return this._provider
  }

  get balance(): ethers.BigNumberish {
    return this._balance
  }

  // to enable spying on EtherscanProvider.getHistory()
  get etherscan(): EtherscanProvider {
    return this._etherscan
  }

  /**
   * changes the wallet eg. when using connect() after init()
   */
  private changeWallet = (wallet: ethers.Wallet): ethers.Wallet => {
    return (this._wallet = wallet)
  }

  /**
   * changes the provider
   */
  EtherscanProvider(): Provider {
    const newWallet = this.wallet.connect(new EtherscanProvider(this._network))
    this.changeWallet(newWallet)
    return (this._provider = this._wallet.provider)
  }

  /**
   * Connects to the ethereum network with t
   */
  init(): ethers.Wallet {
    const provider = getDefaultProvider(this._network)
    const newWallet = this.wallet.connect(provider)
    this.changeWallet(newWallet)
    return this._wallet
  }

  /**
   * Set's the current network
   */
  setNetwork(network: Network): Network {
    if (!network) {
      throw new Error('Wallet must be provided')
    } else {
      this._network = network
      this._provider = getDefaultProvider(network)
      this._etherscan = new EtherscanProvider(network)
      return this._network
    }
  }

  /**
   * Set's the current vault contract
   */
  setVault(vault: string): ethers.Contract {
    if (!vault) {
      throw new Error('Vault address must be provided')
    } else {
      const contract = new ethers.Contract(vault, vaultABI, this._provider)
      this._vault = contract.connect(this.wallet)
      return this._vault
    }
  }

  /**
   * Generates a new mnemonic / phrase
   */
  static generatePhrase(): Phrase {
    return generateMnemonic()
  }

  /**
   * Validates a mnemonic phrase
   */
  static validatePhrase(phrase: Phrase): boolean {
    return validateMnemonic(phrase) ? true : false
  }

  /**
   * Sets a new phrase (Eg. If user wants to change wallet)
   */
  setPhrase(phrase: Phrase): boolean {
    if (!Client.validatePhrase(phrase)) {
      throw new Error('Phrase must be provided')
    } else {
      this._phrase = phrase
      const newWallet = ethers.Wallet.fromMnemonic(phrase)
      this.changeWallet(newWallet)
      return true
    }
  }

  /**
   * Validates an address
   */
  static validateAddress(address: Address): boolean {
    try {
      getAddress(address)
      return true
    } catch (error) {
      return false
    }
  }

  /**
   * Gets the eth balance of an address
   * @todo add start & end block parameters
   */
  async getBalance(address?: Address): Promise<ethers.BigNumberish> {
    if (address && !Client.validateAddress(address)) {
      throw new Error('Invalid Address')
    } else {
      const etherString = await this.wallet.provider.getBalance(address || this._address)
      this._balance = formatEther(etherString)
      return this._balance
    }
  }

  /**
   * Gets the erc20 asset balance of an address
   */
  async getERC20Balance(asset: Address, address?: Address): Promise<ethers.BigNumberish> {
    if (address && !Client.validateAddress(address)) {
      throw new Error('Invalid Address')
    }
    if (!Client.validateAddress(asset)) {
      throw new Error('Invalid Asset')
    }
    const contract = new ethers.Contract(asset, erc20ABI, this.wallet)
    const erc20 = contract.connect(this.wallet)
    const etherString = await erc20.functions.balanceOf(address || this._address)
    this._balance = formatEther(etherString)
    return this._balance
  }

  /**
   * Gets the current block of the network
   */
  async getBlockNumber(): Promise<number> {
    return await this.wallet.provider.getBlockNumber()
  }

  /**
   * Gets the transaction history of an address.
   */
  async getTransactions(address: Address = this._address): Promise<Array<TransactionResponse>> {
    if (address && !Client.validateAddress(address)) {
      throw new Error('Invalid Address')
    } else {
      const transactions = await this._etherscan.getHistory(address)
      return transactions
    }
  }

  /**
   * Sends a transaction to the vault
   */
  async vaultTx(asset: Address, amount: ethers.BigNumberish, memo: string): Promise<TransactionResponse> {
    if (!this.vault) {
      return Promise.reject('vault has to be set before sending vault tx')
    }
    if (asset.toString() == ethAddress) {
      return await this.vault.deposit(toUtf8String(memo), { value: amount })
    }
    const contract = new ethers.Contract(asset, erc20ABI, this.provider)
    const erc20 = contract.connect(this.wallet)
    const allowance = await erc20.allowance(this.vault.address, { from: this.wallet.address })
    if (formatEther(allowance) < amount) {
      const approved = await erc20.approve(this.vault.address, amount, { from: this.wallet.address })
      await approved.wait()
    }
    const deposit = await this.vault.deposit(asset, amount, toUtf8String(memo))
    return await deposit.wait()
  }

  /**
   * Sends a transaction to the vault
   * @todo add from?: string, nonce: BigNumberish, gasLimit: BigNumberish, gasPrice: BigNumberish
   */
  async normalTx(addressTo: Address, amount: ethers.BigNumberish): Promise<TransactionResponse> {
    const transactionRequest = { to: addressTo, value: amount }
    const transactionResponse = await this.wallet.sendTransaction(transactionRequest)
    return transactionResponse
  }
}

export { Client }
