import { FeeOption, TxHash, TxParams, checkFeeBounds } from '@xchainjs/xchain-client'
import { Address, BaseAmount, eqAsset } from '@xchainjs/xchain-util'
import { BigNumber, Wallet, ethers } from 'ethers'
import { HDNode } from 'ethers/lib/utils'

import { Client } from './client'
import { ApproveParams } from './types'

export class ClientKeystore extends Client {
  private hdNode?: HDNode

  /**
   * Validates the given Ethereum address.
   * @param {Address} address - The address to validate.
   * @returns {boolean} `true` if the address is valid, `false` otherwise.
   */
  public setPhrase(phrase: string, walletIndex = 0): Address {
    this.hdNode = HDNode.fromMnemonic(phrase)
    return super.setPhrase(phrase, walletIndex)
  }

  /**
   * Purges the client, resetting it to initial state.
   *
   * @returns {void}
   */
  public purgeClient(): void {
    super.purgeClient()
    this.hdNode = undefined
  }

  /**
   * @deprecated Use getAddressAsync instead. This function will eventually be removed.
   */
  public getAddress(walletIndex = 0): Address {
    if (walletIndex < 0) {
      throw new Error('index must be greater than or equal to zero')
    }
    if (!this.hdNode) {
      throw new Error('HDNode is not defined. Make sure phrase has been provided.')
    }
    return this.hdNode.derivePath(this.getFullDerivationPath(walletIndex)).address.toLowerCase()
  }

  /**
   * Get the current address.
   * Asynchronously gets the current address.
   * @param {number} walletIndex The current address.
   * @returns {Address} The current address.
   *
   * @throws Error
   * @throws {Error} Thrown if HDNode is not defined, indicating that a phrase is needed to derive an address.
   * @throws {Error} Thrown if wallet index < 0.
   */
  /**
   *
   * @param {number} walletIndex (optional) Index of the HD wallet.
   * @returns {Promise<Address>} The current address.
   * @throws {Error} Thrown if wallet index < 0.
   */
  public async getAddressAsync(walletIndex = 0): Promise<Address> {
    return this.getAddress(walletIndex)
  }

  /**
   * Retrieves the Ethereum wallet interface.
   * @param {number} walletIndex - The index of the HD wallet (optional).
   * @returns {Wallet} The current Ethereum wallet interface.
   * @throws Error - Thrown if the HDNode is not defined, indicating that a phrase is needed to create a wallet and derive an address.
   * Note: A phrase is needed to create a wallet and to derive an address from it.
   */
  public getWallet(walletIndex = 0): ethers.Wallet {
    if (!this.hdNode) {
      throw new Error('HDNode is not defined. Make sure phrase has been provided.')
    }
    return new Wallet(this.hdNode.derivePath(this.getFullDerivationPath(walletIndex))).connect(this.getProvider())
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
  }): Promise<TxHash> {
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
    // Parse the transaction request
    const transactionRequest = ethers.utils.parseTransaction(rawUnsignedTx)
    // Get the signer
    const signer = this.getWallet()
    // Populate the transaction with necessary details
    const tx = await signer.populateTransaction({
      from: transactionRequest.from,
      to: transactionRequest.to,
      data: transactionRequest.data,
      value: transactionRequest.value,
      gasLimit: txGasLimit,
      gasPrice: feeData.gasPrice || undefined,
      maxPriorityFeePerGas: feeData.maxPriorityFeePerGas || undefined,
      maxFeePerGas: feeData.maxFeePerGas || undefined,
    })
    // Send the transaction and return the hash
    const { hash } = await signer.sendTransaction(tx)

    return hash
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

    const transaction = ethers.utils.parseTransaction(rawUnsignedTx)

    const result = await this.getWallet().sendTransaction({
      from: transaction.from,
      to: transaction.to,
      value: transaction.value,
      data: transaction.data,
      gasPrice,
      gasLimit,
    })

    return result.hash
  }
}
