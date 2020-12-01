import { generateMnemonic, validateMnemonic } from 'bip39'
import { ethers } from 'ethers'
import { Provider, TransactionResponse } from '@ethersproject/abstract-provider'
import { EtherscanProvider, getDefaultProvider } from '@ethersproject/providers'

import vaultABI from '../data/vault.json'
import erc20ABI from '../data/erc20.json'
import { formatEther, getAddress } from 'ethers/lib/utils'
import { toUtf8String } from '@ethersproject/strings'
import { Erc20TxOpts, EstimateGasERC20Opts, Network as EthNetwork, NormalTxOpts } from './types'
import {
  Address,
  Network as XChainNetwork,
  Tx,
  TxsPage,
  XChainClient,
  XChainClientParams,
} from '@xchainjs/xchain-client'
import { AssetETH, baseAmount } from '@xchainjs/xchain-util'
import * as blockChair from './blockchair-api'
import { ethNetworkToXchains, xchainNetworkToEths } from './utils'
import { TxHistoryParams } from '@xchainjs/xchain-client/src'
import { TxIO } from './types/blockchair-api-types'

const ethAddress = '0x0000000000000000000000000000000000000000'

/**
 * Interface for custom Ethereum client
 */
export interface EthereumClient {
  setNetwork(network: XChainNetwork): EthNetwork
  setPhrase(phrase?: string): void
  getAddress(): string
  getBalance(address: Address): Promise<ethers.BigNumberish>
  getBlockNumber(): Promise<number>
  getTransactionCount(blocktag: string | number): Promise<number>
  // getTransactions(address?: Address): Promise<Array<TransactionResponse>>
  vaultTx(asset: string, amount: ethers.BigNumberish, memo: string): Promise<TransactionResponse>
  estimateNormalTx(params: NormalTxOpts): Promise<ethers.BigNumberish>
  normalTx(opts: NormalTxOpts): Promise<TransactionResponse>
  estimateGasERC20Tx(params: EstimateGasERC20Opts): Promise<ethers.BigNumberish>
  erc20Tx(opts: Erc20TxOpts): Promise<TransactionResponse>
}

type ClientParams = XChainClientParams & {
  blockchairUrl?: string
  blockchairNodeApiKey?: string
  vault?: string
}

/**
 * Custom Ethereum client
 */
export default class Client implements XChainClient {
  private _wallet: ethers.Wallet
  private _network: EthNetwork
  private _phrase: string
  private _provider: Provider
  private _address: Address
  private _etherscan: EtherscanProvider
  private _vault: ethers.Contract | null = null
  private blockChairNodeUrl = ''
  private blockchairNodeApiKey = ''

  constructor({ network = 'testnet', blockchairUrl = '', blockchairNodeApiKey = '', phrase, vault }: ClientParams) {
    if (phrase && !validateMnemonic(phrase)) {
      throw new Error('Invalid Phrase')
    } else {
      this._phrase = phrase || generateMnemonic()
      this._network = xchainNetworkToEths(network)
      this._provider = getDefaultProvider(network)
      this._wallet = ethers.Wallet.fromMnemonic(this._phrase)
      this._address = this._wallet.address
      this._etherscan = new EtherscanProvider(this._network) // for tx history
      if (vault) this.setVault(vault)
      // Connects to the ethereum network with it
      const provider = getDefaultProvider(this._network)
      const newWallet = this.wallet.connect(provider)
      this.changeWallet(newWallet)
      this.setBlockchairNodeURL(blockchairUrl)
      this.setBlockchairNodeAPIKey(blockchairNodeApiKey)
    }
  }

  setBlockchairNodeURL = (url: string): void => {
    this.blockChairNodeUrl = url
  }

  setBlockchairNodeAPIKey(key: string): void {
    this.blockchairNodeApiKey = key
  }

  /**
   * Getters
   */
  getAddress(): Address {
    return this._address
  }

  protected getExplorerUrl = (): string => {
    return ''
  }

  get wallet(): ethers.Wallet {
    return this._wallet
  }

  get vault(): ethers.Contract | null {
    return this._vault
  }

  get network(): XChainNetwork {
    return ethNetworkToXchains(this._network)
  }

  get provider(): Provider {
    return this._provider
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
   * Set's the current network
   */
  setNetwork(network: XChainNetwork): void {
    if (!network) {
      throw new Error('Wallet must be provided')
    } else {
      this._network = xchainNetworkToEths(network)
      this._provider = getDefaultProvider(network)
      this._etherscan = new EtherscanProvider(network)
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
  static generatePhrase(): string {
    return generateMnemonic()
  }

  /**
   * Validates a mnemonic phrase
   */
  static validatePhrase(phrase: string): boolean {
    return validateMnemonic(phrase) ? true : false
  }

  /**
   * Sets a new phrase (Eg. If user wants to change wallet)
   */
  setPhrase(phrase: string): Address {
    if (!Client.validatePhrase(phrase)) {
      throw new Error('Phrase must be provided')
    } else {
      this._phrase = phrase
      const newWallet = ethers.Wallet.fromMnemonic(phrase)
      this.changeWallet(newWallet)
      return this.getAddress()
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
      return Promise.reject('Invalid Address')
    }

    try {
      return await this.wallet.provider.getBalance(address || this._address)
    } catch (error) {
      return Promise.reject(error)
    }
  }

  /**
   * Gets the erc20 asset balance of an address
   */
  async getERC20Balance(asset: Address, address?: Address): Promise<ethers.BigNumberish> {
    if (address && !Client.validateAddress(address)) {
      return Promise.reject('Invalid Address')
    }
    if (!Client.validateAddress(asset)) {
      return Promise.reject('Invalid Asset')
    }
    const contract = new ethers.Contract(asset, erc20ABI, this.wallet)
    const erc20 = contract.connect(this.wallet)
    const erc20Balance = await erc20.functions.balanceOf(address || this._address)
    return erc20Balance
  }

  /**
   * Gets the current block of the network
   */
  async getBlockNumber(): Promise<number> {
    return this.wallet.provider.getBlockNumber()
  }

  /**
   * Returns a Promise that resovles to the number of transactions this account has ever sent (also called the nonce) at the blockTag.
   * @param blocktag A block tag is used to uniquely identify a block’s position in the blockchain:
   * a Number or hex string:
   * Each block has a block number (eg. 42 or "0x2a).
   * “latest”:
   *  The most recently mined block.
   * “pending”:
   *  The block that is currently being mined.
   */
  async getTransactionCount(blocktag: string | number = 'latest', address?: Address): Promise<number> {
    return this.provider.getTransactionCount(address || this.getAddress(), blocktag)
  }

  getTransactions = async (params?: TxHistoryParams): Promise<TxsPage> => {
    const address = params?.address ?? this.getAddress()
    const limit = params?.limit ?? 10
    const offset = params?.offset ?? 0

    this._etherscan.baseUrl

    let totalCount = 0
    const transactions: Tx[] = []
    try {
      //Calling getAddress without limit/offset to get total count
      const dAddr = await blockChair.getAddress(this.blockChairNodeUrl, address, this.blockchairNodeApiKey)
      totalCount = dAddr[address].transactions.length

      const dashboardAddress = await blockChair.getAddress(
        this.blockChairNodeUrl,
        address,
        this.blockchairNodeApiKey,
        limit,
        offset,
      )
      const txList = dashboardAddress[address].transactions

      for (const hash of txList) {
        const rawTx = (await blockChair.getTx(this.blockChairNodeUrl, hash, this.blockchairNodeApiKey))[hash]
        const tx: Tx = {
          asset: AssetETH,
          from: rawTx.inputs.map((i: TxIO) => ({ from: i.recipient, amount: baseAmount(i.value, 8) })),
          to: rawTx.outputs
            // ignore tx with type 'nulldata'
            .filter((i: TxIO) => i.type !== 'nulldata')
            .map((i: TxIO) => ({ to: i.recipient, amount: baseAmount(i.value, 8) })),
          date: new Date(`${rawTx.transaction.time} UTC`), //blockchair api doesn't append UTC so need to put that manually
          type: 'transfer',
          hash: rawTx.transaction.hash,
        }
        transactions.push(tx)
      }
    } catch (error) {
      return Promise.reject(error)
    }

    return {
      total: totalCount,
      txs: transactions,
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
   * Returns the estimate gas for a normal transaction
   * @param params NormalTxOpts  transaction options
   */
  async estimateNormalTx(params: NormalTxOpts): Promise<ethers.BigNumberish> {
    const { addressTo, amount, overrides } = params
    const transactionRequest = Object.assign({ to: addressTo, value: amount }, overrides || {})
    return this.wallet.provider.estimateGas(transactionRequest)
  }

  /**
   * Sends a transaction in ether
   */
  async normalTx(params: NormalTxOpts): Promise<TransactionResponse> {
    const { addressTo, amount, overrides } = params
    const transactionRequest = Object.assign({ to: addressTo, value: amount }, overrides || {})
    const transactionResponse = this.wallet.sendTransaction(transactionRequest)
    return transactionResponse
  }

  /**
   * Returns a promise with the gas estimate to the function call `transfer` of a contract
   * that follows the ERC20 interfaces
   **/
  async estimateGasERC20Tx(params: EstimateGasERC20Opts): Promise<ethers.BigNumberish> {
    const { erc20ContractAddress, addressTo, amount } = params
    if (addressTo && !Client.validateAddress(addressTo)) {
      return Promise.reject('Invalid Address')
    }
    if (!Client.validateAddress(erc20ContractAddress)) {
      return Promise.reject('Invalid ERC20 Contract Address')
    }
    const contract = new ethers.Contract(erc20ContractAddress, erc20ABI, this.wallet)
    const erc20 = contract.connect(this.wallet)
    return erc20.estimateGas.transfer(addressTo, amount)
  }

  /**
   * Returns a promise with the `TransactionResponse` of the erc20 transfer
   */
  async erc20Tx(params: Erc20TxOpts): Promise<TransactionResponse> {
    const { erc20ContractAddress, addressTo, amount, overrides } = params
    if (addressTo && !Client.validateAddress(addressTo)) {
      return Promise.reject('Invalid Address')
    }
    if (!Client.validateAddress(erc20ContractAddress)) {
      return Promise.reject('Invalid ERC20 Contract Address')
    }
    const contract = new ethers.Contract(erc20ContractAddress, erc20ABI, this.wallet)
    const erc20 = contract.connect(this.wallet)
    const transactionOverrides = Object.assign({}, overrides || {})
    return erc20.transfer(addressTo, amount, transactionOverrides)
  }
}

export { Client }
