import { ethers, BigNumberish, BigNumber } from 'ethers'
import { Provider, TransactionResponse } from '@ethersproject/abstract-provider'
import { EtherscanProvider, getDefaultProvider } from '@ethersproject/providers'

import erc20ABI from '../data/erc20.json'
import { toUtf8Bytes, parseUnits } from 'ethers/lib/utils'
import {
  GasOracleResponse,
  Network as EthNetwork,
  ExplorerUrl,
  TxOverrides,
  GasPrices,
  GasLimits,
  FeesParams,
  GasLimitParams,
  GasLimitsParams,
  FeesWithGasPricesAndLimits,
} from './types'
import {
  Address,
  Network as XChainNetwork,
  Tx,
  TxsPage,
  XChainClient,
  XChainClientParams,
  TxParams,
  TxHash,
  Fees,
  TxHistoryParams,
  Balances,
  Network,
} from '@xchainjs/xchain-client'
import { AssetETH, baseAmount, BaseAmount, assetToString, Asset } from '@xchainjs/xchain-util'
import * as Crypto from '@xchainjs/xchain-crypto'
import * as etherscanAPI from './etherscan-api'
import {
  ETH_DECIMAL,
  ethNetworkToXchains,
  xchainNetworkToEths,
  getTokenAddress,
  validateAddress,
  SIMPLE_GAS_COST,
  BASE_TOKEN_GAS_COST,
  getFee,
  maxApproval,
  ethAddress,
} from './utils'

/**
 * Interface for custom Ethereum client
 */
export interface EthereumClient {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  call<T>(asset: Address, abi: ethers.ContractInterface, func: string, params: Array<any>): Promise<T>

  estimateGasLimit(params: GasLimitParams): Promise<BigNumber>
  estimateGasLimits(params: GasLimitsParams): Promise<GasLimits>
  estimateFeesWithGasPricesAndLimits(params: FeesParams): Promise<FeesWithGasPricesAndLimits>
  estimateFees(params: FeesParams): Promise<Fees>

  isApproved(spender: Address, sender: Address, amount: BaseAmount): Promise<boolean>
  approve(spender: Address, sender: Address, amount?: BaseAmount): Promise<TransactionResponse>
}

type ClientParams = XChainClientParams & {
  explorerUrl?: ExplorerUrl
  etherscanApiKey?: string
}

/**
 * Custom Ethereum client
 */
export default class Client implements XChainClient, EthereumClient {
  private network: EthNetwork
  private address: Address | null = null
  private wallet: ethers.Wallet | null = null
  private provider: Provider
  private etherscan: EtherscanProvider
  private explorerUrl: ExplorerUrl

  /**
   * Constructor
   * @param {ClientParams} params
   */
  constructor({ network = 'testnet', explorerUrl, phrase, etherscanApiKey }: ClientParams) {
    this.network = xchainNetworkToEths(network)
    this.provider = getDefaultProvider(this.network)
    this.etherscan = new EtherscanProvider(this.network, etherscanApiKey)
    this.explorerUrl = explorerUrl || this.getDefaultExplorerURL()

    if (phrase) {
      this.setPhrase(phrase)
      this.changeWallet(this.getWallet().connect(this.provider))
    }
  }

  /**
   * Purge client.
   *
   * @returns {void}
   */
  purgeClient = (): void => {
    this.address = null
    this.wallet = null
  }

  /**
   * Set/Update the explorer url.
   *
   * @param {string} url The explorer url.
   * @returns {void}
   */
  setExplorerURL = (url: ExplorerUrl): void => {
    this.explorerUrl = url
  }

  /**
   * Get the current network.
   *
   * @returns {Network} The current network. (`mainnet` or `testnet`)
   */
  getNetwork = (): XChainNetwork => {
    return ethNetworkToXchains(this.network)
  }

  /**
   * Get the current address.
   *
   * @returns {Address} The current address.
   *
   * @throws {"Phrase must be provided"}
   * Thrown if phrase has not been set before. A phrase is needed to create a wallet and to derive an address from it.
   */
  getAddress = (): Address => {
    if (!this.address) {
      throw new Error('Phrase must be provided')
    }
    return this.address
  }

  /**
   * Get etherjs wallet interface.
   *
   * @returns {Wallet} The current etherjs wallet interface.
   *
   * @throws {"Phrase must be provided"}
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
   * @returns {Provider} The current etherjs Provider interface.
   */
  getProvider = (): Provider => {
    return this.provider
  }

  /**
   * Get etherjs EtherscanProvider interface.
   *
   * @returns {EtherscanProvider} The current etherjs EtherscanProvider interface.
   */
  getEtherscanProvider = (): EtherscanProvider => {
    return this.etherscan
  }

  /**
   * Get the explorer url.
   *
   * @returns {string} The explorer url for ethereum based on the current network.
   */
  getExplorerUrl = (): string => {
    return this.getExplorerUrlByNetwork(this.getNetwork())
  }

  /**
   * Get the explorer url.
   *
   * @returns {ExplorerUrl} The explorer url (both mainnet and testnet) for ethereum.
   */
  private getDefaultExplorerURL = (): ExplorerUrl => {
    return {
      testnet: 'https://rinkeby.etherscan.io/',
      mainnet: 'https://etherscan.io/',
    }
  }

  /**
   * Get the explorer url.
   *
   * @param {Network} network
   * @returns {string} The explorer url for ethereum based on the network.
   */
  private getExplorerUrlByNetwork = (network: Network): string => {
    return this.explorerUrl[network]
  }

  /**
   * Get the explorer url for the given address.
   *
   * @param {Address} address
   * @returns {string} The explorer url for the given address.
   */
  getExplorerAddressUrl = (address: Address): string => {
    return `${this.getExplorerUrl()}/address/${address}`
  }

  /**
   * Get the explorer url for the given transaction id.
   *
   * @param {string} txID
   * @returns {string} The explorer url for the given transaction id.
   */
  getExplorerTxUrl = (txID: string): string => {
    return `${this.getExplorerUrl()}/tx/${txID}`
  }

  /**
   * Changes the wallet eg. when using connect() after init().
   *
   * @param {Wallet} wallet a new wallet
   * @returns {void}
   */
  private changeWallet = (wallet: ethers.Wallet): void => {
    this.wallet = wallet
    this.address = wallet.address.toLowerCase()
  }

  /**
   * Set/update the current network.
   *
   * @param {Network} network `mainnet` or `testnet`.
   * @returns {void}
   *
   * @throws {"Network must be provided"}
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
   * Set/update a new phrase (Eg. If user wants to change wallet)
   *
   * @param {string} phrase A new phrase.
   * @returns {Address} The address from the given phrase
   *
   * @throws {"Invalid phrase"}
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
   * @param {Address} address
   * @returns {boolean} `true` or `false`
   */
  validateAddress = (address: Address): boolean => {
    return validateAddress(address)
  }

  /**
   * Get the ETH balance of a given address.
   *
   * @param {Address} address By default, it will return the balance of the current wallet. (optional)
   * @returns {Array<Balances>} The all balance of the address.
   *
   * @throws {"Invalid asset"} throws when the give asset is an invalid one
   */
  getBalance = async (address?: Address, asset?: Asset): Promise<Balances> => {
    try {
      address = address || this.getAddress()

      if (asset && assetToString(asset) !== assetToString(AssetETH)) {
        // Handle token balances
        const assetAddress = getTokenAddress(asset)
        if (!assetAddress) {
          throw new Error('Invalid asset')
        }

        const balance = await etherscanAPI.getTokenBalance({
          baseUrl: this.etherscan.baseUrl,
          address,
          assetAddress,
          apiKey: this.etherscan.apiKey,
        })
        const decimals = await this.call<BigNumberish>(assetAddress, erc20ABI, 'decimals', [])
        return [
          {
            asset,
            amount: baseAmount(balance.toString(), BigNumber.from(decimals).toNumber() || ETH_DECIMAL),
          },
        ]
      } else {
        // Handle ETH balances
        const balance = await this.etherscan.getBalance(address)
        return [
          {
            asset: AssetETH,
            amount: baseAmount(balance.toString(), ETH_DECIMAL),
          },
        ]
      }
    } catch (error) {
      return Promise.reject(error)
    }
  }

  /**
   * Get transaction history of a given address with pagination options.
   * By default it will return the transaction history of the current wallet.
   *
   * @param {TxHistoryParams} params The options to get transaction history. (optional)
   * @returns {TxsPage} The transaction history.
   */
  getTransactions = async (params?: TxHistoryParams): Promise<TxsPage> => {
    try {
      const address = params?.address || this.getAddress()
      const page = params?.offset || 1
      const offset = params?.limit
      const assetAddress = params?.asset

      let transations
      if (assetAddress) {
        transations = await etherscanAPI.getTokenTransactionHistory({
          baseUrl: this.etherscan.baseUrl,
          address,
          assetAddress,
          page,
          offset,
          apiKey: this.etherscan.apiKey,
        })
      } else {
        transations = await etherscanAPI.getETHTransactionHistory({
          baseUrl: this.etherscan.baseUrl,
          address,
          page,
          offset,
          apiKey: this.etherscan.apiKey,
        })
      }

      return {
        total: transations.length,
        txs: transations,
      }
    } catch (error) {
      return Promise.reject(error)
    }
  }

  /**
   * Get the transaction details of a given transaction id.
   *
   * @param {string} txId The transaction id.
   * @param {string} assetAddress The asset address. (optional)
   * @returns {Tx} The transaction details of the given transaction id.
   *
   * @throws {"Need to provide valid txId"}
   * Thrown if the given txId is invalid.
   */
  getTransactionData = async (txId: string, assetAddress?: string): Promise<Tx> => {
    try {
      let tx
      const txInfo = await this.etherscan.getTransaction(txId)

      if (txInfo) {
        if (assetAddress) {
          tx =
            (
              await etherscanAPI.getTokenTransactionHistory({
                baseUrl: this.etherscan.baseUrl,
                assetAddress,
                startblock: txInfo.blockNumber,
                endblock: txInfo.blockNumber,
                apiKey: this.etherscan.apiKey,
              })
            ).find((info) => info.hash === txId) ?? null
        } else {
          tx =
            (
              await etherscanAPI.getETHTransactionHistory({
                baseUrl: this.etherscan.baseUrl,
                startblock: txInfo.blockNumber,
                endblock: txInfo.blockNumber,
                apiKey: this.etherscan.apiKey,
              })
            ).find((info) => info.hash === txId) ?? null
        }
      }

      if (!tx) {
        throw new Error('Need to provide valid txId')
      }

      return tx
    } catch (error) {
      return Promise.reject(error)
    }
  }

  /**
   * Call a contract function.
   * @template T The result interface.
   * @param {Address} address The contract address.
   * @param {ContractInterface} abi The contract ABI json.
   * @param {string} func The function to be called.
   * @param {Array<any>} params The parameters of the function.
   * @returns {T} The result of the contract function call.
   *
   * @throws {"address must be provided"}
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
   * Check allowance.
   *
   * @param {Address} spender The spender address.
   * @param {Address} sender The sender address.
   * @param {BaseAmount} amount The amount of token.
   * @returns {boolean} `true` or `false`.
   */
  isApproved = async (spender: Address, sender: Address, amount: BaseAmount): Promise<boolean> => {
    try {
      const txAmount = BigNumber.from(amount.amount().toString())
      const allowance = await this.call<BigNumberish>(sender, erc20ABI, 'allowance', [this.getAddress(), spender])
      return txAmount.lte(allowance)
    } catch (error) {
      return Promise.reject(error)
    }
  }

  /**
   * Check allowance.
   *
   * @param {Address} spender The spender address.
   * @param {Address} sender The sender address.
   * @param {BaseAmount} amount The amount of token. By default, it will be unlimited token allowance. (optional)
   * @returns {TransactionResponse} The transaction result.
   */
  approve = async (spender: Address, sender: Address, amount?: BaseAmount): Promise<TransactionResponse> => {
    try {
      const txAmount = amount ? BigNumber.from(amount.amount().toString()) : maxApproval
      const txResult = await this.call<TransactionResponse>(sender, erc20ABI, 'approve', [
        spender,
        txAmount,
        { from: this.getAddress() },
      ])

      return txResult
    } catch (error) {
      return Promise.reject(error)
    }
  }

  /**
   * Transfer ETH.
   *
   * @param {TxParams} params The transfer options.
   * @returns {TxHash} The transaction hash.
   *
   * @throws {"Invalid asset address"}
   * Thrown if the given asset is invalid.
   */
  transfer = async ({
    asset,
    memo,
    amount,
    recipient,
    gasPrice,
    gasLimit,
  }: TxParams & {
    gasPrice?: BaseAmount
    gasLimit?: BigNumber
  }): Promise<TxHash> => {
    try {
      const txAmount = BigNumber.from(amount.amount().toString())

      let assetAddress
      if (asset && assetToString(asset) !== assetToString(AssetETH)) {
        assetAddress = getTokenAddress(asset)
      }

      let txResult

      if (assetAddress && assetAddress !== ethAddress) {
        const overrides: TxOverrides | undefined = (gasLimit || gasPrice) && {
          gasLimit: gasLimit || BigNumber.from(BASE_TOKEN_GAS_COST),
          gasPrice: gasPrice && BigNumber.from(gasPrice.amount().toString()),
        }

        // Transfer ERC20
        txResult = await this.call<TransactionResponse>(assetAddress, erc20ABI, 'transfer', [
          recipient,
          txAmount,
          Object.assign({}, overrides ?? {}),
        ])
      } else {
        const overrides: TxOverrides | undefined = (gasLimit || gasPrice) && {
          gasLimit: gasLimit || BigNumber.from(SIMPLE_GAS_COST),
          gasPrice: gasPrice && BigNumber.from(gasPrice.amount().toString()),
        }

        // Transfer ETH
        const transactionRequest = Object.assign(
          { to: recipient, value: txAmount },
          {
            ...(overrides ?? {}),
            data: memo ? toUtf8Bytes(memo) : undefined,
          },
        )

        txResult = await this.getWallet().sendTransaction(transactionRequest)
      }

      return txResult.hash
    } catch (error) {
      return Promise.reject(error)
    }
  }

  /**
   * Estimate gas price.
   * @see https://etherscan.io/apis#gastracker
   *
   * @returns {GasPrices} The gas prices (average, fast, fastest).
   *
   * @throws {"Failed to estimate gas price"} Thrown if failed to estimate gas price.
   */
  estimateGasPrices = async (): Promise<GasPrices> => {
    try {
      const response: GasOracleResponse = await etherscanAPI.getGasOracle(this.etherscan.baseUrl, this.etherscan.apiKey)

      return {
        average: baseAmount(parseUnits(response.SafeGasPrice, 'gwei').toString(), ETH_DECIMAL),
        fast: baseAmount(parseUnits(response.ProposeGasPrice, 'gwei').toString(), ETH_DECIMAL),
        fastest: baseAmount(parseUnits(response.FastGasPrice, 'gwei').toString(), ETH_DECIMAL),
      }
    } catch (error) {
      return Promise.reject(new Error(`Failed to estimate gas price: ${error.msg ?? error.toString()}`))
    }
  }

  /**
   * Estimate gas.
   *
   * @param {EstimateGasOpts} params The transaction options.
   * @returns {BaseAmount} The estimated gas fee.
   *
   * @throws {"Failed to estimate gas limit"} Thrown if failed to estimate gas limit.
   */
  estimateGasLimit = async ({ asset, sender, recipient, amount, gasPrice }: GasLimitParams): Promise<BigNumber> => {
    try {
      sender = sender || this.getAddress()
      const txAmount = BigNumber.from(amount.amount().toString())
      const gasPriceBN = BigNumber.from(gasPrice.amount().toString())

      let assetAddress
      if (asset && assetToString(asset) !== assetToString(AssetETH)) {
        assetAddress = getTokenAddress(asset)
      }

      let estimate

      if (assetAddress && assetAddress !== ethAddress) {
        // ERC20 gas estimate
        const contract = new ethers.Contract(assetAddress, erc20ABI, this.provider)

        estimate = await contract.estimateGas.transfer(recipient, txAmount, { from: sender, gasPrice: gasPriceBN })
      } else {
        // ETH gas estimate
        const transactionRequest = {
          from: sender,
          to: recipient,
          value: txAmount,
          gasPrice: gasPriceBN,
        }

        estimate = await this.provider.estimateGas(transactionRequest)
      }

      return estimate
    } catch (error) {
      return Promise.reject(new Error(`Failed to estimate gas limit: ${error.msg ?? error.toString()}`))
    }
  }

  /**
   * Estimate gas limits (average, fast fastest).
   *
   * @param {GasLimitsParams} params
   * @returns {GasLimits} The estimated gas limits.
   */
  estimateGasLimits = async (params: GasLimitsParams): Promise<GasLimits> => {
    const { gasPrices, ...otherParams } = params
    const { fast, fastest, average } = gasPrices
    return Promise.all([
      this.estimateGasLimit({ ...otherParams, gasPrice: fast }),
      this.estimateGasLimit({ ...otherParams, gasPrice: fastest }),
      this.estimateGasLimit({ ...otherParams, gasPrice: average }),
    ]).then(([fast, fastest, average]) => ({
      average,
      fast,
      fastest,
    }))
  }

  /**
   * Estimate gas prices/limits (average, fast fastest).
   *
   * @param {FeesParams} params
   * @returns {FeesWithGasPricesAndLimits} The estimated gas prices/limits.
   */
  estimateFeesWithGasPricesAndLimits = async (params: FeesParams): Promise<FeesWithGasPricesAndLimits> => {
    // gas prices
    const gasPrices = await this.estimateGasPrices()
    const { fast: fastGP, fastest: fastestGP, average: averageGP } = gasPrices

    // gas limits
    const gasLimits = await this.estimateGasLimits({
      asset: params.asset,
      amount: params.amount,
      recipient: params.recipient,
      sender: params.sender,
      gasPrices,
    })
    const { fast: fastGL, fastest: fastestGL, average: averageGL } = gasLimits

    return {
      gasPrices,
      gasLimits,
      fees: {
        type: 'byte',
        average: getFee({ gasPrice: averageGP, gasLimit: averageGL }),
        fast: getFee({ gasPrice: fastGP, gasLimit: fastGL }),
        fastest: getFee({ gasPrice: fastestGP, gasLimit: fastestGL }),
      },
    }
  }

  /**
   * Get fees.
   *
   * @param {FeesParams} params
   * @returns {Fees} The average/fast/fastest fees.
   */
  estimateFees = async (params: FeesParams): Promise<Fees> => {
    const { fees } = await this.estimateFeesWithGasPricesAndLimits(params)
    return fees
  }

  /**
   * Get fees.
   * @deprecated
   */
  getFees = async (): Promise<Fees> => {
    return Promise.reject('`getFees` is not available in `xchain-etereum`, use `estimateFees` instead')
  }
}

export { Client }
