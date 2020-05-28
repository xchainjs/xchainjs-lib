import { generateMnemonic, validateMnemonic } from 'bip39'
import { Wallet, getDefaultProvider } from 'ethers'
import { EtherscanProvider, TransactionResponse, Provider } from 'ethers/providers'
import { BigNumberish, getAddress, formatEther } from 'ethers/utils'

/**
 * Class variables accessed across functions
 */
type Address = string
type Phrase = string

export enum Network {
  TEST = 'rinkeby',
  MAIN = 'homestead',
}

/**
 * Interface for custom Ethereum client
 */
export interface EthereumClient {
  setNetwork(network: Network): Network
  setPhrase(phrase?: string): void
  getBalance(address: Address): Promise<BigNumberish>
  getBlockNumber(): Promise<number>
  getTransactions(address?: Address): Promise<Array<TransactionResponse>>
  vaultTx(addressTo: Address, amount: BigNumberish, asset: string, memo: string): Promise<TransactionResponse>
  normalTx(addressTo: Address, amount: BigNumberish, asset: string): Promise<TransactionResponse>
}

/**
 * Custom Ethereum client
 * @todo Error handling
 */
export default class Client implements EthereumClient {
  private _wallet: Wallet
  private _network: Network
  private _phrase: Phrase
  private _provider: Provider
  private _address: Address
  private _balance: BigNumberish
  private _etherscan: EtherscanProvider

  constructor(network: Network = Network.TEST, phrase?: Phrase) {
    if (phrase && !validateMnemonic(phrase)) {
      throw new Error('Invalid Phrase')
    } else {
      this._phrase = phrase || generateMnemonic()
      this._network = network
      this._provider = getDefaultProvider(network)
      this._wallet = Wallet.fromMnemonic(this._phrase)
      this._address = this._wallet.address
      this._balance = 0
      this._etherscan = new EtherscanProvider(this._network) //for tx history
    }
  }

  /**
   * Getters
   */
  get address(): Address {
    return this._address
  }

  get wallet(): Wallet {
    return this._wallet
  }

  get network(): Network {
    return this._network
  }

  get provider(): Provider {
    return this._provider
  }

  get balance(): BigNumberish {
    return this._balance
  }

  // to enable spying on EtherscanProvider.getHistory()
  get etherscan(): EtherscanProvider {
    return this._etherscan
  }

  /**
   * changes the wallet eg. when using connect() after init()
   */
  private changeWallet = (wallet: Wallet): Wallet => {
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
  init(): Wallet {
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
      const newWallet = Wallet.fromMnemonic(phrase)
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
  async getBalance(address?: Address): Promise<BigNumberish> {
    if (address && !Client.validateAddress(address)) {
      throw new Error('Invalid Address')
    } else {
      const etherString = await this.wallet.provider.getBalance(address || this._address)
      this._balance = formatEther(etherString)
      return this._balance
    }
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
   * @todo add from?: string, nonce: BigNumberish, gasLimit: BigNumberish, gasPrice: BigNumberish
   */
  async vaultTx(addressTo: Address, amount: BigNumberish, memo: string): Promise<TransactionResponse> {
    const transactionRequest = { to: addressTo, value: amount, data: Buffer.from(memo, 'utf8') }
    const transactionResponse = await this.wallet.sendTransaction(transactionRequest)
    return transactionResponse
  }

  /**
   * Sends a transaction to the vault
   * @todo add from?: string, nonce: BigNumberish, gasLimit: BigNumberish, gasPrice: BigNumberish
   */
  async normalTx(addressTo: Address, amount: BigNumberish): Promise<TransactionResponse> {
    const transactionRequest = { to: addressTo, value: amount }
    const transactionResponse = await this.wallet.sendTransaction(transactionRequest)
    return transactionResponse
  }
}
