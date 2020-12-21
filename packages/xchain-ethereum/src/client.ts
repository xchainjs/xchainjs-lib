import { ethers, BigNumberish } from 'ethers'
import { Provider, TransactionResponse } from '@ethersproject/abstract-provider'
import { EtherscanProvider, getDefaultProvider } from '@ethersproject/providers'

import vaultABI from '../data/vault.json'
import erc20ABI from '../data/erc20.json'
import { formatEther, parseEther } from 'ethers/lib/utils'
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
import { ethNetworkToXchains, xchainNetworkToEths, ETH_DECIMAL } from './utils'
import { getGasOracle } from './etherscan-api'

const ethAddress = '0x0000000000000000000000000000000000000000'

/**
 * Interface for custom Ethereum client
 */
export interface EthereumClient {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  call<T>(asset: Address, abi: ethers.ContractInterface, func: string, params: Array<any>): Promise<T>
  vaultTx(asset: string, amount: BaseAmount, memo: string): Promise<TransactionResponse>
  normalTx(opts: NormalTxOpts): Promise<TransactionResponse>
  erc20Tx(opts: Erc20TxOpts): Promise<TransactionResponse>

  estimateNormalTx(params: NormalTxOpts): Promise<BaseAmount>
  estimateGasERC20Tx(params: EstimateGasERC20Opts): Promise<BaseAmount>
}

type ClientParams = XChainClientParams & {
  blockchairUrl?: string
  blockchairNodeApiKey?: string
  etherscanApiKey?: string
  vault?: string
}

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

  /**
   * Purge client.
   */
  purgeClient = (): void => {
    this.address = null
    this.vault = null
    this.wallet = null
  }

  /**
   * Set/Update the blockchair url.
   *
   * @param url The new blockchair url.
   * @returns void
   */
  setBlockchairNodeURL = (url: string): void => {
    this.blockchairNodeUrl = url
  }

  /**
   * Set/Update the blockchair api key.
   * @returns void
   *
   * @param key The new blockchair api key.
   */
  setBlockchairNodeAPIKey = (key: string): void => {
    this.blockchairNodeApiKey = key
  }

  /**
   * Get the current network.
   *
   * @returns (XChainNetwork) The current network. (`mainnet` or `testnet`)
   */
  getNetwork = (): XChainNetwork => {
    return ethNetworkToXchains(this.network)
  }

  /**
   * Get the current address.
   *
   * @returns (Address) The current address.
   *
   * @throws Error
   * Thrown if phrase has not been set before. A phrase is needed to create a wallet and to derive an address from it.
   */
  getAddress = (): Address => {
    if (!this.address) {
      throw new Error('Phrase must be provided')
    }
    return this.address
  }

  /**
   * Get the vault address.
   *
   * @returns (Address) The current vault address.
   *
   * @throws Error
   * Thrown if vault has not been set before. A vault is needed to send a vault transaction.
   */
  getVault = (): Address => {
    if (!this.vault) {
      throw new Error('Vault must be provided')
    }
    return this.vault
  }

  /**
   * Get etherjs wallet interface.
   *
   * @returns (ethers.Wallet) The current etherjs wallet interface.
   *
   * @throws Error
   * Thrown if phrase has not been set before. A phrase is needed to create a wallet and to derive an address from it.
   */
  getWallet = (): ethers.Wallet => {
    if (!this.wallet) {
      throw new Error('Phrase must be provided')
    }
    return this.wallet
  }

  /**
   * Get etherjs Provider interface.
   *
   * @returns (Provider) The current etherjs Provider interface.
   */
  getProvider = (): Provider => {
    return this.provider
  }

  /**
   * Get etherjs EtherscanProvider interface.
   *
   * @returns (EtherscanProvider) The current etherjs EtherscanProvider interface.
   */
  getEtherscanProvider = (): EtherscanProvider => {
    return this.etherscan
  }

  /**
   * Get the explorer url.
   *
   * @returns (string) The explorer url.
   */
  getExplorerUrl = (): string => {
    return this.getNetwork() === 'testnet' ? 'https://goerli.etherscan.io/' : 'https://etherscan.io/'
  }

  /**
   * Get the explorer url for the given address.
   *
   * @param address.
   * @returns (string) The explorer url for the given address.
   */
  getExplorerAddressUrl = (address: Address): string => {
    return `${this.getExplorerUrl()}/address/${address}`
  }

  /**
   * Get the explorer url for the given transaction id.
   *
   * @param txID
   * @returns (string) The explorer url for the given transaction id.
   */
  getExplorerTxUrl = (txID: string): string => {
    return `${this.getExplorerUrl()}/tx/${txID}`
  }

  /**
   * Changes the wallet eg. when using connect() after init().
   *
   * @param wallet a new wallet
   * @returns void
   */
  private changeWallet = (wallet: ethers.Wallet): void => {
    this.wallet = wallet
    this.address = wallet.address.toLowerCase()
  }

  /**
   * Set/update the current network.
   *
   * @param network `mainnet` or `testnet`.
   * @returns void
   *
   * @throws Error
   * Thrown if network has not been set before.
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
   * Set/update the current vault address.
   *
   * @param vault A new vault address.
   * @returns void
   *
   * @throws Error
   * Thrown if the given vault address is empty.
   */
  setVault = (vault: string): void => {
    if (!vault) {
      throw new Error('Vault address must be provided')
    }

    this.vault = vault
  }

  /**
   * Set/update a new phrase (Eg. If user wants to change wallet)
   *
   * @param phrase A new phrase.
   * @returns (Address) The address from the given phrase
   *
   * @throws Error
   * Thrown if the given phase is invalid.
   */
  setPhrase = (phrase: string): Address => {
    if (!Crypto.validatePhrase(phrase)) {
      throw new Error('Invalid phrase')
    }

    this.changeWallet(ethers.Wallet.fromMnemonic(phrase))
    return this.getAddress()
  }

  /**
   * Validate the given address.
   *
   * @param address
   * @returns (boolean) `true` or `false`
   */
  validateAddress = (address: Address): boolean => {
    try {
      ethers.utils.getAddress(address)
      return true
    } catch (error) {
      return false
    }
  }

  /**
   * Get the ETH balance of a given address.
   * By default, it will return the balance of the current wallet.
   *
   * @param address (optional)
   * @returns (Balance[]) The ETH balance of the address.
   */
  getBalance = async (address?: string): Promise<Balance[]> => {
    try {
      address = address || this.getAddress()
      const dashboardAddress = await blockChair.getAddress(this.blockchairNodeUrl, address, this.blockchairNodeApiKey)
      return [
        {
          asset: AssetETH,
          amount: baseAmount(dashboardAddress[address].address.balance || 0, ETH_DECIMAL),
        },
      ]
    } catch (error) {
      return Promise.reject(new Error('Invalid address'))
    }
  }

  /**
   * Gets the erc20 asset balance of a given address.
   * By default it will return the balance of the current wallet.
   *
   * @param assetAddress The erc20 asset address.
   * @param address (optional)
   * @returns (Balances) The ETH balance of the address.
   *
   * @throws {Invalid Address}
   * Thrown if address is invalid.
   * @throws {Invalid Asset Address}
   * Thrown if asset address is invalid.
   */
  getERC20Balance = async (assetAddress: Address, address?: Address): Promise<Balances> => {
    try {
      if (address && !this.validateAddress(address)) {
        return Promise.reject('Invalid Address')
      }
      if (!this.validateAddress(assetAddress)) {
        return Promise.reject('Invalid Asset Address')
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
   * Get transaction history of a given address with pagination options.
   * By default it will return the transaction history of the current wallet.
   *
   * @param params (optional) The options to get transaction history.
   * @returns (TxsPage) The transaction history.
   */
  getTransactions = async (params?: TxHistoryParams): Promise<TxsPage> => {
    try {
      const address = params?.address || this.getAddress()
      const limit = params?.limit || 10
      const offset = params?.offset || 0

      const dAddr = await blockChair.getAddress(this.blockchairNodeUrl, address, this.blockchairNodeApiKey)
      const totalCount = dAddr[address].calls.length

      const dashboardAddress = await blockChair.getAddress(
        this.blockchairNodeUrl,
        address,
        this.blockchairNodeApiKey,
        limit,
        offset,
      )

      const transactions: Tx[] = []
      for (const call of dashboardAddress[address].calls) {
        transactions.push(await this.getTransactionData(call.transaction_hash))
      }

      return {
        total: totalCount,
        txs: transactions,
      }
    } catch (error) {
      return Promise.reject(error)
    }
  }

  /**
   * Get the transaction details of a given transaction id.
   *
   * @param txId The transaction id.
   * @returns (Tx) The transaction details of the given transaction id.
   */
  getTransactionData = async (txId: string): Promise<Tx> => {
    try {
      const tx = (await blockChair.getTx(this.blockchairNodeUrl, txId, true, this.blockchairNodeApiKey))[txId]
      const transaction = tx.transaction
      const erc_20 = tx.layer_2?.erc_20

      if (erc_20 && erc_20.length > 0) {
        return {
          asset: assetFromString(`${AssetETH.chain}.${erc_20[0].token_symbol}`) || AssetETH,
          from: erc_20.map((item) => {
            return {
              from: item.sender,
              amount: baseAmount(item.value, item.token_decimals),
            }
          }),
          to: erc_20.map((item) => {
            return {
              to: item.recipient,
              amount: baseAmount(item.value, item.token_decimals),
            }
          }),
          date: new Date(`${transaction.time} UTC`), //blockchair api doesn't append UTC so need to put that manually
          type: 'transfer',
          hash: transaction.hash,
        }
      } else {
        return {
          asset: AssetETH,
          from: [
            {
              from: transaction.sender,
              amount: baseAmount(transaction.value, ETH_DECIMAL),
            },
          ],
          to: [
            {
              to: transaction.recipient,
              amount: baseAmount(transaction.value, ETH_DECIMAL),
            },
          ],
          date: new Date(`${transaction.time} UTC`), //blockchair api doesn't append UTC so need to put that manually
          type: 'transfer',
          hash: transaction.hash,
        }
      }
    } catch (error) {
      return Promise.reject(error)
    }
  }

  /**
   * Transfer ETH.
   *
   * @param params The transfer options.
   * @returns (TxHash) The transaction hash.
   */
  transfer = async ({ memo, amount, recipient }: TxParams): Promise<TxHash> => {
    try {
      const { hash } = await (memo ? this.vaultTx(recipient, amount, memo) : this.normalTx({ recipient, amount }))
      return hash
    } catch (error) {
      return Promise.reject(error)
    }
  }

  /**
   * Call a contract function.
   *
   * @param address The contract address.
   * @param abi The contract ABI json.
   * @param func The function to be called.
   * @param params The parameters of the function.
   * @returns The result of the contract function call.
   *
   * @throws Error
   * Thrown if the given contract address is empty.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  call = async <T>(address: Address, abi: ethers.ContractInterface, func: string, params: Array<any>): Promise<T> => {
    if (!address) {
      return Promise.reject(new Error('address must be provided'))
    }

    const contract = new ethers.Contract(address, abi, this.provider).connect(this.getWallet())
    return contract[func](...params)
  }

  /**
   * Send a transaction to the vault.
   *
   * @param address The contract address.
   * @param amount The amount to be transferred.
   * @param memo The memo to be set.
   * @returns (TransactionResponse)  The vault transaction result.
   */
  vaultTx = async (address: Address, amount: BaseAmount, memo: string): Promise<TransactionResponse> => {
    try {
      const txAmount = baseToAsset(amount).amount().toFormat()
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
   * Send ETH transaction.
   *
   * @param params The ETH transaction options.
   * @returns (TransactionResponse) The transaction result.
   */
  normalTx = async (params: NormalTxOpts): Promise<TransactionResponse> => {
    try {
      const { recipient, amount, overrides } = params
      const txAmount = baseToAsset(amount).amount().toFormat()
      const transactionRequest = Object.assign({ to: recipient, value: parseEther(txAmount) }, overrides || {})
      return await this.getWallet().sendTransaction(transactionRequest)
    } catch (error) {
      return Promise.reject(error)
    }
  }

  /**
   * Get the current gas price.
   *
   * @returns (Fees) The current gas price.
   */
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

  /**
   * Get the default gas price.
   *
   * @returns (Fees) The default gas price.
   */
  getDefaultFees = (): Fees => {
    return {
      type: 'base',
      average: baseAmount(30, ETH_DECIMAL),
      fast: baseAmount(35, ETH_DECIMAL),
      fastest: baseAmount(39, ETH_DECIMAL),
    }
  }

  /**
   * Estimate gas for ETH transfer.
   *
   * @param params The ETH transaction options.
   * @returns (BaseAmount) The estimated gas fee.
   */
  estimateNormalTx = async (params: NormalTxOpts): Promise<BaseAmount> => {
    try {
      const { recipient, amount, overrides } = params
      const txAmount = baseToAsset(amount).amount().toFormat()
      const transactionRequest = Object.assign({ to: recipient, value: txAmount, gas: '5208' }, overrides || {})
      const estimate = await this.getWallet().provider.estimateGas(transactionRequest)

      return baseAmount(estimate.toString(), ETH_DECIMAL)
    } catch (error) {
      return Promise.reject(error)
    }
  }

  /**
   * Estimate gas for erc20 token transfer.
   *
   * @param params The erc20 transaction options.
   * @returns (BaseAmount) The estimated gas fee.
   *
   * @throws {Invalid Address}
   * Thrown if the given address is invalid.
   * @throws {Invalid Asset Address}
   * Thrown if the given asset address is invalid.
   **/
  estimateGasERC20Tx = async ({ assetAddress, recipient, amount }: EstimateGasERC20Opts): Promise<BaseAmount> => {
    try {
      if (recipient && !this.validateAddress(recipient)) {
        return Promise.reject('Invalid Address')
      }
      if (!this.validateAddress(assetAddress)) {
        return Promise.reject('Invalid Asset Address')
      }
      const contract = new ethers.Contract(assetAddress, erc20ABI, this.getWallet())
      const erc20 = contract.connect(this.getWallet())
      const estimate = await erc20.estimateGas.transfer(recipient, amount)

      return baseAmount(estimate.toString(), ETH_DECIMAL)
    } catch (error) {
      return Promise.reject(error)
    }
  }

  /**
   * Transfer erc20 tokens.
   *
   * @param params The erc20 transaction options.
   * @returns (TransactionResponse) The transaction result.
   *
   * @throws {Invalid Address}
   * Thrown if the given address is invalid.
   * @throws {Invalid Asset Address}
   * Thrown if the given asset address is invalid.
   */
  erc20Tx = async ({ assetAddress, recipient, amount, overrides }: Erc20TxOpts): Promise<TransactionResponse> => {
    try {
      if (recipient && !this.validateAddress(recipient)) {
        return Promise.reject('Invalid Address')
      }
      if (!this.validateAddress(assetAddress)) {
        return Promise.reject('Invalid Asset Address')
      }

      return await this.call<TransactionResponse>(assetAddress, erc20ABI, 'transfer', [
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
