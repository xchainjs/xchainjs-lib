import { ethers, BigNumberish, BigNumber } from 'ethers'
import { Provider, TransactionResponse } from '@ethersproject/abstract-provider'
import { EtherscanProvider, getDefaultProvider } from '@ethersproject/providers'

import erc20ABI from '../data/erc20.json'
import { parseEther, toUtf8Bytes } from 'ethers/lib/utils'
import { GasOracleResponse, Network as EthNetwork, ClientUrl, ExplorerUrl, EstimateGasOpts } from './types'
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
  Txs,
  Network,
} from '@xchainjs/xchain-client'
import {
  AssetETH,
  baseAmount,
  baseToAsset,
  BaseAmount,
  assetFromString,
  assetAmount,
  assetToBase,
  assetToString,
  ETHChain,
} from '@xchainjs/xchain-util'
import * as Crypto from '@xchainjs/xchain-crypto'
import * as ethplorerAPI from './ethplorer-api'
import {
  ethNetworkToXchains,
  xchainNetworkToEths,
  ETH_DECIMAL,
  getTxFromOperation,
  getTxFromEthTransaction,
  DEFAULT_GASLIMIT,
  getTokenAddress,
  validateAddress,
  validateSymbol,
  ETHPLORER_FREEKEY,
} from './utils'
import { getGasOracle } from './etherscan-api'

const ethAddress = '0x0000000000000000000000000000000000000000'
const maxApproval = BigNumber.from(2).pow(256).sub(1)

/**
 * Interface for custom Ethereum client
 */
export interface EthereumClient {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  call<T>(asset: Address, abi: ethers.ContractInterface, func: string, params: Array<any>): Promise<T>

  estimateGas(params: EstimateGasOpts): Promise<BaseAmount>
}

type ClientParams = XChainClientParams & {
  ethplorerUrl?: ClientUrl
  ethplorerApiKey?: string
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
  private ethplorerUrl: ClientUrl
  private ethplorerApiKey = ''
  private explorerUrl: ExplorerUrl

  /**
   * Constructor
   * @param {ClientParams} params
   */
  constructor({
    network = 'testnet',
    ethplorerUrl,
    ethplorerApiKey,
    explorerUrl,
    phrase,
    etherscanApiKey,
  }: ClientParams) {
    this.network = xchainNetworkToEths(network)
    this.provider = getDefaultProvider(this.network)
    this.etherscan = new EtherscanProvider(this.network, etherscanApiKey)
    this.ethplorerUrl = ethplorerUrl || this.getDefaultEthplorerURL()
    this.explorerUrl = explorerUrl || this.getDefaultExplorerURL()
    this.ethplorerApiKey = ethplorerApiKey || ETHPLORER_FREEKEY

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
   * Set/Update the ethplorer url.
   *
   * @param {string} url The new ethplorer url.
   * @returns {void}
   */
  setEthplorerURL = (url: ClientUrl): void => {
    this.ethplorerUrl = url
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
   * Get the ethplorer API url.
   *
   * @returns {string} The ethplorer API url for thorchain based on the current network.
   */
  getEthplorerUrl = (): string => {
    return this.getEthplorerUrlByNetwork(this.getNetwork())
  }

  /**
   * Get the ethplorer API url.
   *
   * @returns {ClientUrl} The ethplorer API url (both mainnet and testnet) for ethereum.
   */
  private getDefaultEthplorerURL = (): ClientUrl => {
    return {
      testnet: 'https://kovan-api.ethplorer.io',
      mainnet: 'https://api.ethplorer.io',
    }
  }

  /**
   * Get the ethplorer API url.
   *
   * @param {Network} network
   * @returns {string} The ethplorer API url for ethereum based on the network.
   */
  private getEthplorerUrlByNetwork = (network: Network): string => {
    return this.ethplorerUrl[network]
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
      testnet: 'https://kovan.etherscan.io/',
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
   * @returns {Array<ETHBalance>} The all balance of the address.
   */
  getBalance = async (address?: Address): Promise<Balances> => {
    try {
      if (!this.ethplorerApiKey) {
        return Promise.reject(new Error('Missing API Key for Ethplorer'))
      }
      address = address || this.getAddress()
      const account = await ethplorerAPI.getAddress(this.getEthplorerUrl(), address, this.ethplorerApiKey)
      const balances: Balances = [
        {
          asset: AssetETH,
          amount: assetToBase(assetAmount(account.ETH.balance, ETH_DECIMAL)),
        },
      ]

      if (account.tokens) {
        account.tokens.forEach((token) => {
          const decimals = parseInt(token.tokenInfo.decimals)
          const { symbol, address: tokenAddress } = token.tokenInfo
          if (validateSymbol(symbol) && this.validateAddress(tokenAddress)) {
            const tokenAsset = assetFromString(`${ETHChain}.${symbol}-${tokenAddress}`)
            if (tokenAsset) {
              balances.push({
                asset: tokenAsset,
                amount: baseAmount(token.balance, decimals),
              })
            }
          }
        })
      }

      return balances
    } catch (error) {
      return Promise.reject(new Error('Invalid address'))
    }
  }

  /**
   * Get transaction history of a given address with pagination options.
   * By default it will return the transaction history of the current wallet.
   *
   * @param {TxHistoryParams} params The options to get transaction history. (optional)
   * @returns {TxsPage} The transaction history.
   *
   * @throws {"Need to provide ethplorer API key for token transactions"}
   * Thrown if the ethplorer API key is not provided.
   */
  getTransactions = async (params?: TxHistoryParams): Promise<TxsPage> => {
    try {
      const address = params?.address || this.getAddress()
      const limit = params?.limit || 10
      const startTime = params?.startTime
      const assetAddress = params?.asset

      if (assetAddress && !this.ethplorerApiKey) {
        throw new Error('Need to provide ethplorer API key for token transactions')
      }

      if (assetAddress) {
        const tokenTransactions = await ethplorerAPI.getAddressHistory(
          this.getEthplorerUrl(),
          address,
          assetAddress,
          limit,
          startTime && startTime.getTime() / 1000,
          this.ethplorerApiKey,
        )
        return {
          total: tokenTransactions.length,
          txs: tokenTransactions.reduce((acc, cur) => {
            const tx = getTxFromOperation(cur)
            return tx ? [...acc, tx] : acc
          }, [] as Txs),
        }
      } else {
        const ethTransactions = await ethplorerAPI.getAddressTransactions(
          this.getEthplorerUrl(),
          address,
          limit,
          startTime && startTime.getTime() / 1000,
          this.ethplorerApiKey,
        )

        return {
          total: ethTransactions.length,
          txs: ethTransactions.map(getTxFromEthTransaction),
        }
      }
    } catch (error) {
      return Promise.reject(error)
    }
  }

  /**
   * Get the transaction details of a given transaction id.
   *
   * @param {string} txId The transaction id.
   * @returns {Tx} The transaction details of the given transaction id.
   *
   * @throws {"Need to provide valid txId"}
   * Thrown if the given txId is invalid.
   */
  getTransactionData = async (txId: string): Promise<Tx> => {
    try {
      const txInfo = await ethplorerAPI.getTxInfo(this.getEthplorerUrl(), txId, this.ethplorerApiKey)

      if (txInfo.operations && txInfo.operations.length > 0) {
        const tx = getTxFromOperation(txInfo.operations[0])
        if (!tx) {
          throw new Error('Need to provide valid txId')
        }

        return tx
      } else {
        return getTxFromEthTransaction(txInfo)
      }
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
  private isApproved = async (spender: Address, sender: Address, amount: BaseAmount): Promise<boolean> => {
    try {
      const txAmount = parseEther(baseToAsset(amount).amount().toFormat())
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
  private approve = async (spender: Address, sender: Address, amount?: BaseAmount): Promise<TxHash> => {
    try {
      const txAmount = amount ? parseEther(baseToAsset(amount).amount().toFormat()) : maxApproval
      const txResult = await this.call<TransactionResponse>(sender, erc20ABI, 'approve', [
        spender,
        txAmount,
        { from: this.getWallet().address },
      ])
      return txResult.hash
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
    gasLimit,
    gasPrice,
  }: TxParams & {
    gasPrice?: BaseAmount
    gasLimit?: number
  }): Promise<TxHash> => {
    try {
      const overrides = {
        gasLimit: gasLimit || DEFAULT_GASLIMIT,
        gasPrice: gasPrice && parseEther(baseToAsset(gasPrice).amount().toFormat()),
      }
      const txAmount = parseEther(baseToAsset(amount).amount().toFormat())

      let assetAddress
      if (asset && assetToString(asset) !== assetToString(AssetETH)) {
        assetAddress = getTokenAddress(asset)
      }

      let txResult

      if (assetAddress && assetAddress !== ethAddress) {
        // Transfer ERC20
        if (!(await this.isApproved(recipient, assetAddress, amount))) {
          await this.approve(recipient, assetAddress)
        }

        txResult = await this.call<TransactionResponse>(assetAddress, erc20ABI, 'transfer', [
          recipient,
          txAmount,
          Object.assign({}, overrides),
        ])
      } else {
        // Transfer ETH
        const transactionRequest = Object.assign(
          { to: recipient, value: txAmount },
          {
            ...overrides,
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
   * Get the current gas price.
   *
   * @returns {Fees} The current gas price.
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
   * Estimate gas.
   *
   * @param {EstimateGasOpts} params The transaction options.
   * @returns {BaseAmount} The estimated gas fee.
   */
  estimateGas = async ({ asset, recipient, amount, overrides }: EstimateGasOpts): Promise<BaseAmount> => {
    try {
      const txAmount = parseEther(baseToAsset(amount).amount().toFormat())

      let assetAddress
      if (asset && assetToString(asset) !== assetToString(AssetETH)) {
        assetAddress = getTokenAddress(asset)
      }

      let estimate

      if (assetAddress && assetAddress !== ethAddress) {
        // ERC20 gas estimate
        const contract = new ethers.Contract(assetAddress, erc20ABI, this.getWallet())
        const erc20 = contract.connect(this.getWallet())

        estimate = await erc20.estimateGas.transfer(recipient, txAmount, Object.assign({}, overrides || {}))
      } else {
        // ETH gas estimate
        const transactionRequest = Object.assign({ to: recipient, value: txAmount }, overrides || {})

        estimate = await this.getWallet().provider.estimateGas(transactionRequest)
      }

      return baseAmount(estimate.toString(), ETH_DECIMAL)
    } catch (error) {
      return Promise.reject(error)
    }
  }
}

export { Client }
