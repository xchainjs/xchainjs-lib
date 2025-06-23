import { TxHash } from '@xchainjs/xchain-client'
import { validatePhrase } from '@xchainjs/xchain-crypto'
import { Address } from '@xchainjs/xchain-util'
import { HDNodeWallet, Mnemonic } from 'ethers'
import BigNumber from 'bignumber.js'

import { IKeystoreSigner, SignApproveParams, SignTransferParams } from '../types'

import { Signer, SignerParams } from './signer'

/**
 * Keystore signer parameters
 */
export type KeystoreSignerParams = SignerParams & { phrase: string }

/**
 * Signer which operates with an EVM account thanks to the seed phrase
 */
export class KeystoreSigner extends Signer implements IKeystoreSigner {
  private hdNode?: HDNodeWallet
  private phrase?: string

  constructor(params: KeystoreSignerParams) {
    super(params)
    const mnemonic = Mnemonic.fromPhrase(params.phrase)
    if (params.derivationPath.endsWith('/')) {
      params.derivationPath = params.derivationPath.slice(0, -1)
    }
    this.hdNode = HDNodeWallet.fromMnemonic(mnemonic, params.derivationPath)
    this.phrase = params.phrase
  }

  /**
   * Validates the given Ethereum address.
   *
   * @param {Address} address - The address to validate.
   * @returns {boolean} `true` if the address is valid, `false` otherwise.
   */
  public setPhrase(phrase: string, walletIndex = 0): Address {
    if (this.phrase !== phrase) {
      if (!validatePhrase(phrase)) {
        throw new Error('Invalid phrase')
      }
      this.phrase = phrase
      const mnemonic = Mnemonic.fromPhrase(phrase)
      this.hdNode = HDNodeWallet.fromMnemonic(mnemonic, this.derivationPath)
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
    const derived = this.hdNode.deriveChild(walletIndex)
    return derived.address.toLowerCase()
  }

  /**
   * Get the current address asynchronously.
   *
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
   *
   * @param {number} walletIndex - The index of the HD wallet (optional).
   * @returns {Wallet} The current Ethereum wallet interface.
   * @throws Error - Thrown if the HDNode is not defined, indicating that a phrase is needed to create a wallet and derive an address.
   * Note: A phrase is needed to create a wallet and to derive an address from it.
   */
  public getWallet(walletIndex = 0): HDNodeWallet {
    if (!this.hdNode) {
      throw new Error('HDNode is not defined. Make sure phrase has been provided.')
    }
    const derived = HDNodeWallet.fromExtendedKey(this.hdNode.extendedKey).deriveChild(walletIndex)
    derived.connect(this.getProvider())
    return derived as HDNodeWallet
  }

  /**
   * Sign an EVM transaction with Ledger
   *
   * @param {SignTransferParams} params Sign transfer params
   * @param {string} SignTransferParams.sender Fee option (optional)
   * @param {ethers.Transaction} SignTransferParams.tx Fee option (optional)
   * @returns {string} The raw signed transaction.
   */
  public async signTransfer({ walletIndex, tx }: SignTransferParams): Promise<TxHash> {
    // Get the signer
    const signer = this.getWallet(walletIndex)
    // Send the transaction and return the hash
    return signer.signTransaction(tx)
  }

  /**
   * Sign an EVM approve transaction with Ledger
   *
   * @param {SignTransferParams} params Sign transfer params
   * @param {string} SignTransferParams.sender The sender address
   * @param {ethers.Transaction} SignTransferParams.tx Approve transaction to sign
   * @returns {string} The raw signed transaction.
   */
  public async signApprove({ walletIndex, tx }: SignApproveParams): Promise<string> {
    return this.getWallet().signTransaction({
      from: await this.getAddressAsync(walletIndex),
      to: tx.to,
      value: tx.value,
      data: tx.data,
      nonce: tx.nonce ? new BigNumber(tx.nonce).toNumber() : undefined,
      gasPrice: tx.gasPrice,
      gasLimit: tx.gasLimit,
      chainId: tx.chainId,
    })
  }
}
