import { Provider, TransactionResponse } from '@ethersproject/abstract-provider'
import {
  AssetInfo,
  Balance,
  BaseXChainClient,
  ExplorerProviders,
  FeeOption,
  FeeRates,
  FeeType,
  Fees,
  Network,
  OnlineDataProviders,
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
import { Address, Asset, BaseAmount, Chain, assetToString, baseAmount, eqAsset } from '@xchainjs/xchain-util'
import { BigNumber, Signer, Wallet, ethers } from 'ethers'
import { HDNode, toUtf8Bytes } from 'ethers/lib/utils'

import erc20ABI from './data/erc20.json'
import {
  ApproveParams,
  CallParams,
  EstimateApproveParams,
  EstimateCallParams,
  FeesWithGasPricesAndLimits,
  GasPrices,
  IsApprovedParams,
  TxOverrides,
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

/**
 * Interface for custom EVM client
 */
// export interface EVMClient {
//   call<T>(params: CallParams): Promise<T>
//   estimateCall(asset: EstimateCallParams): Promise<BigNumber>
//   estimateGasPrices(): Promise<GasPrices>
//   estimateGasLimit(params: TxParams): Promise<BigNumber>
//   estimateFeesWithGasPricesAndLimits(params: TxParams): Promise<FeesWithGasPricesAndLimits>
//   estimateApprove(params: EstimateApproveParams): Promise<BigNumber>
//   isApproved(params: IsApprovedParams): Promise<boolean>
//   approve(params: ApproveParams): Promise<TransactionResponse>
//   // `getFees` of `BaseXChainClient` needs to be overridden
//   getFees(params: TxParams): Promise<Fees>
//   getWallet(walletIndex?: number): ethers.Wallet
//   getProvider(): Provider
// }
type EvmDefaults = {
  transferGasAssetGasLimit: BigNumber
  transferTokenGasLimit: BigNumber
  approveGasLimit: BigNumber
  gasPrice: BigNumber
}

export type EVMClientParams = XChainClientParams & {
  chain: Chain
  gasAsset: Asset
  gasAssetDecimals: number
  defaults: Record<Network, EvmDefaults>
  providers: Record<Network, Provider>
  explorerProviders: ExplorerProviders
  dataProviders: OnlineDataProviders
}

/**
 * Custom EVM client
 */
export default class Client extends BaseXChainClient implements XChainClient {
  readonly config: EVMClientParams
  private gasAsset: Asset
  private gasAssetDecimals: number
  private hdNode?: HDNode
  private defaults: Record<Network, EvmDefaults>
  private explorerProviders: ExplorerProviders
  private dataProviders: OnlineDataProviders
  private providers: Record<Network, Provider>
  /**
   * Constructor
   * @param {EVMClientParams} params
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
   * Purge client.
   *
   * @returns {void}
   */
  purgeClient(): void {
    super.purgeClient()
    this.hdNode = undefined
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
  /**
   * Get etherjs Provider interface.
   *
   * @returns {Provider} The current etherjs Provider interface.
   */
  getProvider(): Provider {
    return this.providers[this.network]
  }
  /**
   * Get the explorer url.
   *
   * @returns {string} The explorer url for ethereum based on the current network.
   */
  getExplorerUrl(): string {
    return this.explorerProviders[this.network].getExplorerUrl()
  }

  /**
   *
   * @returns asset info
   */
  getAssetInfo(): AssetInfo {
    const assetInfo: AssetInfo = {
      asset: this.gasAsset,
      decimal: this.gasAssetDecimals,
      chain: this.chain,
    }
    return assetInfo
  }

  /**
   * Get the explorer url for the given address.
   *
   * @param {Address} address
   * @returns {string} The explorer url for the given address.
   */
  getExplorerAddressUrl(address: Address): string {
    return this.explorerProviders[this.network].getExplorerAddressUrl(address)
  }

  /**
   * Get the explorer url for the given transaction id.
   *
   * @param {string} txID
   * @returns {string} The explorer url for the given transaction id.
   */
  getExplorerTxUrl(txID: string): string {
    return this.explorerProviders[this.network].getExplorerTxUrl(txID)
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
   * Get the balance of a given address.
   *
   * @param {Address} address By default, it will return the balance of the current wallet. (optional)
   * @returns {Balance[]} The all balance of the address.
   *
   * @throws {"Invalid asset"} throws when the give asset is an invalid one
   */
  async getBalance(address: Address, assets?: Asset[]): Promise<Balance[]> {
    const prov = this.dataProviders[this.network]
    if (!prov) throw Error('Provider unidefined')
    return await prov.getBalance(address, assets)
  }

  /**
   * Get transaction history of a given address with pagination options.
   * By default it will return the transaction history of the current wallet.
   *
   * @param {TxHistoryParams} params The options to get transaction history. (optional)
   * @returns {TxsPage} The transaction history.
   */
  async getTransactions(params?: TxHistoryParams): Promise<TxsPage> {
    const filteredParams: TxHistoryParams = {
      address: params?.address || this.getAddress(),
      offset: params?.offset,
      limit: params?.limit,
      startTime: params?.startTime,
      asset: params?.asset,
    }

    const prov = this.dataProviders[this.network]
    if (!prov) throw Error('Provider unidefined')
    return await prov.getTransactions(filteredParams)
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
    const prov = this.dataProviders[this.network]
    if (!prov) throw Error('Provider unidefined')
    return await prov.getTransactionData(txId, assetAddress)
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
  }: ApproveParams): Promise<TransactionResponse> {
    const gasPrice: BigNumber = BigNumber.from(
      (await this.estimateGasPrices().then((prices) => prices[feeOption]))
        // .catch(() => getDefaultGasPrices()[feeOption])
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
    }).catch(() => {
      return BigNumber.from(this.config.defaults[this.network].approveGasLimit)
    })

    checkFeeBounds(this.feeBounds, gasPrice.toNumber())

    const valueToApprove: BigNumber = getApprovalAmount(amount)

    const contract = new ethers.Contract(contractAddress, erc20ABI, this.getProvider())

    /* as same as ethers.TransactionResponse expected by `sendTransaction` */
    const unsignedTx: ethers.PopulatedTransaction = await contract.populateTransaction.approve(
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
    asset = this.gasAsset,
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
    if (asset.chain !== this.chain)
      throw Error(`this client can only transfer assets on chain: ${this.chain}. Bad asset: ${assetToString(asset)}`)

    const isGasAsset = this.isGasAsset(asset)

    const txGasPrice: BigNumber = gasPrice
      ? BigNumber.from(gasPrice.amount().toFixed())
      : await this.estimateGasPrices()
          .then((prices) => prices[feeOption])
          .then((gp) => BigNumber.from(gp.amount().toFixed()))

    const defaultGasLimit: ethers.BigNumber = isGasAsset
      ? this.defaults[this.network].transferGasAssetGasLimit
      : this.defaults[this.network].transferTokenGasLimit
    let txGasLimit: BigNumber
    if (!gasLimit) {
      try {
        txGasLimit = await this.estimateGasLimit({ asset, recipient, amount, memo })
      } catch (error) {
        txGasLimit = defaultGasLimit
      }
    } else {
      txGasLimit = gasLimit
    }

    type SafeTxOverrides = Omit<TxOverrides, 'gasPrice'> & { gasPrice: ethers.BigNumber }
    const overrides: SafeTxOverrides = {
      gasLimit: txGasLimit,
      gasPrice: txGasPrice,
    }

    checkFeeBounds(this.feeBounds, overrides.gasPrice.toNumber())

    const signer = txSigner || this.getWallet(walletIndex)
    const txAmount = BigNumber.from(amount.amount().toFixed())

    // Transfer ETH
    if (isGasAsset) {
      const transactionRequest = Object.assign(
        { to: recipient, value: txAmount },
        {
          ...overrides,
          data: memo ? toUtf8Bytes(memo) : undefined,
        },
      )

      const { hash } = await signer.sendTransaction(transactionRequest)

      return hash
    } else {
      const assetAddress = getTokenAddress(asset)
      if (!assetAddress) throw Error(`Can't parse address from asset ${assetToString(asset)}`)
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
  }

  async broadcastTx(txHex: string): Promise<TxHash> {
    const resp = await this.providers[this.network].sendTransaction(txHex)
    return resp.hash
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
        [FeeOption.Average]: baseAmount(ratesInGwei[FeeOption.Average] * 10 ** 9, this.gasAssetDecimals),
        [FeeOption.Fast]: baseAmount(ratesInGwei[FeeOption.Fast] * 10 ** 9, this.gasAssetDecimals),
        [FeeOption.Fastest]: baseAmount(ratesInGwei[FeeOption.Fastest] * 10 ** 9, this.gasAssetDecimals),
      }
    } catch (error) {
      console.warn(error)
    }

    try {
      const feeRateInWei = await this.providers[this.network].getGasPrice()
      const feeRateInGWei = feeRateInWei.div(10 ** 9)
      const ratesInGwei: FeeRates = standardFeeRates(feeRateInGWei.toNumber())
      return {
        [FeeOption.Average]: baseAmount(ratesInGwei[FeeOption.Average] * 10 ** 9, this.gasAssetDecimals),
        [FeeOption.Fast]: baseAmount(ratesInGwei[FeeOption.Fast] * 10 ** 9, this.gasAssetDecimals),
        [FeeOption.Fastest]: baseAmount(ratesInGwei[FeeOption.Fastest] * 10 ** 9, this.gasAssetDecimals),
      }
    } catch (error) {
      console.warn(error)
      const defaultRatesInGwei: FeeRates = standardFeeRates(this.defaults[this.network].gasPrice.toNumber())
      return {
        [FeeOption.Average]: baseAmount(defaultRatesInGwei[FeeOption.Average] * 10 ** 9, this.gasAssetDecimals),
        [FeeOption.Fast]: baseAmount(defaultRatesInGwei[FeeOption.Fast] * 10 ** 9, this.gasAssetDecimals),
        [FeeOption.Fastest]: baseAmount(defaultRatesInGwei[FeeOption.Fastest] * 10 ** 9, this.gasAssetDecimals),
      }
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
  async estimateGasLimit({ asset, recipient, amount, memo }: TxParams): Promise<BigNumber> {
    const txAmount = BigNumber.from(amount.amount().toFixed())
    const theAsset = asset ?? this.gasAsset
    let gasEstimate: BigNumber
    if (!this.isGasAsset(theAsset)) {
      // ERC20 gas estimate
      const assetAddress = getTokenAddress(theAsset)
      if (!assetAddress) throw Error(`Can't get address from asset ${assetToString(theAsset)}`)
      const contract = new ethers.Contract(assetAddress, erc20ABI, this.getProvider())

      gasEstimate = await contract.estimateGas.transfer(recipient, txAmount, {
        from: this.getAddress(),
      })
    } else {
      // ETH gas estimate
      const transactionRequest = {
        from: this.getAddress(),
        to: recipient,
        value: txAmount,
        data: memo ? toUtf8Bytes(memo) : undefined,
      }
      gasEstimate = await this.getProvider().estimateGas(transactionRequest)
    }

    return gasEstimate
  }
  private isGasAsset(asset: Asset): boolean {
    return eqAsset(this.gasAsset, asset)
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
    const decimals = this.gasAssetDecimals
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
        average: getFee({ gasPrice: averageGP, gasLimit, decimals }),
        fast: getFee({ gasPrice: fastGP, gasLimit, decimals }),
        fastest: getFee({ gasPrice: fastestGP, gasLimit, decimals }),
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
