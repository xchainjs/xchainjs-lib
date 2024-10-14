import { BaseAddress, Bip32PrivateKey, Credential } from '@emurgo/cardano-serialization-lib-nodejs'
import {
  AssetInfo,
  Balance,
  BaseXChainClient,
  ExplorerProviders,
  Fees,
  PreparedTx,
  Tx,
  TxHash,
  TxsPage,
} from '@xchainjs/xchain-client'
import { phraseToEntropy } from '@xchainjs/xchain-crypto'
import { Address } from '@xchainjs/xchain-util'

import { ADAAsset, ADAChain, ADA_DECIMALS, defaultAdaParams } from './const'
import { ADAClientParams } from './types'
import { getCardanoNetwork } from './utils'

export class Client extends BaseXChainClient {
  private explorerProviders: ExplorerProviders

  constructor(params: ADAClientParams = defaultAdaParams) {
    super(ADAChain, {
      ...defaultAdaParams,
      ...params,
    })
    this.explorerProviders = params.explorerProviders
  }

  /**
   * Get information about the native asset of the Cardano.
   *
   * @returns {AssetInfo} Information about the native asset.
   */
  public getAssetInfo(): AssetInfo {
    return {
      asset: ADAAsset,
      decimal: ADA_DECIMALS,
    }
  }

  /**
   * Get the explorer URL.
   *
   * @returns {string} The explorer URL.
   */
  public getExplorerUrl(): string {
    return this.explorerProviders[this.getNetwork()].getExplorerUrl()
  }

  /**
   * Get the explorer url for the given address.
   *
   * @param {Address} address
   * @returns {string} The explorer url for the given address.
   */
  public getExplorerAddressUrl(address: Address): string {
    return this.explorerProviders[this.getNetwork()].getExplorerAddressUrl(address)
  }

  /**
   * Get the explorer url for the given transaction id.
   *
   * @param {string} txID
   * @returns {string} The explorer url for the given transaction id.
   */
  public getExplorerTxUrl(txID: TxHash): string {
    return this.explorerProviders[this.getNetwork()].getExplorerTxUrl(txID)
  }

  /**
   * Get the full derivation path based on the wallet index.
   * @param {number} walletIndex The HD wallet index
   * @returns {string} The full derivation path
   */
  public getFullDerivationPath(walletIndex: number): string {
    if (!this.rootDerivationPaths) {
      throw Error('Can not generate derivation path due to root derivation path is undefined')
    }
    return `${this.rootDerivationPaths[this.getNetwork()]}${walletIndex}'`
  }

  /**
   * Get the current address asynchronously.
   *
   * @param {number} index The index of the address. Default 0
   * @returns {Address} The Cardano address related to the index provided.
   * @throws {"Phrase must be provided"} Thrown if the phrase has not been set before.
   */
  public async getAddressAsync(walletIndex = 0): Promise<string> {
    if (!this.phrase) throw new Error('Phrase must be provided')

    const rootKey = Bip32PrivateKey.from_bip39_entropy(
      Buffer.from(phraseToEntropy(this.phrase), 'hex'),
      Buffer.from(''),
    )

    const accountKey = rootKey
      .derive(1852 | 0x80000000) // 0x80000000 means hardened
      .derive(1815 | 0x80000000) // 0x80000000 means hardened
      .derive(walletIndex | 0x80000000) // 0x80000000 means hardened

    const paymentKeyPub = accountKey.derive(0).derive(0)
    const stakeKeyPub = accountKey.derive(2).derive(0)

    const baseAddress = BaseAddress.new(
      getCardanoNetwork(this.getNetwork()).network_id(),
      Credential.from_keyhash(paymentKeyPub.to_raw_key().to_public().hash()),
      Credential.from_keyhash(stakeKeyPub.to_raw_key().to_public().hash()),
    )

    return baseAddress.to_address().to_bech32()
  }

  /**
   * Get the current address synchronously.
   * @deprecated
   */
  public getAddress(): string {
    throw Error('Sync method not supported')
  }

  /**
   * Validate the given Solana address.
   * @param {string} address Solana address to validate.
   * @returns {boolean} `true` if the address is valid, `false` otherwise.
   */
  public validateAddress(): boolean {
    throw Error('Not implemented')
  }

  /**
   * Retrieves the balance of a given address.
   * @param {Address} address - The address to retrieve the balance for.
   * @param {TokenAsset[]} assets - Assets to retrieve the balance for (optional).
   * @returns {Promise<Balance[]>} An array containing the balance of the address.
   */
  public async getBalance(): Promise<Balance[]> {
    throw Error('Not implemented')
  }

  /**
   * Get transaction fees.
   *
   * @param {TxParams} params - The transaction parameters.
   * @returns {Fees} The average, fast, and fastest fees.
   * @throws {"Params need to be passed"} Thrown if parameters are not provided.
   */
  public async getFees(): Promise<Fees> {
    throw Error('Not implemented')
  }

  /**
   * Get the transaction details of a given transaction ID.
   *
   * @param {string} txId The transaction ID.
   * @returns {Tx} The transaction details.
   */
  public async getTransactionData(): Promise<Tx> {
    throw Error('Not implemented')
  }

  public async getTransactions(): Promise<TxsPage> {
    throw Error('Not implemented')
  }

  /**
   * Transfers SOL or Solana token
   *
   * @param {TxParams} params The transfer options.
   * @returns {TxHash} The transaction hash.
   */
  public async transfer(): Promise<string> {
    throw Error('Not implemented')
  }

  /**
   * Broadcast a transaction to the network
   * @param {string} txHex Raw transaction to broadcast
   * @returns {TxHash} The hash of the transaction broadcasted
   */
  public async broadcastTx(): Promise<TxHash> {
    throw Error('Not implemented')
  }

  /**
   * Prepares a transaction for transfer.
   *
   * @param {TxParams&Address} params - The transfer options.
   * @returns {Promise<PreparedTx>} The raw unsigned transaction.
   */
  public async prepareTx(): Promise<PreparedTx> {
    throw Error('Not implemented')
  }
}
