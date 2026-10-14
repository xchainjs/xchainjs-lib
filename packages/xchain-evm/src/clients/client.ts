import {
  AssetInfo,
  BaseXChainClient,
  ExplorerProviders,
  FeeOption,
  FeeRates,
  FeeType,
  Fees,
  Network,
  PreparedTx,
  Protocol,
  TxHash,
  TxHistoryParams,
  XChainClientParams,
  checkFeeBounds,
  standardFeeRates,
} from '@xchainjs/xchain-client'
import { EvmOnlineDataProviders } from '@xchainjs/xchain-evm-providers'
import {
  Address,
  Asset,
  CachedValue,
  Chain,
  TokenAsset,
  assetToString,
  baseAmount,
  eqAsset,
} from '@xchainjs/xchain-util'
import { Provider, Contract, Transaction, toUtf8Bytes, hexlify } from 'ethers'
import BigNumber from 'bignumber.js'

import erc20ABI from '../data/erc20.json'
import {
  ApproveParams,
  Balance,
  CallParams,
  CompatibleAsset,
  EstimateApproveParams,
  EstimateCallParams,
  EvmDefaults,
  FeesWithGasPricesAndLimits,
  GasPrices,
  ISigner,
  IsApprovedParams,
  Tx,
  TxParams,
  TxsPage,
} from '../types'
import {
  call,
  estimateApprove,
  estimateCall,
  getAllowance,
  getApprovalAmount,
  getFee,
  getNetworkId,
  getTokenAddress,
  isApproved,
  validateAddress,
} from '../utils'

export interface EVMClient {
  approve(params: ApproveParams): Promise<string>
  awaitTxConfirmed(hash: string): Promise<void>
}

export type EVMClientParams = XChainClientParams & {
  chain: Chain
  gasAsset: Asset
  gasAssetDecimals: number
  defaults: Record<Network, EvmDefaults>
  providers: Record<Network, Provider>
  explorerProviders: ExplorerProviders
  dataProviders: EvmOnlineDataProviders[]
  signer?: ISigner
}

export class Client extends BaseXChainClient implements EVMClient {
  readonly config: Omit<EVMClientParams, 'signer'>
  protected signer?: ISigner
  protected defaults: Record<Network, EvmDefaults>
  private cachedNetworkId: CachedValue<number>

  constructor({
    chain,
    gasAsset,
    gasAssetDecimals,
    defaults,
    network = Network.Mainnet,
    feeBounds,
    providers,
    rootDerivationPaths,
    explorerProviders,
    dataProviders,
    signer,
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
    this.signer = signer
    this.defaults = defaults
    this.cachedNetworkId = new CachedValue<number>(() => getNetworkId(this.getProvider()))
  }

  getProvider(): Provider {
    return this.config.providers[this.network]
  }

  getExplorerUrl(): string {
    return this.config.explorerProviders[this.network].getExplorerUrl()
  }

  getAssetInfo(): AssetInfo {
    const assetInfo: AssetInfo = {
      asset: this.config.gasAsset,
      decimal: this.config.gasAssetDecimals,
    }
    return assetInfo
  }

  getExplorerAddressUrl(address: Address): string {
    return this.config.explorerProviders[this.network].getExplorerAddressUrl(address)
  }

  getExplorerTxUrl(txID: string): string {
    return this.config.explorerProviders[this.network].getExplorerTxUrl(txID)
  }

  setNetwork(network: Network): void {
    super.setNetwork(network)
    this.cachedNetworkId = new CachedValue<number>(() => getNetworkId(this.getProvider()))
  }

  public getAddress(): string {
    throw new Error('Sync method not supported for Ledger')
  }

  getAddressAsync(walletIndex?: number, verify = false): Promise<string> {
    return this.getSigner().getAddressAsync(walletIndex, verify)
  }

  validateAddress(address: Address): boolean {
    return validateAddress(address)
  }
  async getBalance(address: Address, assets?: TokenAsset[]): Promise<Balance[]> {
    return await this.roundRobinGetBalance(address, assets)
  }

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

  async getTransactionData(txId: string, assetAddress?: Address): Promise<Tx> {
    return await this.roundRobinGetTransactionData(txId, assetAddress)
  }

  async estimateCall({ contractAddress, abi, funcName, funcParams = [] }: EstimateCallParams): Promise<BigNumber> {
    return estimateCall({
      provider: this.getProvider(),
      contractAddress,
      abi,
      funcName,
      funcParams,
    })
  }

  async isApproved({ contractAddress, spenderAddress, amount, walletIndex }: IsApprovedParams): Promise<boolean> {
    const allowance = await isApproved({
      provider: this.getProvider(),
      amount,
      spenderAddress,
      contractAddress,
      fromAddress: await this.getAddressAsync(walletIndex),
    })

    return allowance
  }

  /** Omitted amount is an unlimited token allowance. */
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

  async broadcastTx(txHex: string): Promise<TxHash> {
    const provider = this.config.providers[this.network]
    if (!provider.broadcastTransaction) {
      throw new Error('Provider does not support sendTransaction')
    }
    const resp = await provider.broadcastTransaction(txHex)
    return resp.hash
  }

  /** Gas prices are in wei (`BaseAmount`). */
  async estimateGasPrices(protocol?: Protocol): Promise<GasPrices> {
    if (!protocol) {
      try {
        const feeRates = await this.roundRobinGetFeeRates()
        return {
          [FeeOption.Average]: baseAmount(feeRates.average, this.config.gasAssetDecimals),
          [FeeOption.Fast]: baseAmount(feeRates.fast, this.config.gasAssetDecimals),
          [FeeOption.Fastest]: baseAmount(feeRates.fastest, this.config.gasAssetDecimals),
        }
      } catch (error) {
        console.warn(`Can not round robin over GetFeeRates: ${String(error)}`)
      }

      try {
        // Primary RPC gas price if round-robin fails.
        const feeData = await this.getProvider().getFeeData()

        if (!feeData.gasPrice) {
          throw new Error('Gas price is null')
        }

        const gasPrice = new BigNumber(feeData.gasPrice.toString())

        return {
          [FeeOption.Average]: baseAmount(gasPrice.toString(), this.config.gasAssetDecimals),
          [FeeOption.Fast]: baseAmount(gasPrice.multipliedBy(1.5).toString(), this.config.gasAssetDecimals),
          [FeeOption.Fastest]: baseAmount(gasPrice.multipliedBy(2).toString(), this.config.gasAssetDecimals),
        }
      } catch (error) {
        console.warn(`Can not get gasPrice from provider: ${String(error)}`)
      }
    }

    // THORChain when requested, or after provider lookups fail. Rates are gwei; convert to wei (1 gwei = 1e9).
    // @see https://gitlab.com/thorchain/thornode/-/blob/develop/x/thorchain/querier.go#L416-420
    if (!protocol || protocol === Protocol.THORCHAIN) {
      try {
        const ratesInGwei: FeeRates = standardFeeRates(await this.getFeeRateFromThorchain())
        return {
          [FeeOption.Average]: baseAmount(ratesInGwei[FeeOption.Average] * 10 ** 9, this.config.gasAssetDecimals),
          [FeeOption.Fast]: baseAmount(ratesInGwei[FeeOption.Fast] * 10 ** 9, this.config.gasAssetDecimals),
          [FeeOption.Fastest]: baseAmount(ratesInGwei[FeeOption.Fastest] * 10 ** 9, this.config.gasAssetDecimals),
        }
      } catch (error) {
        console.warn(error)
      }
    }

    // MAYAChain rates are gwei; same conversion to wei as THORChain.
    if (protocol === Protocol.MAYACHAIN) {
      try {
        const ratesInGwei: FeeRates = standardFeeRates(await this.getFeeRateFromMayachain())
        return {
          [FeeOption.Average]: baseAmount(ratesInGwei[FeeOption.Average] * 10 ** 9, this.config.gasAssetDecimals),
          [FeeOption.Fast]: baseAmount(ratesInGwei[FeeOption.Fast] * 10 ** 9, this.config.gasAssetDecimals),
          [FeeOption.Fastest]: baseAmount(ratesInGwei[FeeOption.Fastest] * 10 ** 9, this.config.gasAssetDecimals),
        }
      } catch (error) {
        console.warn(error)
      }
    }

    // Defaults if every lookup fails.
    const defaultRatesInGwei: FeeRates = standardFeeRates(this.defaults[this.network].gasPrice.toNumber())
    return {
      [FeeOption.Average]: baseAmount(defaultRatesInGwei[FeeOption.Average], this.config.gasAssetDecimals),
      [FeeOption.Fast]: baseAmount(defaultRatesInGwei[FeeOption.Fast], this.config.gasAssetDecimals),
      [FeeOption.Fastest]: baseAmount(defaultRatesInGwei[FeeOption.Fastest], this.config.gasAssetDecimals),
    }
  }

  async estimateGasLimit({
    asset,
    recipient,
    amount,
    memo,
    from,
    isMemoEncoded,
  }: TxParams & { from?: Address }): Promise<BigNumber> {
    const txAmount = BigInt(amount.amount().toFixed())
    const theAsset = asset ?? this.config.gasAsset
    let gasEstimate: BigNumber
    if (!this.isGasAsset(theAsset)) {
      const assetAddress = getTokenAddress(theAsset)
      if (!assetAddress) throw new Error(`Can't get address from asset ${assetToString(theAsset)}`)
      const contract = new Contract(assetAddress, erc20ABI, this.getProvider())

      const address = from || (await this.getAddressAsync())
      const gasEstimateResponse = await contract.getFunction('transfer').estimateGas(recipient, txAmount, {
        from: address,
      })

      gasEstimate = new BigNumber(gasEstimateResponse.toString())
    } else {
      let stringEncodedMemo
      if (memo) {
        stringEncodedMemo = hexlify(toUtf8Bytes(memo))
      }
      const parsedMemo = memo ? (isMemoEncoded ? memo : stringEncodedMemo) : undefined
      const transactionRequest = {
        from: from || (await this.getAddressAsync()),
        to: recipient,
        value: txAmount,
        data: parsedMemo,
      }
      const gasEstimation = await this.getProvider().estimateGas(transactionRequest)
      gasEstimate = new BigNumber(gasEstimation.toString())
    }

    return gasEstimate
  }
  private isGasAsset(asset: CompatibleAsset): asset is Asset {
    return eqAsset(this.config.gasAsset, asset)
  }

  async estimateFeesWithGasPricesAndLimits(params: TxParams): Promise<FeesWithGasPricesAndLimits> {
    const gasPrices = await this.estimateGasPrices()
    const decimals = this.config.gasAssetDecimals
    const { fast: fastGP, fastest: fastestGP, average: averageGP } = gasPrices

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

  public async awaitTxConfirmed(hash: string): Promise<void> {
    await this.getProvider().waitForTransaction(hash)
  }

  getFees(): never
  getFees(params: TxParams): Promise<Fees>
  async getFees(params?: TxParams): Promise<Fees> {
    if (!params) throw new Error('Params need to be passed')

    const { fees } = await this.estimateFeesWithGasPricesAndLimits(params)
    return fees
  }
  protected async roundRobinGetBalance(address: Address, assets?: TokenAsset[]) {
    for (const provider of this.config.dataProviders) {
      try {
        const prov = provider[this.network]
        if (prov) return await prov.getBalance(address, assets)
      } catch (error) {
        console.warn(error)
      }
    }
    throw new Error('no provider able to get balance')
  }
  protected async roundRobinGetTransactionData(txId: string, assetAddress?: string) {
    for (const provider of this.config.dataProviders) {
      try {
        const prov = provider[this.network]
        if (prov) return await prov.getTransactionData(txId, assetAddress)
      } catch (error) {
        console.warn(error)
      }
    }
    throw new Error('no provider able to GetTransactionData')
  }
  protected async roundRobinGetTransactions(params: TxHistoryParams) {
    for (const provider of this.config.dataProviders) {
      try {
        const prov = provider[this.network]
        if (prov) return await prov.getTransactions(params)
      } catch (error) {
        console.warn(error)
      }
    }
    throw new Error('no provider able to GetTransactions')
  }
  protected async roundRobinGetFeeRates(): Promise<FeeRates> {
    for (const provider of this.config.dataProviders) {
      try {
        const prov = provider[this.network]
        if (prov) return await prov.getFeeRates()
      } catch (error) {
        console.warn(error)
      }
    }
    throw new Error('No provider available to getFeeRates')
  }

  async prepareTx({
    sender,
    asset = this.config.gasAsset,
    memo,
    amount,
    recipient,
    isMemoEncoded = false,
  }: TxParams & {
    sender: Address
  }): Promise<PreparedTx> {
    if (asset.chain !== this.chain)
      throw new Error(`This client can only prepare transactions on chain: ${this.chain}. Bad asset: ${asset.chain}`)

    if (!this.validateAddress(sender)) throw new Error('Invalid sender address')
    if (!this.validateAddress(recipient)) throw new Error('Invalid recipient address')

    const nonce = await this.getProvider().getTransactionCount(sender)

    if (this.isGasAsset(asset)) {
      let stringEncodedMemo
      if (memo) {
        stringEncodedMemo = toUtf8Bytes(memo)
      }
      const parsedMemo = memo ? (isMemoEncoded ? memo : stringEncodedMemo) : undefined

      const tx = new Transaction()
      tx.chainId = await this.cachedNetworkId.getValue()
      tx.to = recipient
      tx.value = amount.amount().toFixed()
      tx.nonce = nonce

      if (parsedMemo) {
        tx.data = parsedMemo
      }

      return {
        rawUnsignedTx: tx.unsignedSerialized,
      }
    } else {
      const assetAddress = getTokenAddress(asset)
      if (!assetAddress) throw new Error(`Can't parse address from asset ${assetToString(asset)}`)

      const contract = new Contract(assetAddress, erc20ABI, this.getProvider())

      const amountToTransfer = BigInt(amount.amount().toFixed())
      const unsignedTx = await contract.getFunction('transfer').populateTransaction(recipient, amountToTransfer)

      unsignedTx.chainId = BigInt(await this.cachedNetworkId.getValue())
      unsignedTx.nonce = nonce

      const tx = Transaction.from(unsignedTx)

      return {
        rawUnsignedTx: tx.unsignedSerialized,
      }
    }
  }

  public async prepareApprove({
    contractAddress,
    spenderAddress,
    amount,
    sender,
  }: ApproveParams & { sender: string }): Promise<PreparedTx> {
    if (!this.validateAddress(contractAddress)) throw new Error('Invalid contractAddress address')
    if (!this.validateAddress(spenderAddress)) throw new Error('Invalid spenderAddress address')
    if (!this.validateAddress(sender)) throw new Error('Invalid sender address')

    const contract = new Contract(contractAddress, erc20ABI, this.getProvider())
    const valueToApprove = getApprovalAmount(amount)

    const unsignedTx = await contract
      .getFunction('approve')
      .populateTransaction(spenderAddress, BigInt(valueToApprove.toFixed()))

    const nonce = await this.getProvider().getTransactionCount(sender)

    unsignedTx.chainId = BigInt(await this.cachedNetworkId.getValue())
    unsignedTx.nonce = nonce

    const tx = Transaction.from(unsignedTx)

    return {
      rawUnsignedTx: tx.unsignedSerialized,
    }
  }

  async call<T>({ contractAddress, abi, funcName, funcParams = [], signer }: CallParams): Promise<T> {
    return call({ provider: this.getProvider(), signer, contractAddress, abi, funcName, funcParams })
  }

  public async transfer({
    walletIndex = 0,
    asset = this.getAssetInfo().asset,
    memo,
    amount,
    recipient,
    feeOption = FeeOption.Fast,
    gasPrice,
    maxFeePerGas,
    maxPriorityFeePerGas,
    gasLimit,
    isMemoEncoded,
  }: TxParams): Promise<string> {
    if (gasPrice && (maxFeePerGas || maxPriorityFeePerGas)) {
      throw new Error('gasPrice is not compatible with EIP 1559 (maxFeePerGas and maxPriorityFeePerGas) params')
    }
    const feeData: {
      maxFeePerGas: bigint | null
      maxPriorityFeePerGas: bigint | null
      gasPrice: bigint | null
    } = {
      maxFeePerGas: null,
      maxPriorityFeePerGas: null,
      gasPrice: null,
    }

    const feeInfo = await this.getProvider().getFeeData()

    if (maxFeePerGas || maxPriorityFeePerGas) {
      const block = await this.getProvider().getBlock('latest')
      // 0n is a real EIP-1559 base fee (BSC). Only null/undefined means the chain has none.
      const baseFee = block?.baseFeePerGas
      if (maxFeePerGas) {
        feeData.maxFeePerGas = BigInt(maxFeePerGas.amount().toFixed())
      } else if (maxPriorityFeePerGas && baseFee != null) {
        const maxPriority = BigInt(maxPriorityFeePerGas.amount().toFixed())
        feeData.maxFeePerGas = baseFee * BigInt(2) + maxPriority
      }
      feeData.maxPriorityFeePerGas = maxPriorityFeePerGas
        ? BigInt(maxPriorityFeePerGas.amount().toFixed())
        : feeInfo.maxPriorityFeePerGas
    } else {
      const txGasPrice = gasPrice
        ? BigInt(gasPrice.amount().toFixed())
        : await this.estimateGasPrices()
            .then((prices) => prices[feeOption])
            .then((gp) => BigInt(gp.amount().toFixed()))
      checkFeeBounds(this.feeBounds, Number(txGasPrice))
      feeData.gasPrice = txGasPrice
    }
    const sender = await this.getAddressAsync(walletIndex)
    let txGasLimit: BigNumber
    if (!gasLimit) {
      try {
        txGasLimit = await this.estimateGasLimit({ asset, recipient, amount, memo, from: sender })
      } catch (_error) {
        txGasLimit = eqAsset(asset, this.getAssetInfo().asset)
          ? this.defaults[this.network].transferGasAssetGasLimit
          : this.defaults[this.network].transferTokenGasLimit
      }
    } else {
      txGasLimit = gasLimit
    }

    const { rawUnsignedTx } = await this.prepareTx({
      sender,
      recipient,
      amount,
      asset,
      memo,
      isMemoEncoded,
    })

    const tx = Transaction.from(rawUnsignedTx)

    tx.type = feeData.gasPrice ? 1 : 2
    tx.gasLimit = BigInt(txGasLimit.toFixed())
    tx.gasPrice = feeData.gasPrice || null
    tx.maxFeePerGas = feeData.maxFeePerGas != null ? feeData.maxFeePerGas : null
    tx.maxPriorityFeePerGas = feeData.maxPriorityFeePerGas || null

    // EMULATE ethers v5 behavior https://github.com/ethers-io/ethers.js/blob/0bfa7f497dc5793b66df7adfb42c6b846c51d794/packages/abstract-signer/src.ts/index.ts#L247
    if (tx.type === 1 && feeInfo.maxFeePerGas && feeInfo.maxPriorityFeePerGas) {
      tx.type = 2
      tx.maxFeePerGas = feeData.gasPrice
      tx.maxPriorityFeePerGas = feeData.gasPrice
      tx.gasPrice = null
    }

    const signedTx = await this.getSigner().signTransfer({
      walletIndex,
      tx,
    })

    return this.broadcastTx(signedTx)
  }

  public async approve({
    contractAddress,
    spenderAddress,
    feeOption = FeeOption.Fast, // Matches transfer() default; callers can override to Fastest if needed
    amount,
    walletIndex = 0,
  }: ApproveParams): Promise<string> {
    const sender = await this.getAddressAsync(walletIndex || 0)

    const gasPrice: BigNumber = new BigNumber(
      (await this.estimateGasPrices().then((prices) => prices[feeOption])).amount().toFixed(),
    )

    checkFeeBounds(this.feeBounds, gasPrice.toNumber())

    // Some tokens (e.g. USDT) require resetting allowance to 0 before setting a new non-zero value.
    // Check current allowance and reset if needed. Failures are non-blocking to avoid
    // preventing approval due to transient RPC issues.
    const approvalAmount = getApprovalAmount(amount)
    let shouldResetAllowance = false
    if (approvalAmount.gt(0)) {
      try {
        const currentAllowance = await getAllowance({
          provider: this.getProvider(),
          contractAddress,
          spenderAddress,
          fromAddress: sender,
        })
        shouldResetAllowance = currentAllowance.gt(0)
      } catch (error) {
        console.warn(`Failed to read allowance, skipping reset pre-check: ${String(error)}`)
      }
      if (shouldResetAllowance) {
        const contract = new Contract(contractAddress, erc20ABI, this.getProvider())
        const resetUnsignedTx = await contract.getFunction('approve').populateTransaction(spenderAddress, BigInt(0))
        resetUnsignedTx.chainId = BigInt(await this.cachedNetworkId.getValue())
        resetUnsignedTx.nonce = await this.getProvider().getTransactionCount(sender)

        const resetTx = Transaction.from(resetUnsignedTx)
        resetTx.type = 1
        resetTx.gasLimit = BigInt(this.config.defaults[this.network].approveGasLimit.toFixed())
        resetTx.gasPrice = BigInt(gasPrice.toFixed())
        resetTx.maxFeePerGas = null
        resetTx.maxPriorityFeePerGas = null

        const signedResetTx = await this.getSigner().signApprove({ walletIndex, tx: resetTx })
        const resetHash = await this.broadcastTx(signedResetTx)
        await this.getProvider().waitForTransaction(resetHash)
      }
    }

    const gasLimit: BigNumber = await this.estimateApprove({
      spenderAddress,
      contractAddress,
      fromAddress: sender,
      amount,
    }).catch((error) => {
      console.warn(`Failed to estimate approve gas limit, using default: ${String(error)}`)
      return new BigNumber(this.config.defaults[this.network].approveGasLimit)
    })

    const { rawUnsignedTx } = await this.prepareApprove({
      contractAddress,
      spenderAddress,
      amount,
      sender,
    })

    const tx = Transaction.from(rawUnsignedTx)
    tx.type = 1
    tx.gasLimit = BigInt(gasLimit.toFixed())
    tx.gasPrice = BigInt(gasPrice.toFixed())
    tx.maxFeePerGas = null
    tx.maxPriorityFeePerGas = null

    const signedTx = await this.getSigner().signApprove({
      walletIndex,
      tx,
    })

    return this.broadcastTx(signedTx)
  }

  public purgeClient(): void {
    super.purgeClient()
    if (this.signer) {
      this.signer.purge()
      this.signer = undefined
    }
  }

  protected getSigner(): ISigner {
    if (!this.signer) throw new Error('Can not get signer')
    return this.signer
  }
}
