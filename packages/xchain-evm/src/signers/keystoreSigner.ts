import { TxHash } from '@xchainjs/xchain-client'
import { validatePhrase } from '@xchainjs/xchain-crypto'
import { Address } from '@xchainjs/xchain-util'
import { Wallet, ethers } from 'ethers'
import { HDNode } from 'ethers/lib/utils'

import { IKeystoreSigner, SignApproveParams, SignTransferParams } from '../types'

import { Signer, SignerParams } from './signer'

export type KeystoreSignerParams = SignerParams & { phrase: string }

export class KeystoreSigner extends Signer implements IKeystoreSigner {
  private hdNode?: HDNode
  private phrase?: string

  constructor(params: KeystoreSignerParams) {
    super(params)
    this.hdNode = HDNode.fromMnemonic(params.phrase)
    this.phrase = params.phrase
  }

  /**
   * Validates the given Ethereum address.
   * @param {Address} address - The address to validate.
   * @returns {boolean} `true` if the address is valid, `false` otherwise.
   */
  public setPhrase(phrase: string, walletIndex = 0): Address {
    if (this.phrase !== phrase) {
      if (!validatePhrase(phrase)) {
        throw new Error('Invalid phrase')
      }
      this.phrase = phrase
      this.hdNode = HDNode.fromMnemonic(phrase)
    }

    return this.getAddress(walletIndex)
  }

  /**
   * Purges the client, resetting it to initial state.
   *
   * @returns {void}
   */
  public purge(): void {
    this.hdNode = undefined
    this.phrase = undefined
  }

  /**
   * @deprecated Use getAddressAsync instead. This function will eventually be removed.
   */
  public getAddress(walletIndex = 0): Address {
    if (walletIndex < 0) {
      throw new Error('Index must be greater than or equal to zero')
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
   * @throws {Error} Thrown if HDNode is not defined, indicating that a phrase is needed to derive an address.
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
  public async signTransfer({ sender, tx }: SignTransferParams): Promise<TxHash> {
    // Get the signer
    const signer = this.getWallet()
    // Populate the transaction with necessary details
    const completedTx = await signer.populateTransaction({
      from: sender,
      to: tx.to,
      data: tx.data,
      value: tx.value,
      gasLimit: tx.gasLimit,
      gasPrice: tx.gasPrice,
      maxPriorityFeePerGas: tx.maxPriorityFeePerGas,
      maxFeePerGas: tx.maxFeePerGas,
    })
    // Send the transaction and return the hash
    return signer.signTransaction(completedTx)
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
  public async signApprove({ sender, tx }: SignApproveParams): Promise<string> {
    return this.getWallet().signTransaction({
      from: sender,
      to: tx.to,
      value: tx.value,
      data: tx.data,
      gasPrice: tx.gasPrice,
      gasLimit: tx.gasLimit,
    })
  }
}
