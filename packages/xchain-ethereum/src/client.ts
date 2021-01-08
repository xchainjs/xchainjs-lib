import { ethers, BigNumberish } from 'ethers'
import { Provider, TransactionResponse } from '@ethersproject/abstract-provider'
import { EtherscanProvider, getDefaultProvider } from '@ethersproject/providers'

import vaultABI from '../data/vault.json'
import erc20ABI from '../data/erc20.json'
import { parseEther } from 'ethers/lib/utils'
import {
  Erc20TxOpts,
  EstimateGasERC20Opts,
  GasOracleResponse,
  Network as EthNetwork,
  NormalTxOpts,
  VaultTxOpts,
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
  Txs,
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
} from './utils'
import { getGasOracle } from './etherscan-api'

const ethAddress = '0x0000000000000000000000000000000000000000'

/**
 * Interface for custom Ethereum client
 */
export interface EthereumClient {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  call<T>(asset: Address, abi: ethers.ContractInterface, func: string, params: Array<any>): Promise<T>
  vaultTx(opts: VaultTxOpts): Promise<TransactionResponse>
  normalTx(opts: NormalTxOpts): Promise<TransactionResponse>
  erc20Tx(opts: Erc20TxOpts): Promise<TransactionResponse>

  estimateNormalTx(params: NormalTxOpts): Promise<BaseAmount>
  estimateGasERC20Tx(params: EstimateGasERC20Opts): Promise<BaseAmount>
}

type ClientParams = XChainClientParams & {
  ethplorerUrl?: string
  ethplorerApiKey?: string
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
  private ethplorerUrl = ''
  private ethplorerApiKey = ''

  /**
   * Constructor
   * @param {ClientParams} params
   */
  constructor({
    network = 'testnet',
    ethplorerUrl = '',
    ethplorerApiKey = '',
    phrase,
    vault,
    etherscanApiKey,
  }: ClientParams) {
    this.network = xchainNetworkToEths(network)
    this.provider = getDefaultProvider(this.network)
    this.etherscan = new EtherscanProvider(this.network, etherscanApiKey)
    this.setEthplorerURL(ethplorerUrl)
    this.setEthplorerAPIKey(ethplorerApiKey)

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
   *
   * @returns {void}
   */
  purgeClient = (): void => {
    this.address = null
    this.vault = null
    this.wallet = null
  }

  /**
   * Set/Update the ethplorer url.
   *
   * @param {string} url The new ethplorer url.
   * @returns {void}
   */
  setEthplorerURL = (url: string): void => {
    this.ethplorerUrl = url
  }

  /**
   * Set/Update the ethplorer api key.
   *
   * @param {string} key The new ethplorer api key.
   * @returns {void}
   */
  setEthplorerAPIKey = (key: string): void => {
    this.ethplorerApiKey = key
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
   * Get the vault address.
   *
   * @returns {Address} The current vault address.
   *
   * @throws {"Vault must be provided"}
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
   * @returns {string} The explorer url.
   */
  getExplorerUrl = (): string => {
    return this.getNetwork() === 'testnet' ? 'https://kovan.etherscan.io/' : 'https://etherscan.io/'
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
   * Set/update the current vault address.
   *
   * @param {string} vault A new vault address.
   * @returns {void}
   *
   * @throws {"Vault address must be provided"}
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
      address = address || this.getAddress()
      const account = await ethplorerAPI.getAddress(this.ethplorerUrl, address, this.ethplorerApiKey)
      const balances: Balances = [
        {
          asset: AssetETH,
          amount: assetToBase(assetAmount(account.ETH.balance, ETH_DECIMAL)),
        },
      ]

      if (account.tokens) {
        account.tokens.forEach((token) => {
          const decimals = parseInt(token.tokenInfo.decimals)
          const tokenAsset = assetFromString(`${ETHChain}.${token.tokenInfo.symbol}-${token.tokenInfo.address}`)
          if (tokenAsset && getTokenAddress(tokenAsset)) {
            balances.push({
              asset: tokenAsset,
              amount: baseAmount(token.balance, decimals),
            })
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
          this.ethplorerUrl,
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
          this.ethplorerUrl,
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
      const txInfo = await ethplorerAPI.getTxInfo(this.ethplorerUrl, txId, this.ethplorerApiKey)

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
      const overrides = gasPrice && {
        gasLimit: gasLimit || DEFAULT_GASLIMIT,
        gasPrice: parseEther(baseToAsset(gasPrice).amount().toFormat()),
      }

      let assetAddress
      if (asset && assetToString(asset) !== assetToString(AssetETH)) {
        assetAddress = getTokenAddress(asset)
      }

      let result

      if (assetAddress) {
        result = await this.erc20Tx({ assetAddress, recipient, amount, overrides })
      } else {
        if (memo) {
          result = await this.vaultTx({ address: recipient, amount, memo, overrides })
        } else {
          result = await this.normalTx({ recipient, amount, overrides })
        }
      }

      return result.hash
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
   * Send a transaction to the vault.
   *
   * @param {VaultTxOpts} params The Vault transaction options.
   * @returns {TransactionResponse}  The vault transaction result.
   */
  vaultTx = async ({ address, amount, memo, overrides }: VaultTxOpts): Promise<TransactionResponse> => {
    try {
      const txAmount = parseEther(baseToAsset(amount).amount().toFormat())
      const vault = this.getVault()

      if (address === ethAddress) {
        return await this.call<TransactionResponse>(vault, vaultABI, 'deposit(string)', [
          memo,
          {
            ...Object.assign({}, overrides || {}),
            value: txAmount,
          },
        ])
      }

      const allowance = await this.call<BigNumberish>(address, erc20ABI, 'allowance', [
        this.getAddress(),
        vault,
        { from: this.getWallet().address },
      ])
      if (txAmount.gt(allowance)) {
        const approved = await this.call<TransactionResponse>(address, erc20ABI, 'approve', [
          vault,
          txAmount,
          { from: this.getWallet().address },
        ])
        await approved.wait()
      }
      return await this.call<TransactionResponse>(vault, vaultABI, 'deposit(address,uint256,string)', [
        address,
        txAmount,
        memo,
        Object.assign({}, overrides || {}),
      ])
    } catch (error) {
      return Promise.reject(error)
    }
  }

  /**
   * Send ETH transaction.
   *
   * @param {NormalTxOpts} params The ETH transaction options.
   * @returns {TransactionResponse} The transaction result.
   */
  normalTx = async ({ recipient, amount, overrides }: NormalTxOpts): Promise<TransactionResponse> => {
    try {
      const txAmount = parseEther(baseToAsset(amount).amount().toFormat())
      const transactionRequest = Object.assign({ to: recipient, value: txAmount }, overrides || {})
      return await this.getWallet().sendTransaction(transactionRequest)
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
   * Estimate gas for ETH transfer.
   *
   * @param {NormalTxOpts} params The ETH transaction options.
   * @returns {BaseAmount} The estimated gas fee.
   */
  estimateNormalTx = async ({ recipient, amount, overrides }: NormalTxOpts): Promise<BaseAmount> => {
    try {
      const txAmount = parseEther(baseToAsset(amount).amount().toFormat())
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
   * @param {EstimateGasERC20Opts} params The erc20 transaction options.
   * @returns {BaseAmount} The estimated gas fee.
   *
   * @throws {"Invalid Address"}
   * Thrown if the given address is invalid.
   * @throws {"Invalid Asset Address"}
   * Thrown if the given asset address is invalid.
   **/
  estimateGasERC20Tx = async ({ assetAddress, recipient, amount }: EstimateGasERC20Opts): Promise<BaseAmount> => {
    try {
      const txAmount = parseEther(baseToAsset(amount).amount().toFormat())
      if (recipient && !this.validateAddress(recipient)) {
        return Promise.reject('Invalid Address')
      }
      if (!this.validateAddress(assetAddress)) {
        return Promise.reject('Invalid Asset Address')
      }
      const contract = new ethers.Contract(assetAddress, erc20ABI, this.getWallet())
      const erc20 = contract.connect(this.getWallet())
      const estimate = await erc20.estimateGas.transfer(recipient, txAmount)

      return baseAmount(estimate.toString(), ETH_DECIMAL)
    } catch (error) {
      return Promise.reject(error)
    }
  }

  /**
   * Transfer erc20 tokens.
   *
   * @param {Erc20TxOpts} params The erc20 transaction options.
   * @returns {TransactionResponse} The transaction result.
   *
   * @throws {"Invalid Address"}
   * Thrown if the given address is invalid.
   * @throws {"Invalid Asset Address"}
   * Thrown if the given asset address is invalid.
   */
  erc20Tx = async ({ assetAddress, recipient, amount, overrides }: Erc20TxOpts): Promise<TransactionResponse> => {
    try {
      const txAmount = parseEther(baseToAsset(amount).amount().toFormat())
      if (recipient && !this.validateAddress(recipient)) {
        return Promise.reject('Invalid Address')
      }
      if (!this.validateAddress(assetAddress)) {
        return Promise.reject('Invalid Asset Address')
      }

      return await this.call<TransactionResponse>(assetAddress, erc20ABI, 'transfer', [
        recipient,
        txAmount,
        Object.assign({}, overrides || {}),
      ])
    } catch (error) {
      return Promise.reject(error)
    }
  }
}

export { Client }
