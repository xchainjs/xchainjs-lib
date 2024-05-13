import AppEth, { ledgerService } from '@ledgerhq/hw-app-eth'
import Transport from '@ledgerhq/hw-transport'
import { Address } from '@xchainjs/xchain-util'
import { ethers } from 'ethers'

import { SignApproveParams, SignTransferParams } from '../types'

import { Signer, SignerParams } from './signer'

/**
 * Ledger signer parameters
 */
export type LedgerSignerParams = SignerParams & { transport: Transport }

/**
 * Signer which operates with an EVM account through the Ledger device
 */
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

  /**
   * Purge signer
   */
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
   * Sign an EVM transaction with Ledger
   *
   * @param {SignTransferParams} params Sign transfer params
   * @param {string} SignTransferParams.sender Fee option (optional)
   * @param {ethers.Transaction} SignTransferParams.tx Fee option (optional)
   * @returns {string} The raw signed transaction.
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
    return rawSignedTx
  }

  /**
   * Sign an EVM approve transaction with Ledger
   *
   * @param {SignTransferParams} params Sign transfer params
   * @param {string} SignTransferParams.sender The sender address
   * @param {ethers.Transaction} SignTransferParams.tx Approve transaction to sign
   * @returns {string} The raw signed transaction.
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
    return rawSignedTx
  }
}
