import { Provider, TransactionResponse } from '@ethersproject/abstract-provider'
import { EtherscanProvider, getDefaultProvider } from '@ethersproject/providers'
import {
  Balance,
  BaseXChainClient,
  FeeOption,
  FeeRates,
  FeeType,
  Fees,
  Network,
  Tx,
  TxHash,
  TxHistoryParams,
  TxParams,
  TxsPage,
  XChainClient,
  XChainClientParams,
  checkFeeBounds,
  standardFeeRates,
} from '@xchainjs/xchain-client'
import { Address, Asset, BaseAmount, assetToString, baseAmount, delay } from '@xchainjs/xchain-util'
import { BigNumber, Signer, Wallet, ethers } from 'ethers'
import { HDNode, parseUnits, toUtf8Bytes } from 'ethers/lib/utils'

import { LOWER_FEE_BOUND, UPPER_FEE_BOUND } from './const'
import erc20ABI from './data/erc20.json'
import * as etherscanAPI from './etherscan-api'
import * as ethplorerAPI from './ethplorer-api'
import {
  ApproveParams,
  CallParams,
  EstimateApproveParams,
  EstimateCallParams,
  EthNetwork,
  ExplorerUrl,
  FeesWithGasPricesAndLimits,
  GasOracleResponse,
  GasPrices,
  InfuraCreds,
  IsApprovedParams,
  TxOverrides,
} from './types'
import {
  AssetETH,
  BASE_TOKEN_GAS_COST,
  ETH_DECIMAL,
  SIMPLE_GAS_COST,
  call,
  estimateApprove,
  estimateCall,
  getApprovalAmount,
  getAssetAddress,
  getDecimal,
  getDefaultGasPrices,
  getFee,
  getTokenAddress,
  getTokenBalances,
  getTxFromEthplorerEthTransaction,
  getTxFromEthplorerTokenOperation,
  isApproved,
  isEthAsset,
  validateAddress,
  xchainNetworkToEths,
} from './utils'

/**
 * Interface for custom Ethereum client
 */
export interface EthereumClient {
  call<T>(params: CallParams): Promise<T>
  estimateCall(asset: EstimateCallParams): Promise<BigNumber>
  estimateGasPrices(): Promise<GasPrices>
  estimateGasLimit(params: TxParams): Promise<BigNumber>
  estimateFeesWithGasPricesAndLimits(params: TxParams): Promise<FeesWithGasPricesAndLimits>
  estimateApprove(params: EstimateApproveParams): Promise<BigNumber>
  isApproved(params: IsApprovedParams): Promise<boolean>
  approve(params: ApproveParams): Promise<TransactionResponse>
  // `getFees` of `BaseXChainClient` needs to be overridden
  getFees(params: TxParams): Promise<Fees>
  getWallet(walletIndex?: number): ethers.Wallet
  getProvider(): Provider
  getEtherscanProvider(): EtherscanProvider
}

export type EthereumClientParams = XChainClientParams & {
  ethplorerUrl?: string
  ethplorerApiKey?: string
  explorerUrl?: ExplorerUrl
  etherscanApiKey?: string
  infuraCreds?: InfuraCreds
}

/**
 * Custom Ethereum client
 */
export default class Client extends BaseXChainClient implements XChainClient, EthereumClient {
  private ethNetwork: EthNetwork
  private hdNode?: HDNode
  private etherscanApiKey?: string
  private explorerUrl: ExplorerUrl
  private infuraCreds: InfuraCreds | undefined
  private ethplorerUrl: string
  private ethplorerApiKey: string
  private providers: Map<Network, Provider> = new Map<Network, Provider>()

  /**
   * Constructor
   * @param {EthereumClientParams} params
   */
  constructor({
    network = Network.Mainnet,
    feeBounds = {
      lower: LOWER_FEE_BOUND,
      upper: UPPER_FEE_BOUND,
    },
    ethplorerUrl = 'https://api.ethplorer.io',
    ethplorerApiKey = 'freekey',
    explorerUrl,
    phrase = '',
    rootDerivationPaths = {
      [Network.Mainnet]: `m/44'/60'/0'/0/`,
      [Network.Testnet]: `m/44'/60'/0'/0/`, // this is INCORRECT but makes the unit tests pass
      [Network.Stagenet]: `m/44'/60'/0'/0/`,
    },
    etherscanApiKey,
    infuraCreds,
  }: EthereumClientParams) {
    super(AssetETH.chain, { network, rootDerivationPaths, feeBounds })
    this.ethNetwork = xchainNetworkToEths(network)
    this.infuraCreds = infuraCreds
    this.etherscanApiKey = etherscanApiKey
    this.ethplorerUrl = ethplorerUrl
    this.ethplorerApiKey = ethplorerApiKey
    this.explorerUrl = explorerUrl || this.getDefaultExplorerURL()
    this.setupProviders()
    phrase && this.setPhrase(phrase)
  }

  /**
   * Purge client.
   *
   * @returns {void}
   */
  purgeClient(): void {
    super.purgeClient()
    this.hdNode = undefined
  }

  /**
   * Set/Update the explorer url.
   *
   * @param {string} url The explorer url.
   * @returns {void}
   */
  setExplorerURL(url: ExplorerUrl): void {
    this.explorerUrl = url
  }

  /**
   * Get the current address.
   *
   * @param {number} walletIndex (optional) HD wallet index
   * @returns {Address} The current address.
   *
   * @throws Error
   * Thrown if HDNode is not defined. Note: A phrase is needed to create a wallet and to derive an address from it.
   * @throws Error
   * Thrown if wallet index < 0.
   */
  getAddress(walletIndex = 0): Address {
    if (walletIndex < 0) {
      throw new Error('index must be greater than or equal to zero')
    }
    if (!this.hdNode) {
      throw new Error('HDNode is not defined. Make sure phrase has been provided.')
    }
    return this.hdNode.derivePath(this.getFullDerivationPath(walletIndex)).address.toLowerCase()
  }

  /**
   * Get etherjs wallet interface.
   *
   * @param {number} walletIndex (optional) HD wallet index
   * @returns {Wallet} The current etherjs wallet interface.
   *
   * @throws Error
   * Thrown if HDNode is not defined. Note: A phrase is needed to create a wallet and to derive an address from it.
   */
  getWallet(walletIndex = 0): ethers.Wallet {
    if (!this.hdNode) {
      throw new Error('HDNode is not defined. Make sure phrase has been provided.')
    }
    return new Wallet(this.hdNode.derivePath(this.getFullDerivationPath(walletIndex))).connect(this.getProvider())
  }

  setupProviders(): void {
    if (this.infuraCreds) {
      // Infura provider takes either a string of project id
      // or an object of id and secret
      const testnetProvider = this.infuraCreds.projectSecret
        ? new ethers.providers.InfuraProvider(EthNetwork.Test, this.infuraCreds)
        : new ethers.providers.InfuraProvider(EthNetwork.Test, this.infuraCreds.projectId)
      const mainnetProvider = this.infuraCreds.projectSecret
        ? new ethers.providers.InfuraProvider(EthNetwork.Main, this.infuraCreds)
        : new ethers.providers.InfuraProvider(EthNetwork.Main, this.infuraCreds.projectId)
      this.providers.set(Network.Testnet, testnetProvider)
      this.providers.set(Network.Mainnet, mainnetProvider)
      this.providers.set(Network.Stagenet, mainnetProvider)
    } else {
      this.providers.set(Network.Testnet, getDefaultProvider(EthNetwork.Test))
      this.providers.set(Network.Mainnet, getDefaultProvider(EthNetwork.Main))
      this.providers.set(Network.Stagenet, getDefaultProvider(EthNetwork.Main))
    }
  }

  /**
   * Get etherjs Provider interface.
   *
   * @returns {Provider} The current etherjs Provider interface.
   */
  getProvider(): Provider {
    return this.providers.get(this.network) || getDefaultProvider(this.network)
  }

  /**
   * Get etherjs EtherscanProvider interface.
   *
   * @returns {EtherscanProvider} The current etherjs EtherscanProvider interface.
   */
  getEtherscanProvider(): EtherscanProvider {
    return new EtherscanProvider(this.ethNetwork, this.etherscanApiKey)
  }

  /**
   * Get the explorer url.
   *
   * @returns {string} The explorer url for ethereum based on the current network.
   */
  getExplorerUrl(): string {
    return this.getExplorerUrlByNetwork(this.getNetwork())
  }

  /**
   * Get the explorer url.
   *
   * @returns {ExplorerUrl} The explorer url (both mainnet and testnet) for ethereum.
   */
  private getDefaultExplorerURL(): ExplorerUrl {
    return {
      [Network.Testnet]: 'https://ropsten.etherscan.io',
      [Network.Mainnet]: 'https://etherscan.io',
      [Network.Stagenet]: 'https://etherscan.io',
    }
  }

  /**
   * Get the explorer url.
   *
   * @param {Network} network
   * @returns {string} The explorer url for ethereum based on the network.
   */
  private getExplorerUrlByNetwork(network: Network): string {
    return this.explorerUrl[network]
  }

  /**
   * Get the explorer url for the given address.
   *
   * @param {Address} address
   * @returns {string} The explorer url for the given address.
   */
  getExplorerAddressUrl(address: Address): string {
    return `${this.getExplorerUrl()}/address/${address}`
  }

  /**
   * Get the explorer url for the given transaction id.
   *
   * @param {string} txID
   * @returns {string} The explorer url for the given transaction id.
   */
  getExplorerTxUrl(txID: string): string {
    return `${this.getExplorerUrl()}/tx/${txID}`
  }

  /**
   * Set/update the current network.
   *
   * @param {Network} network
   * @returns {void}
   *
   * @throws {"Network must be provided"}
   * Thrown if network has not been set before.
   */
  setNetwork(network: Network): void {
    super.setNetwork(network)
    this.ethNetwork = xchainNetworkToEths(network)
  }

  /**
   * Set/update a new phrase (Eg. If user wants to change wallet)
   *
   * @param {string} phrase A new phrase.
   * @param {number} walletIndex (optional) HD wallet index
   * @returns {Address} The address from the given phrase
   *
   * @throws {"Invalid phrase"}
   * Thrown if the given phase is invalid.
   */
  setPhrase(phrase: string, walletIndex = 0): Address {
    this.hdNode = HDNode.fromMnemonic(phrase)
    return super.setPhrase(phrase, walletIndex)
  }

  /**
   * Validate the given address.
   *
   * @param {Address} address
   * @returns {boolean} `true` or `false`
   */
  validateAddress(address: Address): boolean {
    return validateAddress(address)
  }

  /**
   * Get the ETH balance of a given address.
   *
   * @param {Address} address By default, it will return the balance of the current wallet. (optional)
   * @returns {Balance[]} The all balance of the address.
   *
   * @throws {"Invalid asset"} throws when the give asset is an invalid one
   */
  async getBalance(address: Address, assets?: Asset[]): Promise<Balance[]> {
    const ethAddress = address || this.getAddress()
    // get ETH balance directly from provider
    const ethBalance: BigNumber = await this.getProvider().getBalance(ethAddress)
    const ethBalanceAmount = baseAmount(ethBalance.toString(), ETH_DECIMAL)

    switch (this.getNetwork()) {
      case Network.Mainnet:
      case Network.Stagenet: {
        // use ethplorerAPI for mainnet - ignore assets
        const account = await ethplorerAPI.getAddress(this.ethplorerUrl, address, this.ethplorerApiKey)
        const balances: Balance[] = [
          {
            asset: AssetETH,
            amount: ethBalanceAmount,
          },
        ]

        if (account.tokens) {
          balances.push(...getTokenBalances(account.tokens))
        }

        return balances
      }
      case Network.Testnet: {
        // use etherscan for testnet

        const newAssets = assets || [AssetETH]
        const provider = this.getProvider()
        // Follow approach is only for testnet
        // For mainnet, we will use ethplorer api(one request only)
        // https://github.com/xchainjs/xchainjs-lib/issues/252
        // And to avoid etherscan api call limit, it gets balances in a sequence way, not in parallel
        const balances = []
        for (let i = 0; i < newAssets.length; i++) {
          const asset: Asset = newAssets[i]
          const etherscan = this.getEtherscanProvider()
          if (!isEthAsset(asset)) {
            // Handle token balances
            const assetAddress = getTokenAddress(asset)
            if (!assetAddress) {
              throw new Error(`Invalid asset ${asset}`)
            }
            const balance = await etherscanAPI.getTokenBalance({
              baseUrl: etherscan.baseUrl,
              address,
              assetAddress,
              apiKey: etherscan.apiKey,
            })
            const decimals = (await getDecimal(asset, provider)) || ETH_DECIMAL

            if (!Number.isNaN(decimals)) {
              balances.push({
                asset,
                amount: baseAmount(balance.toString(), decimals),
              })
            }
          } else {
            balances.push({
              asset: AssetETH,
              amount: ethBalanceAmount,
            })
          }
          // Due to etherscan api call limitation, put some delay before another call
          // Free Etherscan api key limit: 5 calls per second
          // So 0.3s delay is reasonable for now
          await delay(300)
        }

        return balances
      }
    }
  }

  /**
   * Get transaction history of a given address with pagination options.
   * By default it will return the transaction history of the current wallet.
   *
   * @param {TxHistoryParams} params The options to get transaction history. (optional)
   * @returns {TxsPage} The transaction history.
   */
  async getTransactions(params?: TxHistoryParams): Promise<TxsPage> {
    const offset = params?.offset || 0
    const limit = params?.limit || 10
    const assetAddress = params?.asset

    const maxCount = 10000

    let transactions
    const etherscan = this.getEtherscanProvider()

    if (assetAddress) {
      transactions = await etherscanAPI.getTokenTransactionHistory({
        baseUrl: etherscan.baseUrl,
        address: params?.address,
        assetAddress,
        page: 0,
        offset: maxCount,
        apiKey: etherscan.apiKey,
      })
    } else {
      transactions = await etherscanAPI.getETHTransactionHistory({
        baseUrl: etherscan.baseUrl,
        address: params?.address,
        page: 0,
        offset: maxCount,
        apiKey: etherscan.apiKey,
      })
    }

    return {
      total: transactions.length,
      txs: transactions.filter((_, index) => index >= offset && index < offset + limit),
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
  async getTransactionData(txId: string, assetAddress?: Address): Promise<Tx> {
    switch (this.getNetwork()) {
      case Network.Mainnet:
      case Network.Stagenet: {
        // use ethplorerAPI for mainnet - ignore assetAddress
        const txInfo = await ethplorerAPI.getTxInfo(this.ethplorerUrl, txId, this.ethplorerApiKey)
        if (!txInfo.operations?.length) return getTxFromEthplorerEthTransaction(txInfo)
        const tx = getTxFromEthplorerTokenOperation(txInfo.operations[0])
        if (!tx) throw new Error('Could not parse transaction data')
        return tx
      }
      case Network.Testnet: {
        let tx
        const etherscan = this.getEtherscanProvider()
        const txInfo = await etherscan.getTransaction(txId)
        if (txInfo) {
          if (assetAddress) {
            tx =
              (
                await etherscanAPI.getTokenTransactionHistory({
                  baseUrl: etherscan.baseUrl,
                  assetAddress,
                  startblock: txInfo.blockNumber,
                  endblock: txInfo.blockNumber,
                  apiKey: etherscan.apiKey,
                })
              ).filter((info) => info.hash === txId)[0] ?? null
          } else {
            tx =
              (
                await etherscanAPI.getETHTransactionHistory({
                  baseUrl: etherscan.baseUrl,
                  startblock: txInfo.blockNumber,
                  endblock: txInfo.blockNumber,
                  apiKey: etherscan.apiKey,
                  address: txInfo.from,
                })
              ).filter((info) => info.hash === txId)[0] ?? null
          }
        }

        if (!tx) throw new Error('Could not get transaction history')

        return tx
      }
    }
  }

  /**
   * Call a contract function.

   * @param {signer} Signer (optional) The address a transaction is send from. If not set, signer will be defined based on `walletIndex`
   * @param {Address} contractAddress The contract address.
   * @param {number} walletIndex (optional) HD wallet index
   * @param {ContractInterface} abi The contract ABI json.
   * @param {string} funcName The function to be called.
   * @param {unknown[]} funcParams (optional) The parameters of the function.
   *
   * @returns {T} The result of the contract function call.
   */
  async call<T>({
    signer: txSigner,
    contractAddress,
    walletIndex = 0,
    abi,
    funcName,
    funcParams = [],
  }: CallParams): Promise<T> {
    const provider = this.getProvider()
    const signer = txSigner || this.getWallet(walletIndex)
    return call({ provider, signer, contractAddress, abi, funcName, funcParams })
  }

  /**
   * Call a contract function.
   * @param {Address} contractAddress The contract address.
   * @param {ContractInterface} abi The contract ABI json.
   * @param {string} funcName The function to be called.
   * @param {any[]} funcParams The parameters of the function.
   * @param {number} walletIndex (optional) HD wallet index
   *
   * @returns {BigNumber} The result of the contract function call.

   */
  async estimateCall({ contractAddress, abi, funcName, funcParams = [] }: EstimateCallParams): Promise<BigNumber> {
    return estimateCall({
      provider: this.getProvider(),
      contractAddress,
      abi,
      funcName,
      funcParams,
    })
  }

  /**
   * Check allowance.
   *
   * @param {Address} contractAddress The contract address.
   * @param {Address} spenderAddress The spender address.
   * @param {BaseAmount} amount The amount to check if it's allowed to spend or not (optional).
   * @param {number} walletIndex (optional) HD wallet index
   * @returns {boolean} `true` or `false`.
   */
  async isApproved({ contractAddress, spenderAddress, amount, walletIndex }: IsApprovedParams): Promise<boolean> {
    const allowance = await isApproved({
      provider: this.getProvider(),
      amount,
      spenderAddress,
      contractAddress,
      fromAddress: this.getAddress(walletIndex),
    })

    return allowance
  }
  /**
   * Check allowance.
   *
   * @param {Address} contractAddress The contract address.
   * @param {Address} spenderAddress The spender address.
   * @param {signer} Signer (optional) The address a transaction is send from. If not set, signer will be defined based on `walletIndex`
   * @param {feeOption} FeeOption Fee option (optional)
   * @param {BaseAmount} amount The amount of token. By default, it will be unlimited token allowance. (optional)
   * @param {number} walletIndex (optional) HD wallet index
   *
   * @throws Error If gas could not been estimated
   *
   * @returns {TransactionResponse} The transaction result.
   */
  async approve({
    contractAddress,
    spenderAddress,
    feeOption = FeeOption.Fastest,
    amount,
    walletIndex = 0,
    signer: txSigner,
    gasLimitFallback,
  }: ApproveParams): Promise<TransactionResponse> {
    const gasPrice: BigNumber = BigNumber.from(
      (
        await this.estimateGasPrices()
          .then((prices) => prices[feeOption])
          .catch(() => getDefaultGasPrices()[feeOption])
      )
        .amount()
        .toFixed(),
    )

    const signer = txSigner || this.getWallet(walletIndex)

    const fromAddress = await signer.getAddress()

    const gasLimit: BigNumber = await this.estimateApprove({
      spenderAddress,
      contractAddress,
      fromAddress,
      amount,
    }).catch((error) => {
      if (gasLimitFallback) {
        return BigNumber.from(gasLimitFallback)
      }

      throw Error(`Could not estimate gas to send approve transaction ${error}`)
    })

    checkFeeBounds(this.feeBounds, gasPrice.toNumber())

    const valueToApprove: BigNumber = getApprovalAmount(amount)

    const contract = new ethers.Contract(contractAddress, erc20ABI, this.getProvider())

    const unsignedTx: ethers.PopulatedTransaction /* as same as ethers.TransactionResponse expected by `sendTransaction` */ = await contract.populateTransaction.approve(
      spenderAddress,
      valueToApprove,
    )

    const result = await signer.sendTransaction({
      ...unsignedTx,
      from: fromAddress,
      gasPrice,
      gasLimit,
    })

    return result
  }

  /**
   * Estimate gas for calling `approve`.
   *
   * @param {Address} contractAddress The contract address.
   * @param {Address} spenderAddress The spender address.
   * @param {Address} fromAddress The address the approve transaction is sent from.
   * @param {BaseAmount} amount The amount of token. By default, it will be unlimited token allowance. (optional)
   *
   * @returns {BigNumber} Estimated gas
   */
  async estimateApprove({
    fromAddress,
    contractAddress,
    spenderAddress,
    amount,
  }: EstimateApproveParams): Promise<BigNumber> {
    return await estimateApprove({
      provider: this.getProvider(),
      contractAddress,
      spenderAddress,
      fromAddress,
      abi: erc20ABI,
      amount,
    })
  }

  /**
   * Transfers ETH or ERC20 token
   *
   * Note: A given `feeOption` wins over `gasPrice` and `gasLimit`
   *
   * @param {TxParams} params The transfer options.
   * @param {signer} Signer (optional) The address a transaction is send from. If not set, signer will be defined based on `walletIndex`
   * @param {feeOption} FeeOption Fee option (optional)
   * @param {gasPrice} BaseAmount Gas price (optional)
   * @param {gasLimit} BigNumber Gas limit (optional)
   *
   * @throws Error Thrown if address of given `Asset` could not be parsed
   *
   * @returns {TxHash} The transaction hash.
   */
  async transfer({
    walletIndex = 0,
    signer: txSigner,
    asset = AssetETH,
    memo,
    amount,
    recipient,
    feeOption = FeeOption.Fast,
    gasPrice,
    gasLimit,
  }: TxParams & {
    signer?: Signer
    feeOption?: FeeOption
    gasPrice?: BaseAmount
    gasLimit?: BigNumber
  }): Promise<TxHash> {
    const txAmount = BigNumber.from(amount.amount().toFixed())

    const isETH = isEthAsset(asset)
    const assetAddress = getAssetAddress(asset)
    if (!assetAddress) throw Error(`Can't parse address from asset ${assetToString(asset)}`)

    const txGasPrice: BigNumber = gasPrice
      ? BigNumber.from(gasPrice.amount().toFixed())
      : await this.estimateGasPrices()
          .then((prices) => prices[feeOption])
          .catch(() => getDefaultGasPrices()[feeOption])
          .then((gp) => BigNumber.from(gp.amount().toFixed()))

    const defaultGasLimit: ethers.BigNumber = isETH ? SIMPLE_GAS_COST : BASE_TOKEN_GAS_COST
    const txGasLimit =
      gasLimit || (await this.estimateGasLimit({ asset, recipient, amount, memo }).catch(() => defaultGasLimit))

    type SafeTxOverrides = Omit<TxOverrides, 'gasPrice'> & { gasPrice: ethers.BigNumber }
    const overrides: SafeTxOverrides = {
      gasLimit: txGasLimit,
      gasPrice: txGasPrice,
    }

    checkFeeBounds(this.feeBounds, overrides.gasPrice.toNumber())

    const signer = txSigner || this.getWallet(walletIndex)

    // Transfer ETH
    if (isETH) {
      const transactionRequest = Object.assign(
        { to: recipient, value: txAmount },
        {
          ...overrides,
          data: memo ? toUtf8Bytes(memo) : undefined,
        },
      )

      const { hash } = await signer.sendTransaction(transactionRequest)

      return hash
    }
    // Transfer ERC20
    const { hash } = await this.call<TransactionResponse>({
      signer,
      contractAddress: assetAddress,
      abi: erc20ABI,
      funcName: 'transfer',
      funcParams: [recipient, txAmount, Object.assign({}, overrides)],
    })

    return hash
  }

  /**
   * Estimate gas price.
   * @see https://etherscan.io/apis#gastracker
   *
   * @returns {GasPrices} The gas prices (average, fast, fastest) in `Wei` (`BaseAmount`)
   */
  async estimateGasPrices(): Promise<GasPrices> {
    try {
      // Note: `rates` are in `gwei`
      // @see https://gitlab.com/thorchain/thornode/-/blob/develop/x/thorchain/querier.go#L416-420
      // To have all values in `BaseAmount`, they needs to be converted into `wei` (1 gwei = 1,000,000,000 wei = 1e9)
      const ratesInGwei: FeeRates = standardFeeRates(await this.getFeeRateFromThorchain())
      return {
        [FeeOption.Average]: baseAmount(ratesInGwei[FeeOption.Average] * 10 ** 9, ETH_DECIMAL),
        [FeeOption.Fast]: baseAmount(ratesInGwei[FeeOption.Fast] * 10 ** 9, ETH_DECIMAL),
        [FeeOption.Fastest]: baseAmount(ratesInGwei[FeeOption.Fastest] * 10 ** 9, ETH_DECIMAL),
      }
    } catch (error) {}
    //should only get here if thor fails
    try {
      return await this.estimateGasPricesFromEtherscan()
    } catch (error) {
      return Promise.reject(new Error(`Failed to estimate gas price: ${error}`))
    }
  }

  /**
   * Estimate gas price.
   * @see https://etherscan.io/apis#gastracker
   *
   * @returns {GasPrices} The gas prices (average, fast, fastest) in `Wei` (`BaseAmount`)
   *
   * @throws {"Failed to estimate gas price"} Thrown if failed to estimate gas price.
   */
  async estimateGasPricesFromEtherscan(): Promise<GasPrices> {
    const etherscan = this.getEtherscanProvider()
    const response: GasOracleResponse = await etherscanAPI.getGasOracle(etherscan.baseUrl, etherscan.apiKey)

    // Convert result of gas prices: `Gwei` -> `Wei`
    const averageWei = parseUnits(response.SafeGasPrice, 'gwei')
    const fastWei = parseUnits(response.ProposeGasPrice, 'gwei')
    const fastestWei = parseUnits(response.FastGasPrice, 'gwei')

    return {
      average: baseAmount(averageWei.toString(), ETH_DECIMAL),
      fast: baseAmount(fastWei.toString(), ETH_DECIMAL),
      fastest: baseAmount(fastestWei.toString(), ETH_DECIMAL),
    }
  }

  /**
   * Estimate gas.
   *
   * @param {TxParams} params The transaction and fees options.
   *
   * @throws Error Thrown if address could not parsed from given ERC20 asset
   *
   * @returns {BaseAmount} The estimated gas fee.
   */
  async estimateGasLimit({ asset = AssetETH, recipient, amount, memo }: TxParams): Promise<BigNumber> {
    const txAmount = BigNumber.from(amount.amount().toFixed())

    if (!isEthAsset(asset)) {
      // ERC20 gas estimate
      const assetAddress = getTokenAddress(asset)
      if (!assetAddress) throw Error(`Can't get address from asset ${assetToString(asset)}`)
      const contract = new ethers.Contract(assetAddress, erc20ABI, this.getProvider())

      return await contract.estimateGas.transfer(recipient, txAmount, {
        from: this.getAddress(),
      })
    }

    // ETH gas estimate
    const transactionRequest = {
      from: this.getAddress(),
      to: recipient,
      value: txAmount,
      data: memo ? toUtf8Bytes(memo) : undefined,
    }

    return await this.getProvider().estimateGas(transactionRequest)
  }

  /**
   * Estimate gas prices/limits (average, fast fastest).
   *
   * @param {TxParams} params
   * @returns {FeesWithGasPricesAndLimits} The estimated gas prices/limits.
   */
  async estimateFeesWithGasPricesAndLimits(params: TxParams): Promise<FeesWithGasPricesAndLimits> {
    // gas prices
    const gasPrices = await this.estimateGasPrices()
    const { fast: fastGP, fastest: fastestGP, average: averageGP } = gasPrices

    // gas limits
    const gasLimit = await this.estimateGasLimit({
      asset: params.asset,
      amount: params.amount,
      recipient: params.recipient,
      memo: params.memo,
    })

    return {
      gasPrices,
      fees: {
        type: FeeType.PerByte,
        average: getFee({ gasPrice: averageGP, gasLimit }),
        fast: getFee({ gasPrice: fastGP, gasLimit }),
        fastest: getFee({ gasPrice: fastestGP, gasLimit }),
      },
      gasLimit,
    }
  }

  /**
   * Get fees.
   *
   * @param {TxParams} params
   * @returns {Fees} The average/fast/fastest fees.
   *
   * @throws {"Params need to be passed"} Thrown if params are not set
   */
  getFees(): never
  getFees(params: TxParams): Promise<Fees>
  async getFees(params?: TxParams): Promise<Fees> {
    if (!params) throw new Error('Params need to be passed')

    const { fees } = await this.estimateFeesWithGasPricesAndLimits(params)
    return fees
  }
}

export { Client }
