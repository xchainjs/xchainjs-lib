import { validatePhrase } from '@xchainjs/xchain-crypto'
import { Address, Asset, Chain } from '@xchainjs/xchain-util'
import axios from 'axios'
/**
 * This abstract class serves as the base for XChain clients.
 * It provides common functionality and abstract methods that concrete XChain clients must implement.
 */
import {
  AssetInfo,
  Balance,
  FeeBounds,
  FeeRate,
  Fees,
  Network,
  PreparedTx,
  RootDerivationPaths,
  Tx,
  TxHash,
  TxHistoryParams,
  TxParams,
  TxsPage,
  XChainClient,
  XChainClientParams,
} from './types'

const MAINNET_THORNODE_API_BASE = 'https://thornode.ninerealms.com/thorchain'
const STAGENET_THORNODE_API_BASE = 'https://stagenet-thornode.ninerealms.com/thorchain'
const TESTNET_THORNODE_API_BASE = 'https://testnet.thornode.thorchain.info/thorchain'

export abstract class BaseXChainClient implements XChainClient {
  protected chain: Chain // The blockchain chain identifier
  protected network: Network // The network (e.g., Mainnet, Testnet, Stagenet)
  protected feeBounds: FeeBounds // The fee bounds for transactions
  protected phrase = '' // The mnemonic phrase used for wallet generation
  protected rootDerivationPaths: RootDerivationPaths | undefined // The root derivation paths for HD wallets

  /**
   * Constructor for the BaseXChainClient class.
   * Initializes the client with the provided chain and parameters.
   * @param {Chain} chain The blockchain chain identifier
   * @param {XChainClientParams} params The client parameters, including network, fee bounds, and root derivation paths
   * @throws {"Invalid phrase"} Thrown if an invalid mnemonic phrase is provided
   */
  constructor(chain: Chain, params: XChainClientParams) {
    // Initialize class properties
    this.chain = chain
    this.network = params.network || Network.Testnet
    this.feeBounds = params.feeBounds || { lower: 1, upper: Infinity }

    // Warn if using Stagenet for real assets
    if (this.network === Network.Stagenet) console.warn('WARNING: This is using stagenet! Real assets are being used!')

    if (params.rootDerivationPaths) this.rootDerivationPaths = params.rootDerivationPaths

    // Set the mnemonic phrase if provided
    if (params.phrase) {
      if (!validatePhrase(params.phrase)) {
        throw new Error('Invalid phrase')
      }
      this.phrase = params.phrase
    }
  }

  /**
   * Set or update the current network.
   * @param {Network} network The network to set
   * @returns {void}
   * @throws {"Network must be provided"} Thrown if no network is provided
   */
  public setNetwork(network: Network): void {
    if (!network) {
      throw new Error('Network must be provided')
    }
    this.network = network

    // Warn if using Stagenet for real assets
    if (this.network === Network.Stagenet) console.warn('WARNING: This is using stagenet! Real assets are being used!')
  }

  /**
   * Get the current network.
   * @returns {Network} The current network
   */
  public getNetwork(): Network {
    return this.network
  }

  /**
   * Get the fee rate from the Thorchain API.
   * @returns {Promise<FeeRate>} The fee rate
   */
  protected async getFeeRateFromThorchain(): Promise<FeeRate> {
    const respData = await this.thornodeAPIGet('/inbound_addresses')
    if (!Array.isArray(respData)) throw new Error('bad response from Thornode API')
    const chainData: { chain: Chain; gas_rate: string } = respData.find(
      (elem) => elem.chain === this.chain && typeof elem.gas_rate === 'string',
    )
    if (!chainData) throw new Error(`Thornode API /inbound_addresses does not contain fees for ${this.chain}`)
    return Number(chainData.gas_rate)
  }

  /**
   * Make a GET request to the Thorchain API.
   * @param {string} endpoint The API endpoint
   * @returns {Promise<unknown>} The response data
   */
  protected async thornodeAPIGet(endpoint: string): Promise<unknown> {
    const url = (() => {
      switch (this.network) {
        case Network.Mainnet:
          return MAINNET_THORNODE_API_BASE
        case Network.Stagenet:
          return STAGENET_THORNODE_API_BASE
        case Network.Testnet:
          return TESTNET_THORNODE_API_BASE
      }
    })()
    return (await axios.get(url + endpoint)).data
  }

  /**
   * Set or update the mnemonic phrase.
   * @param {string} phrase The new mnemonic phrase
   * @param {number} walletIndex (Optional) The HD wallet index
   * @returns {Address} The address derived from the provided phrase
   * @throws {"Invalid phrase"} Thrown if an invalid mnemonic phrase is provided
   */
  public setPhrase(phrase: string, walletIndex = 0): Address {
    if (this.phrase !== phrase) {
      if (!validatePhrase(phrase)) {
        throw new Error('Invalid phrase')
      }
      this.phrase = phrase
    }

    return this.getAddress(walletIndex)
  }

  /**
   * Get the full derivation path based on the wallet index.
   * @param {number} walletIndex The HD wallet index
   * @returns {string} The full derivation path
   */
  protected getFullDerivationPath(walletIndex: number): string {
    return this.rootDerivationPaths ? `${this.rootDerivationPaths[this.network]}${walletIndex}` : ''
  }

  /**
   * Purge the client by clearing the mnemonic phrase.
   * @returns {void}
   */
  public purgeClient(): void {
    this.phrase = ''
  }

  // Abstract methods that must be implemented by concrete XChain clients
  abstract getFees(): Promise<Fees>
  abstract getAddress(walletIndex?: number): string
  abstract getAddressAsync(walletIndex?: number): Promise<string>
  abstract getExplorerUrl(): string
  abstract getExplorerAddressUrl(address: string): string
  abstract getExplorerTxUrl(txID: string): string
  abstract validateAddress(address: string): boolean
  abstract getBalance(address: string, assets?: Asset[]): Promise<Balance[]>
  abstract getTransactions(params?: TxHistoryParams): Promise<TxsPage>
  abstract getTransactionData(txId: string, assetAddress?: string): Promise<Tx>
  abstract transfer(params: TxParams): Promise<string>
  abstract broadcastTx(txHex: string): Promise<TxHash>
  abstract getAssetInfo(): AssetInfo
  abstract prepareTx(params: TxParams): Promise<PreparedTx>
}
