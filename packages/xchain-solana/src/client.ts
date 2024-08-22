import { isAddress } from '@solana/addresses'
import { Keypair } from '@solana/web3.js'
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
import { getSeed } from '@xchainjs/xchain-crypto'
import { Address } from '@xchainjs/xchain-util'
import { HDKey } from 'micro-ed25519-hdkey'

import { SOLChain, defaultSolanaParams } from './const'
import { SOLClientParams } from './types'

export class Client extends BaseXChainClient {
  private explorerProviders: ExplorerProviders
  constructor(params: SOLClientParams = defaultSolanaParams) {
    super(SOLChain, {
      ...defaultSolanaParams,
      ...params,
    })
    this.explorerProviders = params.explorerProviders
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
   * Get the current address asynchronously.
   *
   * @param {number} index The index of the address.
   * @returns {Address} The Solana address related to the index provided.
   * @throws {"Phrase must be provided"} Thrown if the phrase has not been set before.
   */
  public async getAddressAsync(index?: number): Promise<string> {
    if (!this.phrase) throw new Error('Phrase must be provided')

    const seed = getSeed(this.phrase)
    const hd = HDKey.fromMasterSeed(seed.toString('hex'))

    const keypair = Keypair.fromSeed(hd.derive(this.getFullDerivationPath(index || 0)).privateKey)

    return keypair.publicKey.toBase58()
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
  public validateAddress(address: Address): boolean {
    return isAddress(address)
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

  getFees(): Promise<Fees> {
    throw new Error('Method not implemented.')
  }

  getBalance(): Promise<Balance[]> {
    throw new Error('Method not implemented.')
  }

  getTransactions(): Promise<TxsPage> {
    throw new Error('Method not implemented.')
  }

  getTransactionData(): Promise<Tx> {
    throw new Error('Method not implemented.')
  }

  transfer(): Promise<string> {
    throw new Error('Method not implemented.')
  }

  broadcastTx(): Promise<TxHash> {
    throw new Error('Method not implemented.')
  }

  getAssetInfo(): AssetInfo {
    throw new Error('Method not implemented.')
  }

  prepareTx(): Promise<PreparedTx> {
    throw new Error('Method not implemented.')
  }
}
