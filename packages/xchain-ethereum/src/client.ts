import { ethers, BigNumberish } from 'ethers'
import { Provider, TransactionResponse } from '@ethersproject/abstract-provider'
import { EtherscanProvider, getDefaultProvider } from '@ethersproject/providers'

import vaultABI from '../data/vault.json'
import erc20ABI from '../data/erc20.json'
import { formatEther } from 'ethers/lib/utils'
import { toUtf8String } from '@ethersproject/strings'
import { Erc20TxOpts, EstimateGasERC20Opts, GasOracleResponse, Network as EthNetwork, NormalTxOpts } from './types'
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
  TxHistoryParams,
} from '@xchainjs/xchain-client'
import { AssetETH, baseAmount, baseToAsset } from '@xchainjs/xchain-util'
import * as Crypto from '@xchainjs/xchain-crypto'
import * as blockChair from './blockchair-api'
import { ethNetworkToXchains, xchainNetworkToEths } from './utils'
import { TxIO } from './types/blockchair-api-types'
import { getGasOracle } from './etherscan-api'

const ethAddress = '0x0000000000000000000000000000000000000000'

/**
 * Interface for custom Ethereum client
 */
export interface EthereumClient {
  getBlockNumber(): Promise<number>
  getTransactionCount(blocktag: string | number): Promise<number>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  call<T>(asset: Address, abi: ethers.ContractInterface, func: string, params: Array<any>): Promise<T>
  vaultTx(asset: string, amount: BigNumberish, memo: string): Promise<TransactionResponse>
  estimateNormalTx(params: NormalTxOpts): Promise<BigNumberish>
  normalTx(opts: NormalTxOpts): Promise<TransactionResponse>
  estimateGasERC20Tx(params: EstimateGasERC20Opts): Promise<BigNumberish>
  erc20Tx(opts: Erc20TxOpts): Promise<TransactionResponse>
}

type ClientParams = XChainClientParams & {
  blockchairUrl?: string
  blockchairNodeApiKey?: string
  etherscanApiKey?: string
  vault?: string
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
export default class Client implements XChainClient, EthereumClient {
  private _wallet: ethers.Wallet
  private _network: EthNetwork
  private _phrase: string
  private _provider: Provider
  private _address: Address
  private _etherscan: EtherscanProvider
  private _vault?: Address
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
      this._provider = getDefaultProvider(this._network)
      this._wallet = ethers.Wallet.fromMnemonic(this._phrase)
      this._address = this._wallet.address
      this._vault = vault
      this._etherscan = new EtherscanProvider(this._network, etherscanApiKey) // for tx history

      // Connects to the ethereum network with it
      this.changeWallet(this.wallet.connect(this._provider))
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

  getVault(): Address | undefined {
    return this._vault
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
    this._provider = new EtherscanProvider(this._network)
    this.changeWallet(this.wallet.connect(this._provider))
    return this._provider
  }

  /**
   * Set's the current network
   */
  setNetwork(network: XChainNetwork): void {
    if (!network) {
      throw new Error('Wallet must be provided')
    } else {
      this._network = xchainNetworkToEths(network)
      this._provider = getDefaultProvider(this._network)
      this._etherscan = new EtherscanProvider(this._network)
    }
  }

  /**
   * Set's the current vault contract
   */
  setVault(vault: string): string {
    if (!vault) {
      throw new Error('Vault address must be provided')
    }

    return (this._vault = vault)
  }

  /**
   * Sets a new phrase (Eg. If user wants to change wallet)
   */
  setPhrase(phrase: string): Address {
    if (!Crypto.validatePhrase(phrase)) {
      throw new Error('Phrase must be provided')
    }

    this._phrase = phrase
    this.changeWallet(ethers.Wallet.fromMnemonic(phrase))
    return this.getAddress()
  }

  /**
   * Validates an address
   */
  static validateAddress(address: Address): boolean {
    try {
      ethers.utils.getAddress(address)
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
          amount: baseAmount(dashboardAddress[address].address.balance, ETH_DECIMAL),
        },
      ]
    } catch (error) {
      return Promise.reject(new Error('Invalid address'))
    }
  }

  /**
   * Gets the erc20 asset balance of an address
   */
  async getERC20Balance(asset: Address, address?: Address): Promise<BigNumberish> {
    if (address && !Client.validateAddress(address)) {
      return Promise.reject('Invalid Address')
    }
    if (!Client.validateAddress(asset)) {
      return Promise.reject('Invalid Asset')
    }
    return this.call<BigNumberish>(asset, erc20ABI, 'balanceOf', [address || this.getAddress()])
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
    const amount = baseToAsset(amountParam).amount().toString()
    const res = await (memo
      ? this.vaultTx(recipient, amount, memo)
      : this.normalTx({
          addressTo: recipient,
          amount,
        }))

    return res.hash
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async call<T>(asset: Address, abi: ethers.ContractInterface, func: string, params: Array<any>): Promise<T> {
    try {
      if (!asset) {
        throw new Error('asset must be provided')
      }

      const contract = new ethers.Contract(asset, abi, this.provider).connect(this.wallet)
      return await contract[func](...params)
    } catch (error) {
      return Promise.reject(error)
    }
  }

  /**
   * Sends a transaction to the vault
   */
  async vaultTx(asset: Address, amount: BigNumberish, memo: string): Promise<TransactionResponse> {
    try {
      const vault = this.getVault()
      if (!vault) {
        return Promise.reject('vault has to be set before sending vault tx')
      }

      if (asset == ethAddress) {
        return await this.call<TransactionResponse>(vault, vaultABI, 'deposit', [toUtf8String(memo), { value: amount }])
      }

      const allowance = await this.call<BigNumberish>(asset, erc20ABI, 'allowance', [
        this.getAddress(),
        vault,
        { from: this.wallet.address },
      ])
      if (formatEther(allowance) < amount) {
        const approved = await this.call<TransactionResponse>(asset, erc20ABI, 'approve', [
          vault,
          amount,
          { from: this.wallet.address },
        ])
        await approved.wait()
      }
      return await this.call<TransactionResponse>(vault, vaultABI, 'deposit', [asset, amount, toUtf8String(memo)])
    } catch (error) {
      return Promise.reject(error)
    }
  }

  /**
   * Sends a transaction in ether
   */
  async normalTx(params: NormalTxOpts): Promise<TransactionResponse> {
    try {
      const { addressTo, amount, overrides } = params
      const transactionRequest = Object.assign({ to: addressTo, value: amount }, overrides || {})
      return await this.wallet.sendTransaction(transactionRequest)
    } catch (error) {
      return Promise.reject(error)
    }
  }

  getFees = async (): Promise<Fees> => {
    return getGasOracle(this._etherscan.baseUrl, this._etherscan.apiKey).then(mapGasOracleResponseToFees)
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
  async estimateNormalTx(params: NormalTxOpts): Promise<BigNumberish> {
    const { addressTo, amount, overrides } = params
    const transactionRequest = Object.assign({ to: addressTo, value: amount, gas: '5208' }, overrides || {})
    return this.wallet.provider.estimateGas(transactionRequest)
  }

  /**
   * Returns a promise with the gas estimate to the function call `transfer` of a contract
   * that follows the ERC20 interfaces
   **/
  async estimateGasERC20Tx(params: EstimateGasERC20Opts): Promise<BigNumberish> {
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
    const transactionOverrides = Object.assign({}, overrides || {})
    return this.call<TransactionResponse>(erc20ContractAddress, erc20ABI, 'transfer', [
      addressTo,
      amount,
      transactionOverrides,
    ])
  }
}

export { Client }
