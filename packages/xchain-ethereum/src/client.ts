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
  Balance,
  TxParams,
  TxHash,
  Fees,
} from '@xchainjs/xchain-client'
import { AssetETH, baseAmount } from '@xchainjs/xchain-util'
import * as Crypto from '@xchainjs/xchain-crypto'
import * as blockChair from './blockchair-api'
import { ethNetworkToXchains, xchainNetworkToEths } from './utils'
import { TxHistoryParams } from '@xchainjs/xchain-client/src'
import { TxIO } from './types/blockchair-api-types'
import { Networkish } from '@ethersproject/networks'
import axios from 'axios'

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
  etherscanApiKey?: string
  vault?: string
}

type GasOracleResponse = {
  LastBlock?: string
  SafeGasPrice?: string
  ProposeGasPrice?: string
  FastGasPrice?: string
}

class EtherscanCustomProvider extends EtherscanProvider {
  constructor(network?: Networkish, apiKey?: string) {
    super(network, apiKey)
  }

  get apiKeyQueryParameter() {
    return !!this.apiKey ? `&apiKey=${this.apiKey}` : ''
  }

  /**
   * @desc SafeGasPrice, ProposeGasPrice And FastGasPrice returned in string-Gwei
   * @see https://etherscan.io/apis#gastracker
   */
  getGasOracle = (): Promise<GasOracleResponse> => {
    let url = this.baseUrl + '/api?module=gastracker&action=gasoracle'

    return axios.get(url + this.apiKeyQueryParameter).then((response) => response.data.result)
  }
}

const ETH_DECIMAL = 18

const mapGasOracleResponseToFees = (response: GasOracleResponse): Fees => ({
  average: baseAmount(response.SafeGasPrice, ETH_DECIMAL),
  fast: baseAmount(response.ProposeGasPrice, ETH_DECIMAL),
  fastest: baseAmount(response.FastGasPrice, ETH_DECIMAL),
  type: 'base',
})

/**
 * Custom Ethereum client
 */
export default class Client implements XChainClient {
  private _wallet: ethers.Wallet
  private _network: EthNetwork
  private _phrase: string
  private _provider: Provider
  private _address: Address
  private _etherscan: EtherscanCustomProvider
  private _vault: ethers.Contract | null = null
  private blockchairNodeUrl = ''
  private blockchairNodeApiKey = ''

  constructor({
    network = 'testnet',
    blockchairUrl = '',
    blockchairNodeApiKey = '',
    phrase,
    vault,
    etherscanApiKey,
  }: ClientParams) {
    if (phrase && !Crypto.validatePhrase(phrase)) {
      throw new Error('Invalid Phrase')
    } else {
      this._phrase = phrase || Crypto.generatePhrase() // @todo do we need to set a size here?
      this._network = xchainNetworkToEths(network)
      this._provider = getDefaultProvider(network)
      this._wallet = ethers.Wallet.fromMnemonic(this._phrase)
      this._address = this._wallet.address
      this._etherscan = new EtherscanCustomProvider(this._network, etherscanApiKey) // for tx history
      if (vault) this.setVault(vault)
      // Connects to the ethereum network with it
      const provider = getDefaultProvider(this._network)
      const newWallet = this.wallet.connect(provider)
      this.changeWallet(newWallet)
      this.setBlockchairNodeURL(blockchairUrl)
      this.setBlockchairNodeAPIKey(blockchairNodeApiKey)
    }
  }

  purgeClient(): void {
    this.setPhrase('')
  }

  getNetwork(): XChainNetwork {
    return ethNetworkToXchains(this._network)
  }

  setBlockchairNodeURL = (url: string): void => {
    this.blockchairNodeUrl = url
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

  // @todo what url ?
  getExplorerUrl = (): string => {
    return ''
  }

  // @todo what url ?
  getExplorerAddressUrl = (address: Address): string => {
    return `${this.getExplorerUrl()}/address/${address}`
  }
  // @todo what url ?
  getExplorerTxUrl = (txID: string): string => {
    return `${this.getExplorerUrl()}/tx/${txID}`
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
      this._etherscan = new EtherscanCustomProvider(network)
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
   * Sets a new phrase (Eg. If user wants to change wallet)
   */
  setPhrase(phrase: string): Address {
    if (!Crypto.validatePhrase(phrase)) {
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

  // Returns balance of address
  getBalance = async (addressParam?: string): Promise<Balance[]> => {
    const address = addressParam || this.getAddress()

    try {
      const dashboardAddress = await blockChair.getAddress(this.blockchairNodeUrl, address, this.blockchairNodeApiKey)
      return [
        {
          asset: AssetETH,
          amount: baseAmount(dashboardAddress[address].address.balance),
        },
      ]
    } catch (error) {
      return Promise.reject(new Error('Invalid address'))
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
      const dAddr = await blockChair.getAddress(this.blockchairNodeUrl, address, this.blockchairNodeApiKey)
      totalCount = dAddr[address].transactions.length

      const dashboardAddress = await blockChair.getAddress(
        this.blockchairNodeUrl,
        address,
        this.blockchairNodeApiKey,
        limit,
        offset,
      )
      const txList = dashboardAddress[address].transactions

      for (const hash of txList) {
        const rawTx = (await blockChair.getTx(this.blockchairNodeUrl, hash, this.blockchairNodeApiKey))[hash]
        const tx: Tx = {
          asset: AssetETH,
          from: rawTx.inputs.map((i: TxIO) => ({ from: i.recipient, amount: baseAmount(i.value, ETH_DECIMAL) })),
          to: rawTx.outputs
            // ignore tx with type 'nulldata'
            .filter((i: TxIO) => i.type !== 'nulldata')
            .map((i: TxIO) => ({ to: i.recipient, amount: baseAmount(i.value, ETH_DECIMAL) })),
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

  getTransactionData = async (txId: string): Promise<Tx> => {
    try {
      const rawTx = (await blockChair.getTx(this.blockchairNodeUrl, txId, this.blockchairNodeApiKey))[txId]
      return {
        asset: AssetETH,
        from: rawTx.inputs.map((i) => ({ from: i.recipient, amount: baseAmount(i.value, ETH_DECIMAL) })),
        to: rawTx.outputs.map((i) => ({ to: i.recipient, amount: baseAmount(i.value, ETH_DECIMAL) })),
        date: new Date(`${rawTx.transaction.time} UTC`), //blockchair api doesn't append UTC so need to put that manually
        type: 'transfer',
        hash: rawTx.transaction.hash,
      }
    } catch (error) {
      return Promise.reject(error)
    }
  }

  transfer = async ({ memo, amount: amountParam, recipient }: TxParams): Promise<TxHash> => {
    // @todo do we need to convert from BaseAmount to the AssetAmount
    const amount = amountParam.amount().toString()
    const res = await (memo
      ? this.vaultTx(recipient, amount, memo)
      : this.normalTx({
          addressTo: recipient,
          amount,
        }))

    return res.hash
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
   * Sends a transaction in ether
   */
  async normalTx(params: NormalTxOpts): Promise<TransactionResponse> {
    const { addressTo, amount, overrides } = params
    const transactionRequest = Object.assign({ to: addressTo, value: amount }, overrides || {})
    const transactionResponse = this.wallet.sendTransaction(transactionRequest)
    return transactionResponse
  }

  getFees = async (): Promise<Fees> => {
    return this._etherscan.getGasOracle().then(mapGasOracleResponseToFees)
  }

  getDefaultFees = (): Fees => {
    return {
      type: 'base',
      average: baseAmount(0),
      fast: baseAmount(0),
      fastest: baseAmount(0),
    }
  }

  /**
   * Returns the estimate gas for a normal transaction
   * @param params NormalTxOpts  transaction options
   */
  async estimateNormalTx(params: NormalTxOpts): Promise<ethers.BigNumberish> {
    const { addressTo, amount, overrides } = params
    const transactionRequest = Object.assign({ to: addressTo, value: amount, gas: '5208' }, overrides || {})
    return this.wallet.provider.estimateGas(transactionRequest)
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
