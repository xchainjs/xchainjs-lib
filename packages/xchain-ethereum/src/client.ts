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
  Balances,
} from '@xchainjs/xchain-client'
import { AssetETH, baseAmount, baseToAsset, BaseAmount, assetFromString } from '@xchainjs/xchain-util'
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
  vaultTx(asset: string, amount: BaseAmount, memo: string): Promise<TransactionResponse>
  estimateNormalTx(params: NormalTxOpts): Promise<BaseAmount>
  normalTx(opts: NormalTxOpts): Promise<TransactionResponse>
  estimateGasERC20Tx(params: EstimateGasERC20Opts): Promise<BaseAmount>
  erc20Tx(opts: Erc20TxOpts): Promise<TransactionResponse>
}

type ClientParams = XChainClientParams & {
  blockchairUrl?: string
  blockchairNodeApiKey?: string
  etherscanApiKey?: string
  vault?: string
}

const ETH_DECIMAL = 18

/**
 * Custom Ethereum client
 */
export default class Client implements XChainClient, EthereumClient {
  private network: EthNetwork
  private address: Address | null = null
  private vault: Address | null = null
  private wallet: ethers.Wallet | null = null
  private provider: Provider
  private etherscan: EtherscanProvider
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
    this.network = xchainNetworkToEths(network)
    this.provider = getDefaultProvider(this.network)
    this.etherscan = new EtherscanProvider(this.network, etherscanApiKey) // for tx history
    this.setBlockchairNodeURL(blockchairUrl)
    this.setBlockchairNodeAPIKey(blockchairNodeApiKey)

    if (vault) {
      this.vault = vault
    }

    if (phrase) {
      this.setPhrase(phrase)
      this.changeWallet(this.getWallet().connect(this.provider))
    }
  }

  purgeClient = (): void => {
    this.address = null
    this.vault = null
    this.wallet = null
  }

  setBlockchairNodeURL = (url: string): void => {
    this.blockchairNodeUrl = url
  }

  setBlockchairNodeAPIKey = (key: string): void => {
    this.blockchairNodeApiKey = key
  }

  /**
   * Getters
   */

  getNetwork = (): XChainNetwork => {
    return ethNetworkToXchains(this.network)
  }

  /**
   * @throws Error
   * Thrown if phrase has not been set before. A phrase is needed to create a wallet and to derive an address from it.
   */
  getAddress = (): Address => {
    if (!this.address) {
      throw new Error('Phrase must be provided')
    }
    return this.address
  }

  getVault = (): Address => {
    if (!this.vault) {
      throw new Error('Vault must be provided')
    }
    return this.vault
  }

  getWallet = (): ethers.Wallet => {
    if (!this.wallet) {
      throw new Error('Phrase must be provided')
    }
    return this.wallet
  }

  getProvider = (): Provider => {
    return this.provider
  }

  getEtherscanProvider = (): EtherscanProvider => {
    return this.etherscan
  }

  getExplorerUrl = (): string => {
    return this.getNetwork() === 'testnet' ? 'https://goerli.etherscan.io/' : 'https://etherscan.io/'
  }

  getExplorerAddressUrl = (address: Address): string => {
    return `${this.getExplorerUrl()}/address/${address}`
  }

  getExplorerTxUrl = (txID: string): string => {
    return `${this.getExplorerUrl()}/tx/${txID}`
  }

  /**
   * changes the wallet eg. when using connect() after init()
   */
  private changeWallet = (wallet: ethers.Wallet): ethers.Wallet => {
    this.wallet = wallet
    this.address = wallet.address
    return this.getWallet()
  }

  /**
   * Set's the current network
   */
  setNetwork = (network: XChainNetwork): void => {
    if (!network) {
      throw new Error('Network must be provided')
    } else {
      this.network = xchainNetworkToEths(network)
      this.provider = getDefaultProvider(this.network)
      this.etherscan = new EtherscanProvider(this.network)
    }
  }

  /**
   * Set's the current vault contract
   */
  setVault = (vault: string): string => {
    if (!vault) {
      throw new Error('Vault address must be provided')
    }

    return (this.vault = vault)
  }

  /**
   * Sets a new phrase (Eg. If user wants to change wallet)
   */
  setPhrase = (phrase: string): Address => {
    if (!Crypto.validatePhrase(phrase)) {
      throw new Error('Phrase must be provided')
    }

    this.changeWallet(ethers.Wallet.fromMnemonic(phrase))
    return this.getAddress()
  }

  /**
   * Validates an address
   */
  validateAddress = (address: Address): boolean => {
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
  getERC20Balance = async (assetAddress: Address, address?: Address): Promise<Balances> => {
    try {
      if (address && !this.validateAddress(address)) {
        return Promise.reject('Invalid Address')
      }
      if (!this.validateAddress(assetAddress)) {
        return Promise.reject('Invalid Asset')
      }

      const amount = await this.call<BigNumberish>(assetAddress, erc20ABI, 'balanceOf', [address || this.getAddress()])
      const decimal = await this.call<BigNumberish>(assetAddress, erc20ABI, 'decimals', [])
      const name = await this.call<string>(assetAddress, erc20ABI, 'name', [])
      const symbol = await this.call<string>(assetAddress, erc20ABI, 'symbol', [])
      return [
        {
          asset: assetFromString(`${name}.${symbol}`) || AssetETH,
          amount: baseAmount(formatEther(amount), decimal ? parseInt(decimal.toString()) : ETH_DECIMAL),
        },
      ]
    } catch (error) {
      return Promise.reject(error)
    }
  }

  /**
   * Gets the current block of the network
   */
  getBlockNumber = async (): Promise<number> => {
    return this.getWallet().provider.getBlockNumber()
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
  getTransactionCount = async (blocktag: string | number = 'latest', address?: Address): Promise<number> => {
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
      totalCount = dAddr[address].calls.length

      const dashboardAddress = await blockChair.getAddress(
        this.blockchairNodeUrl,
        address,
        this.blockchairNodeApiKey,
        limit,
        offset,
      )
      const txList = dashboardAddress[address].calls

      for (const call of txList) {
        const hash = call.transaction_hash
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

  transfer = async ({ memo, amount, recipient }: TxParams): Promise<TxHash> => {
    try {
      const { hash } = await (memo ? this.vaultTx(recipient, amount, memo) : this.normalTx({ recipient, amount }))
      return hash
    } catch (error) {
      return Promise.reject(error)
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  call = async <T>(address: Address, abi: ethers.ContractInterface, func: string, params: Array<any>): Promise<T> => {
    if (!address) {
      return Promise.reject(new Error('address must be provided'))
    }
    
    const contract = new ethers.Contract(address, abi, this.provider).connect(this.getWallet())
    return contract[func](...params)
  }

  /**
   * Sends a transaction to the vault
   */
  vaultTx = async (address: Address, amount: BaseAmount, memo: string): Promise<TransactionResponse> => {
    try {
      const txAmount = baseToAsset(amount).amount().toString()
      const vault = this.getVault()

      if (address === ethAddress) {
        return await this.call<TransactionResponse>(vault, vaultABI, 'deposit', [toUtf8String(memo), { value: amount }])
      }

      const allowance = await this.call<BigNumberish>(address, erc20ABI, 'allowance', [
        this.getAddress(),
        vault,
        { from: this.getWallet().address },
      ])
      if (formatEther(allowance) < txAmount) {
        const approved = await this.call<TransactionResponse>(address, erc20ABI, 'approve', [
          vault,
          txAmount,
          { from: this.getWallet().address },
        ])
        await approved.wait()
      }
      return await this.call<TransactionResponse>(vault, vaultABI, 'deposit', [address, txAmount, toUtf8String(memo)])
    } catch (error) {
      return Promise.reject(error)
    }
  }

  /**
   * Sends a transaction in ether
   */
  normalTx = async (params: NormalTxOpts): Promise<TransactionResponse> => {
    try {
      const { recipient, amount, overrides } = params
      const txAmount = baseToAsset(amount).amount().toString()
      const transactionRequest = Object.assign({ to: recipient, value: txAmount }, overrides || {})
      return await this.getWallet().sendTransaction(transactionRequest)
    } catch (error) {
      return Promise.reject(error)
    }
  }

  getFees = async (): Promise<Fees> => {
    return getGasOracle(this.etherscan.baseUrl, this.etherscan.apiKey).then(
      (response: GasOracleResponse): Fees => ({
        type: 'base',
        average: baseAmount(response.SafeGasPrice, ETH_DECIMAL),
        fast: baseAmount(response.ProposeGasPrice, ETH_DECIMAL),
        fastest: baseAmount(response.FastGasPrice, ETH_DECIMAL),
      }),
    )
  }

  getDefaultFees = (): Fees => {
    return {
      type: 'base',
      average: baseAmount(30, ETH_DECIMAL),
      fast: baseAmount(35, ETH_DECIMAL),
      fastest: baseAmount(39, ETH_DECIMAL),
    }
  }

  /**
   * Returns the estimate gas for a normal transaction
   * @param params NormalTxOpts  transaction options
   */
  estimateNormalTx = async (params: NormalTxOpts): Promise<BaseAmount> => {
    try {
      const { recipient, amount, overrides } = params
      const txAmount = baseToAsset(amount).amount().toString()
      const transactionRequest = Object.assign({ to: recipient, value: txAmount, gas: '5208' }, overrides || {})
      const estimate = await this.getWallet().provider.estimateGas(transactionRequest)

      return baseAmount(estimate.toString(), ETH_DECIMAL)
    } catch (error) {
      return Promise.reject(error)
    }
  }

  /**
   * Returns a promise with the gas estimate to the function call `transfer` of a contract
   * that follows the ERC20 interfaces
   **/
  estimateGasERC20Tx = async (params: EstimateGasERC20Opts): Promise<BaseAmount> => {
    try {
      const { erc20ContractAddress, recipient, amount } = params
      if (recipient && !this.validateAddress(recipient)) {
        return Promise.reject('Invalid Address')
      }
      if (!this.validateAddress(erc20ContractAddress)) {
        return Promise.reject('Invalid ERC20 Contract Address')
      }
      const contract = new ethers.Contract(erc20ContractAddress, erc20ABI, this.getWallet())
      const erc20 = contract.connect(this.getWallet())
      const estimate = await erc20.estimateGas.transfer(recipient, amount)

      return baseAmount(estimate.toString(), ETH_DECIMAL)
    } catch (error) {
      return Promise.reject(error)
    }
  }

  /**
   * Returns a promise with the `TransactionResponse` of the erc20 transfer
   */
  erc20Tx = async (params: Erc20TxOpts): Promise<TransactionResponse> => {
    try {
      const { erc20ContractAddress, recipient, amount, overrides } = params
      if (recipient && !this.validateAddress(recipient)) {
        return Promise.reject('Invalid Address')
      }
      if (!this.validateAddress(erc20ContractAddress)) {
        return Promise.reject('Invalid ERC20 Contract Address')
      }

      return await this.call<TransactionResponse>(erc20ContractAddress, erc20ABI, 'transfer', [
        recipient,
        amount,
        Object.assign({}, overrides || {}),
      ])
    } catch (error) {
      return Promise.reject(error)
    }
  }
}

export { Client }
