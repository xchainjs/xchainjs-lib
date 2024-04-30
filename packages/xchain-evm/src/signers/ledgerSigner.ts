import AppEth, { ledgerService } from '@ledgerhq/hw-app-eth'
import Transport from '@ledgerhq/hw-transport'
import { Address } from '@xchainjs/xchain-util'
import { ethers } from 'ethers'

import { SignApproveParams, SignTransferParams } from '../types'

import { Signer, SignerParams } from './signer'

export type LedgerSignerParams = SignerParams & { transport: Transport }

export class LedgerSigner extends Signer {
  private app: AppEth

  constructor(params: LedgerSignerParams) {
    super(params)
    this.app = new AppEth(params.transport)
  }

  /**
   * Get ethereum ledger app
   * @returns {AppEth} Ethereum ledger app
   */
  public getApp(): AppEth {
    return this.app
  }

  public purge() {}

  /**
   * Get the current address.
   * @param {number} index The index of the address. Default 0
   * @param {boolean} verify True to check the address against the Ledger device, otherwise false
   * @returns {Address} The address corresponding to the index provided
   * @returns
   */
  public async getAddressAsync(index = 0, verify = false): Promise<Address> {
    if (index < 0) throw Error('Index must be greater than or equal to zero')
    const app = this.getApp()
    const result = await app.getAddress(this.getFullDerivationPath(index), verify)
    return result.address
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
  public async signTransfer({ sender, tx }: SignTransferParams): Promise<string> {
    const unsignedTx = ethers.utils.serializeTransaction(tx).substring(2)

    const resolution = await ledgerService.resolveTransaction(unsignedTx, {}, { externalPlugins: true, erc20: true })

    const ethApp = await this.getApp()

    const signatureData = await ethApp.signTransaction(sender, unsignedTx, resolution)

    const rawSignedTx = ethers.utils.serializeTransaction(tx, {
      v: Number(BigInt(signatureData.v)),
      r: `0x${signatureData.r}`,
      s: `0x${signatureData.s}`,
    })
    // Send the transaction and return the hash
    return rawSignedTx
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
    const txCompleted = await ethers.utils.resolveProperties(tx)

    const baseTx = {
      type: 1,
      chainId: tx.chainId || undefined,
      data: tx.data || undefined,
      gasLimit: txCompleted.gasLimit,
      gasPrice: txCompleted.gasPrice,
      nonce: tx.nonce ? ethers.BigNumber.from(tx.nonce).toNumber() : undefined,
      to: tx.to || undefined,
      value: tx.value || undefined,
    }

    // Populate the transaction with necessary details
    const unsignedTx = ethers.utils.serializeTransaction(baseTx).substring(2)

    const resolution = await ledgerService.resolveTransaction(unsignedTx, {}, { externalPlugins: true, erc20: true })

    const ethApp = await this.getApp()
    const signatureData = await ethApp.signTransaction(sender, unsignedTx, resolution)

    const rawSignedTx = ethers.utils.serializeTransaction(baseTx, {
      v: Number(BigInt(signatureData.v)),
      r: `0x${signatureData.r}`,
      s: `0x${signatureData.s}`,
    })
    // Send the transaction and return the hash
    return rawSignedTx
  }
}
