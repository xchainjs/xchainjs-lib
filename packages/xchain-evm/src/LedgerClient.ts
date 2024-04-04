import AppEth, { ledgerService } from '@ledgerhq/hw-app-eth'
import { FeeOption, TxParams, checkFeeBounds } from '@xchainjs/xchain-client'
import { Address, BaseAmount, eqAsset } from '@xchainjs/xchain-util'
import { BigNumber, ethers } from 'ethers'

import { Client } from './client'
import { ApproveParams, EVMClientParams } from './types'

export class LedgerClient extends Client {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private transport: any // TODO: Parametrize
  private app: AppEth | undefined

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(params: Omit<EVMClientParams, 'phrase'> & { transport: any }) {
    super(params)
    this.transport = params.transport
  }

  /**
   * @throws {Error} Method not implement
   */
  public setPhrase(): Address {
    throw Error('Method not supported for Ledger client')
  }

  /**
   * @throws {Error} Method not implement
   */
  public getAddress(): string {
    throw Error('Sync method not supported for Ledger')
  }

  /**
   * Get the current address.
   * @param {number} index The index of the address. Default 0
   * @param {boolean} verify True to check the address against the Ledger device, otherwise false
   * @returns {Address} The address corresponding to the index provided
   * @returns
   */
  public async getAddressAsync(index = 0, verify = false): Promise<Address> {
    const app = await this.getApp()
    const result = await app.getAddress(this.getFullDerivationPath(index), verify)
    return result.address
  }

  /**
   * Get ethereum ledger app
   * @returns {AppEth} Ethereum ledger app
   */
  public async getApp(): Promise<AppEth> {
    if (this.app) {
      return this.app
    }
    this.app = new AppEth(this.transport)
    return this.app
  }

  /**
   * Transfers ETH or ERC20 token
   *
   * Note: A given `feeOption` wins over `gasPrice` and `gasLimit`
   *
   * @param {TxParams} params The transfer options.
   * @param {feeOption} FeeOption Fee option (optional)
   * @param {gasPrice} BaseAmount Gas price (optional)
   * @param {maxFeePerGas} BaseAmount Optional. Following EIP-1559, maximum fee per gas. Parameter not compatible with gasPrice
   * @param {maxPriorityFeePerGas} BaseAmount Optional. Following EIP-1559, maximum priority fee per gas. Parameter not compatible with gasPrice
   * @param {gasLimit} BigNumber Gas limit (optional)
   * @throws Error Thrown if address of given `Asset` could not be parsed
   * @throws {Error} Error thrown if not compatible fee parameters are provided
   * @returns {TxHash} The transaction hash.
   */
  public async transfer({
    walletIndex,
    asset = this.getAssetInfo().asset,
    memo,
    amount,
    recipient,
    feeOption = FeeOption.Fast,
    gasPrice,
    maxFeePerGas,
    maxPriorityFeePerGas,
    gasLimit,
  }: TxParams & {
    feeOption?: FeeOption
    gasPrice?: BaseAmount
    maxFeePerGas?: BaseAmount
    maxPriorityFeePerGas?: BaseAmount
    gasLimit?: BigNumber
  }): Promise<string> {
    // Check for compatibility between gasPrice and EIP 1559 parameters
    if (gasPrice && (maxFeePerGas || maxPriorityFeePerGas)) {
      throw new Error('gasPrice is not compatible with EIP 1559 (maxFeePerGas and maxPriorityFeePerGas) params')
    }
    // Initialize fee data object
    const feeData: ethers.providers.FeeData = {
      lastBaseFeePerGas: null,
      maxFeePerGas: null,
      maxPriorityFeePerGas: null,
      gasPrice: null,
    }
    // If EIP 1559 parameters are provided, use them; otherwise, estimate gas price
    if (maxFeePerGas || maxPriorityFeePerGas) {
      // Get fee info from the provider
      const feeInfo = await this.getProvider().getFeeData()
      // Set max fee per gas
      if (maxFeePerGas) {
        // Set max priority fee per gas
        feeData.maxFeePerGas = BigNumber.from(maxFeePerGas.amount().toFixed())
      } else if (maxPriorityFeePerGas && feeInfo.lastBaseFeePerGas) {
        feeData.maxFeePerGas = feeInfo.lastBaseFeePerGas.mul(2).add(maxPriorityFeePerGas.amount().toFixed())
      }
      feeData.maxPriorityFeePerGas = maxPriorityFeePerGas
        ? BigNumber.from(maxPriorityFeePerGas.amount().toFixed())
        : feeInfo.maxPriorityFeePerGas
    } else {
      const txGasPrice: BigNumber = gasPrice
        ? // Estimate gas price based on fee option
          BigNumber.from(gasPrice.amount().toFixed())
        : await this.estimateGasPrices()
            .then((prices) => prices[feeOption])
            .then((gp) => BigNumber.from(gp.amount().toFixed()))
      // Check fee bounds
      checkFeeBounds(this.feeBounds, txGasPrice.toNumber())
      // Set gas price
      feeData.gasPrice = txGasPrice
    }
    // Get the sender address
    const sender = await this.getAddressAsync()
    // Determine gas limit: estimate or use default
    let txGasLimit: BigNumber
    if (!gasLimit) {
      try {
        txGasLimit = await this.estimateGasLimit({ asset, recipient, amount, memo, from: sender })
      } catch (error) {
        txGasLimit = eqAsset(asset, this.getAssetInfo().asset)
          ? this.defaults[this.network].transferGasAssetGasLimit
          : this.defaults[this.network].transferTokenGasLimit
      }
    } else {
      txGasLimit = gasLimit
    }
    // Prepare the transaction
    const { rawUnsignedTx } = await this.prepareTx({
      sender,
      recipient,
      amount,
      asset,
      memo,
    })

    const transactionRequest = ethers.utils.parseTransaction(rawUnsignedTx)

    const tx = await ethers.utils.resolveProperties(transactionRequest)
    const baseTx = {
      type: feeData.gasPrice ? 1 : 2, // Type 2 for EIP-1559
      chainId: tx.chainId || undefined,
      data: tx.data || undefined,
      gasLimit: txGasLimit || undefined,
      gasPrice: feeData.gasPrice || undefined,
      maxFeePerGas: feeData.maxFeePerGas || undefined,
      maxPriorityFeePerGas: feeData.maxPriorityFeePerGas || undefined,
      nonce: tx.nonce ? ethers.BigNumber.from(tx.nonce).toNumber() : undefined,
      to: tx.to || undefined,
      value: tx.value || undefined,
    }

    // Populate the transaction with necessary details
    const unsignedTx = ethers.utils.serializeTransaction(baseTx).substring(2)

    const resolution = await ledgerService.resolveTransaction(unsignedTx, {}, { externalPlugins: true, erc20: true })

    const ethApp = await this.getApp()

    const signatureData = await ethApp.signTransaction(
      this.getFullDerivationPath(walletIndex || 0),
      unsignedTx,
      resolution,
    )

    const rawSignedTx = ethers.utils.serializeTransaction(baseTx, {
      v: Number(BigInt(signatureData.v)),
      r: `0x${signatureData.r}`,
      s: `0x${signatureData.s}`,
    })
    // Send the transaction and return the hash
    return await this.broadcastTx(rawSignedTx)
  }

  /**
   * Approves an allowance for spending tokens.
   *
   * @param {ApproveParams} params - Parameters for approving an allowance.
   * @param {Address} contractAddress The contract address.
   * @param {Address} spenderAddress The spender address.
   * @param {feeOption} FeeOption Fee option (optional)
   * @param {BaseAmount} amount The amount of token. By default, it will be unlimited token allowance. (optional)
   * @param {number} walletIndex (optional) HD wallet index
   * @returns {TransactionResponse} The result of the approval transaction.
   * @throws Error If gas estimation fails.
   */
  public async approve({
    contractAddress,
    spenderAddress,
    feeOption = FeeOption.Fastest,
    amount,
    walletIndex = 0,
  }: ApproveParams): Promise<string> {
    const sender = await this.getAddressAsync(walletIndex || 0)

    const gasPrice: BigNumber = BigNumber.from(
      (await this.estimateGasPrices().then((prices) => prices[feeOption])).amount().toFixed(),
    )

    checkFeeBounds(this.feeBounds, gasPrice.toNumber())

    const gasLimit: BigNumber = await this.estimateApprove({
      spenderAddress,
      contractAddress,
      fromAddress: sender,
      amount,
    }).catch(() => {
      return BigNumber.from(this.config.defaults[this.network].approveGasLimit)
    })

    const { rawUnsignedTx } = await this.prepareApprove({
      contractAddress,
      spenderAddress,
      amount,
      sender,
    })

    const transactionRequest = ethers.utils.parseTransaction(rawUnsignedTx)

    const tx = await ethers.utils.resolveProperties(transactionRequest)
    const baseTx = {
      type: 1,
      chainId: tx.chainId || undefined,
      data: tx.data || undefined,
      gasLimit,
      gasPrice,
      nonce: tx.nonce ? ethers.BigNumber.from(tx.nonce).toNumber() : undefined,
      to: tx.to || undefined,
      value: tx.value || undefined,
    }

    // Populate the transaction with necessary details
    const unsignedTx = ethers.utils.serializeTransaction(baseTx).substring(2)

    const resolution = await ledgerService.resolveTransaction(unsignedTx, {}, { externalPlugins: true, erc20: true })

    const ethApp = await this.getApp()
    const signatureData = await ethApp.signTransaction(
      this.getFullDerivationPath(walletIndex || 0),
      unsignedTx,
      resolution,
    )

    const rawSignedTx = ethers.utils.serializeTransaction(baseTx, {
      v: Number(BigInt(signatureData.v)),
      r: `0x${signatureData.r}`,
      s: `0x${signatureData.s}`,
    })
    // Send the transaction and return the hash
    return await this.broadcastTx(rawSignedTx)
  }
}
