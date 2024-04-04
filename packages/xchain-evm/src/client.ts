import { Provider } from '@ethersproject/abstract-provider'
import {
  AssetInfo,
  Balance,
  BaseXChainClient,
  EvmOnlineDataProviders,
  ExplorerProviders,
  FeeOption,
  FeeRates,
  FeeType,
  Fees,
  Network,
  PreparedTx,
  Protocol,
  Tx,
  TxHash,
  TxHistoryParams,
  TxParams,
  TxsPage,
  standardFeeRates,
} from '@xchainjs/xchain-client'
import { Address, Asset, BaseAmount, assetToString, baseAmount, eqAsset } from '@xchainjs/xchain-util'
import { BigNumber, ethers } from 'ethers'
import { toUtf8Bytes } from 'ethers/lib/utils'

import erc20ABI from './data/erc20.json'
import {
  ApproveParams,
  CallParams,
  EVMClientParams,
  EstimateApproveParams,
  EstimateCallParams,
  EvmDefaults,
  FeesWithGasPricesAndLimits,
  GasPrices,
  IsApprovedParams,
} from './types'
import {
  call,
  estimateApprove,
  estimateCall,
  getApprovalAmount,
  getFee,
  getTokenAddress,
  isApproved,
  validateAddress,
} from './utils'

export interface EVMClient {
  approve(params: ApproveParams): Promise<string>
}

/**
 * Custom EVM client class.
 */
export abstract class Client extends BaseXChainClient implements EVMClient {
  readonly config: EVMClientParams
  private gasAsset: Asset
  private gasAssetDecimals: number
  protected defaults: Record<Network, EvmDefaults>
  private explorerProviders: ExplorerProviders
  private dataProviders: EvmOnlineDataProviders[]
  private providers: Record<Network, Provider>
  /**
   * Constructor for the EVM client.
   * @param {EVMClientParams} params - Parameters for configuring the EVM client.
   */
  constructor({
    chain,
    gasAsset,
    gasAssetDecimals,
    defaults,
    network = Network.Mainnet,
    feeBounds,
    providers,
    phrase = '',
    rootDerivationPaths,
    explorerProviders,
    dataProviders,
    chainId,
  }: EVMClientParams) {
    super(chain, { network, rootDerivationPaths, feeBounds })
    this.config = {
      chain,
      gasAsset,
      gasAssetDecimals,
      defaults,
      network,
      feeBounds,
      providers,
      rootDerivationPaths,
      explorerProviders,
      dataProviders,
      chainId,
    }
    this.defaults = defaults
    this.gasAsset = gasAsset
    this.gasAssetDecimals = gasAssetDecimals
    this.explorerProviders = explorerProviders
    this.dataProviders = dataProviders
    this.providers = providers
    phrase && this.setPhrase(phrase)
  }

  /**
   * Retrieves the Ethereum Provider interface.
   * @returns {Provider} The current Ethereum Provider interface.
   */
  getProvider(): Provider {
    return this.providers[this.network]
  }
  /**
   * Retrieves the explorer URL based on the current network.
   * @returns {string} The explorer URL for Ethereum based on the current network.
   */
  getExplorerUrl(): string {
    return this.explorerProviders[this.network].getExplorerUrl()
  }

  /**
   * Retrieves asset information.
   * @returns {AssetInfo} Asset information containing the asset and its decimal places.
   */
  getAssetInfo(): AssetInfo {
    const assetInfo: AssetInfo = {
      asset: this.gasAsset,
      decimal: this.gasAssetDecimals,
    }
    return assetInfo
  }

  /**
   * Retrieves the explorer URL for a given address.
   * @param {Address} address - The address to retrieve the explorer URL for.
   * @returns {string} The explorer URL for the given address.
   */
  getExplorerAddressUrl(address: Address): string {
    return this.explorerProviders[this.network].getExplorerAddressUrl(address)
  }

  /**
   * Retrieves the explorer URL for a given transaction ID.
   * @param {string} txID - The transaction ID to retrieve the explorer URL for.
   * @returns {string} The explorer URL for the given transaction ID.
   */
  getExplorerTxUrl(txID: string): string {
    return this.explorerProviders[this.network].getExplorerTxUrl(txID)
  }

  /**
   * Sets or updates the current network.
   * @param {Network} network - The network to set or update.
   * @returns {void}
   * @throws {"Network must be provided"} Thrown if the network has not been set before.
   */
  setNetwork(network: Network): void {
    super.setNetwork(network)
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
   * Retrieves the balance of a given address.
   * @param {Address} address - The address to retrieve the balance for.
   * @param {Asset[]} assets - Assets to retrieve the balance for (optional).
   * @returns {Promise<Balance[]>} An array containing the balance of the address.
   * @throws {"Invalid asset"} Thrown when the provided asset is invalid.
   */
  async getBalance(address: Address, assets?: Asset[]): Promise<Balance[]> {
    return await this.roundRobinGetBalance(address, assets)
  }

  /**
   * Retrieves the transaction history of a given address with pagination options.
   * @param {TxHistoryParams} params - Options to get transaction history (optional).
   * @returns {Promise<TxsPage>} The transaction history.
   */
  async getTransactions(params?: TxHistoryParams): Promise<TxsPage> {
    const filteredParams: TxHistoryParams = {
      address: params?.address || (await this.getAddressAsync()),
      offset: params?.offset,
      limit: params?.limit,
      startTime: params?.startTime,
      asset: params?.asset,
    }

    return await this.roundRobinGetTransactions(filteredParams)
  }

  /**
   * Retrieves the transaction details of a given transaction ID.
   * @param {string} txId - The transaction ID.
   * @param {string} assetAddress - The asset address (optional).
   * @returns {Promise<Tx>} The transaction details of the given transaction ID.
   * @throws {"Need to provide valid txId"} Thrown if the provided transaction ID is invalid.
   */
  async getTransactionData(txId: string, assetAddress?: Address): Promise<Tx> {
    return await this.roundRobinGetTransactionData(txId, assetAddress)
  }

  /**
   * Estimates the gas required for calling a contract function.
   * @param {Address} contractAddress The contract address.
   * @param {ContractInterface} abi The contract ABI json.
   * @param {string} funcName The function to be called.
   * @param {any[]} funcParams The parameters of the function.
   * @param {number} walletIndex (optional) HD wallet index
   * @param {EstimateCallParams} params - Parameters for estimating gas.
   * @returns {BigNumber}  The estimated gas required for the contract function call.
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
   * @param {IsApprovedParams} params - Parameters for checking allowance.
   * @returns {boolean} `true` if the allowance is approved, `false` otherwise.
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
   * Estimates the gas required for approving an allowance.
   *
   * @param {EstimateApproveParams} params - Parameters for estimating gas.
   * @param {Address} contractAddress The contract address.
   * @param {Address} spenderAddress The spender address.
   * @param {Address} fromAddress The address the approve transaction is sent from.
   * @param {BaseAmount} amount The amount of token. By default, it will be unlimited token allowance. (optional)
   *
   * @returns {BigNumber} The estimated gas required for the approval.
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
   * Broadcasts a transaction.
   * @param {string} txHex - The transaction in hexadecimal format.
   * @returns {Promise<TxHash>} The transaction hash.
   */
  async broadcastTx(txHex: string): Promise<TxHash> {
    const resp = await this.providers[this.network].sendTransaction(txHex)
    return resp.hash
  }

  /**
   * Estimates gas prices (average, fast, fastest) for a transaction.
   * @param {Protocol} protocol The protocol to use for estimating gas prices.
   * @returns {GasPrices} The gas prices (average, fast, fastest) in `Wei` (`BaseAmount`)
   */
  async estimateGasPrices(protocol?: Protocol): Promise<GasPrices> {
    if (!protocol) {
      try {
        // Attempt to fetch gas prices via round-robin from multiple providers
        const feeRates = await this.roundRobinGetFeeRates()
        return {
          [FeeOption.Average]: baseAmount(feeRates.average, this.gasAssetDecimals),
          [FeeOption.Fast]: baseAmount(feeRates.fast, this.gasAssetDecimals),
          [FeeOption.Fastest]: baseAmount(feeRates.fastest, this.gasAssetDecimals),
        }
      } catch (error) {
        console.warn(`Can not round robin over GetFeeRates: ${error}`)
      }

      try {
        // If round-robin fails, fetch gas price from the primary provider
        const gasPrice = await this.getProvider().getGasPrice()
        // Adjust gas prices for different fee options
        return {
          [FeeOption.Average]: baseAmount(gasPrice.toNumber(), this.gasAssetDecimals),
          [FeeOption.Fast]: baseAmount(gasPrice.toNumber() * 1.5, this.gasAssetDecimals),
          [FeeOption.Fastest]: baseAmount(gasPrice.toNumber() * 2, this.gasAssetDecimals),
        }
      } catch (error) {
        console.warn(`Can not get gasPrice from provider: ${error}`)
      }
    }

    // If primary provider fails or fallback to THORChain protocol, fetch gas prices from THORChain
    if (!protocol || protocol === Protocol.THORCHAIN) {
      try {
        // Fetch fee rates from THORChain and convert to BaseAmount
        // Note: `rates` are in `gwei`
        // @see https://gitlab.com/thorchain/thornode/-/blob/develop/x/thorchain/querier.go#L416-420
        // To have all values in `BaseAmount`, they needs to be converted into `wei` (1 gwei = 1,000,000,000 wei = 1e9)
        const ratesInGwei: FeeRates = standardFeeRates(await this.getFeeRateFromThorchain())
        return {
          [FeeOption.Average]: baseAmount(ratesInGwei[FeeOption.Average] * 10 ** 9, this.gasAssetDecimals),
          [FeeOption.Fast]: baseAmount(ratesInGwei[FeeOption.Fast] * 10 ** 9, this.gasAssetDecimals),
          [FeeOption.Fastest]: baseAmount(ratesInGwei[FeeOption.Fastest] * 10 ** 9, this.gasAssetDecimals),
        }
      } catch (error) {
        console.warn(error)
      }
    }

    // Default fee rates if everything else fails
    const defaultRatesInGwei: FeeRates = standardFeeRates(this.defaults[this.network].gasPrice.toNumber())
    return {
      [FeeOption.Average]: baseAmount(defaultRatesInGwei[FeeOption.Average], this.gasAssetDecimals),
      [FeeOption.Fast]: baseAmount(defaultRatesInGwei[FeeOption.Fast], this.gasAssetDecimals),
      [FeeOption.Fastest]: baseAmount(defaultRatesInGwei[FeeOption.Fastest], this.gasAssetDecimals),
    }
  }

  /**
   * Estimates gas limit for a transaction.
   *
   * @param {TxParams} params The transaction and fees options.
   * @returns {BaseAmount} The estimated gas limit.
   * @throws Error Thrown if address could not be parsed from the given ERC20 asset.
   */
  async estimateGasLimit({ asset, recipient, amount, memo, from }: TxParams & { from?: Address }): Promise<BigNumber> {
    const txAmount = BigNumber.from(amount.amount().toFixed())
    const theAsset = asset ?? this.gasAsset
    let gasEstimate: BigNumber
    if (!this.isGasAsset(theAsset)) {
      // ERC20 gas estimate
      const assetAddress = getTokenAddress(theAsset)
      if (!assetAddress) throw Error(`Can't get address from asset ${assetToString(theAsset)}`)
      const contract = new ethers.Contract(assetAddress, erc20ABI, this.getProvider())

      gasEstimate = await contract.estimateGas.transfer(recipient, txAmount, {
        from: from || (await this.getAddressAsync()),
      })
    } else {
      // ETH gas estimate
      const transactionRequest = {
        from: from || (await this.getAddressAsync()),
        to: recipient,
        value: txAmount,
        data: memo ? toUtf8Bytes(memo) : undefined,
      }
      gasEstimate = await this.getProvider().estimateGas(transactionRequest)
    }

    return gasEstimate
  }
  /**
   * Checks if the given asset matches the gas asset.
   *
   * @param {Asset} asset - The asset to check.
   * @returns {boolean} True if the asset matches the gas asset, false otherwise.
   */
  private isGasAsset(asset: Asset): boolean {
    return eqAsset(this.gasAsset, asset)
  }

  /**
   * Estimates gas prices/limits (average, fast, fastest) and fees for a transaction.
   *
   * @param {TxParams} params The transaction parameters.
   * @returns {FeesWithGasPricesAndLimits} The estimated gas prices/limits and fees.
   */
  async estimateFeesWithGasPricesAndLimits(params: TxParams): Promise<FeesWithGasPricesAndLimits> {
    // Gas prices estimation
    const gasPrices = await this.estimateGasPrices()
    const decimals = this.gasAssetDecimals
    const { fast: fastGP, fastest: fastestGP, average: averageGP } = gasPrices

    // Gas limits estimation
    const gasLimit = await this.estimateGasLimit({
      asset: params.asset,
      amount: params.amount,
      recipient: params.recipient,
      memo: params.memo,
    })
    // Calculate fees
    return {
      gasPrices,
      fees: {
        type: FeeType.PerByte,
        average: getFee({ gasPrice: averageGP, gasLimit, decimals }),
        fast: getFee({ gasPrice: fastGP, gasLimit, decimals }),
        fastest: getFee({ gasPrice: fastestGP, gasLimit, decimals }),
      },
      gasLimit,
    }
  }

  /**
   * Get transaction fees.
   *
   * @param {TxParams} params - The transaction parameters.
   * @returns {Fees} The average, fast, and fastest fees.
   * @throws {"Params need to be passed"} Thrown if parameters are not provided.
   */
  getFees(): never
  getFees(params: TxParams): Promise<Fees>
  async getFees(params?: TxParams): Promise<Fees> {
    if (!params) throw new Error('Params need to be passed')

    const { fees } = await this.estimateFeesWithGasPricesAndLimits(params)
    return fees
  }
  /**
   * Retrieves the balance of an address by round-robin querying multiple data providers.
   *
   * @param {Address} address - The address to query the balance for.
   * @param {Asset[]} [assets] - Optional list of assets to query the balance for.
   * @returns {Promise<Balance[]>} The balance information for the address.
   * @throws Error Thrown if no provider is able to retrieve the balance.
   */
  protected async roundRobinGetBalance(address: Address, assets?: Asset[]) {
    for (const provider of this.dataProviders) {
      try {
        const prov = provider[this.network]
        if (prov) return await prov.getBalance(address, assets)
      } catch (error) {
        console.warn(error)
      }
    }
    throw Error('no provider able to get balance')
  }
  /**
   * Retrieves transaction data by round-robin querying multiple data providers.
   *
   * @param {string} txId - The transaction ID.
   * @param {string} [assetAddress] - Optional asset address.
   * @returns {Promise<Tx>} The transaction data.
   * @throws Error Thrown if no provider is able to retrieve the transaction data.
   */
  protected async roundRobinGetTransactionData(txId: string, assetAddress?: string) {
    for (const provider of this.dataProviders) {
      try {
        const prov = provider[this.network]
        if (prov) return await prov.getTransactionData(txId, assetAddress)
      } catch (error) {
        console.warn(error)
      }
    }
    throw Error('no provider able to GetTransactionData')
  }
  /**
   * Retrieves transaction history by round-robin querying multiple data providers.
   *
   * @param {TxHistoryParams} params - The transaction history parameters.
   * @returns {Promise<TxsPage>} The transaction history.
   * @throws Error Thrown if no provider is able to retrieve the transaction history.
   */
  protected async roundRobinGetTransactions(params: TxHistoryParams) {
    for (const provider of this.dataProviders) {
      try {
        const prov = provider[this.network]
        if (prov) return await prov.getTransactions(params)
      } catch (error) {
        console.warn(error)
      }
    }
    throw Error('no provider able to GetTransactions')
  }
  /**
   * Retrieves fee rates by round-robin querying multiple data providers.
   *
   * @returns {Promise<FeeRates>} The fee rates.
   * @throws Error Thrown if no provider is able to retrieve the fee rates.
   */
  protected async roundRobinGetFeeRates(): Promise<FeeRates> {
    for (const provider of this.dataProviders) {
      try {
        const prov = provider[this.network]
        if (prov) return await prov.getFeeRates()
      } catch (error) {
        console.warn(error)
      }
    }
    throw Error('No provider available to getFeeRates')
  }

  /**
   * Prepares a transaction for transfer.
   *
   * @param {TxParams&Address&FeeOption&BaseAmount&BigNumber} params - The transfer options.
   * @returns {Promise<PreparedTx>} The raw unsigned transaction.
   * @throws Error Thrown if the provided asset chain does not match the client's chain, or if any of the addresses are invalid.
   */
  async prepareTx({
    sender,
    asset = this.gasAsset,
    memo,
    amount,
    recipient,
  }: TxParams & {
    sender: Address
    feeOption?: FeeOption
    gasPrice?: BaseAmount
    gasLimit?: BigNumber
  }): Promise<PreparedTx> {
    if (asset.chain !== this.chain)
      throw Error(`This client can only prepare transactions on chain: ${this.chain}. Bad asset: ${asset.chain}`)

    if (!this.validateAddress(sender)) throw Error('Invalid sender address')
    if (!this.validateAddress(recipient)) throw Error('Invalid recipient address')

    const nonce = await this.getProvider().getTransactionCount(sender)

    if (this.isGasAsset(asset)) {
      return {
        rawUnsignedTx: ethers.utils.serializeTransaction({
          chainId: this.config.chainId,
          to: recipient,
          value: BigNumber.from(amount.amount().toFixed()),
          data: memo ? toUtf8Bytes(memo) : undefined,
          nonce,
        }),
      }
    } else {
      const assetAddress = getTokenAddress(asset)
      if (!assetAddress) throw Error(`Can't parse address from asset ${assetToString(asset)}`)

      const contract = new ethers.Contract(assetAddress, erc20ABI, this.getProvider())
      /* as same as ethers.TransactionResponse expected by `sendTransaction` */
      const unsignedTx: ethers.PopulatedTransaction = await contract.populateTransaction.transfer(
        recipient,
        BigNumber.from(amount.amount().toFixed()),
      )

      return {
        rawUnsignedTx: ethers.utils.serializeTransaction({ ...unsignedTx, chainId: this.config.chainId, nonce }),
      }
    }
  }

  /**
   * Prepares an approval transaction.
   *
   * @param {ApproveParams&Address&FeeOption&BaseAmount&BigNumber} params - The approval options.
   * @returns {Promise<PreparedTx>} The raw unsigned transaction.
   * @throws Error Thrown if any of the addresses are invalid.
   */
  public async prepareApprove({
    contractAddress,
    spenderAddress,
    amount,
    sender,
  }: ApproveParams & { sender: string }): Promise<PreparedTx> {
    if (!this.validateAddress(contractAddress)) throw Error('Invalid contractAddress address')
    if (!this.validateAddress(spenderAddress)) throw Error('Invalid spenderAddress address')
    if (!this.validateAddress(sender)) throw Error('Invalid sender address')

    const contract = new ethers.Contract(contractAddress, erc20ABI, this.getProvider())
    const valueToApprove = getApprovalAmount(amount)

    const unsignedTx = await contract.populateTransaction.approve(spenderAddress, valueToApprove)
    const nonce = await this.getProvider().getTransactionCount(sender)

    return { rawUnsignedTx: ethers.utils.serializeTransaction({ ...unsignedTx, chainId: this.config.chainId, nonce }) }
  }

  /**
   * Call a contract function.

   * @param {signer} Signer (optional) The address a transaction is send from. If not set, signer will be defined based on `walletIndex`
   * @param {Address} contractAddress The contract address.
   * @param {number} walletIndex (optional) HD wallet index
   * @param {ContractInterface} abi The contract ABI json.
   * @param {string} funcName The function to be called.
   * @param {unknown[]} funcParams (optional) The parameters of the function.
   * @param {CallParams} params - Parameters for calling the contract function.
   * @returns {T} The result of the contract function call..
   */
  async call<T>({ contractAddress, abi, funcName, funcParams = [], signer }: CallParams): Promise<T> {
    return call({ provider: this.getProvider(), signer, contractAddress, abi, funcName, funcParams })
  }

  public abstract approve(params: ApproveParams): Promise<string>
}
