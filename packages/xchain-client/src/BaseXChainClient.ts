import { validatePhrase } from '@xchainjs/xchain-crypto'
import { Address, AnyAsset, Chain } from '@xchainjs/xchain-util'
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

const MAINNET_MAYANODE_API_BASE = 'https://mayanode.mayachain.info/mayachain'
const STAGENET_MAYANODE_API_BASE = 'https://stagenet.mayanode.mayachain.info/mayachain'
const TESTNET_MAYANODE_API_BASE = 'https://testnet.mayanode.mayachain.info/mayachain'

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
   * @returns {Promise<FeeRate>} The fee rate in the expected unit for each chain type
   */
  protected async getFeeRateFromThorchain(): Promise<FeeRate> {
    const respData = await this.thornodeAPIGet('/inbound_addresses')
    if (!Array.isArray(respData)) throw new Error('bad response from Thornode API')

    const chainData: {
      chain: Chain
      gas_rate: string
      gas_rate_units?: string
    } = respData.find((elem) => elem.chain === this.chain && typeof elem.gas_rate === 'string')

    if (!chainData) throw new Error(`Thornode API /inbound_addresses does not contain fees for ${this.chain}`)

    const gasRate = Number(chainData.gas_rate)
    const gasRateUnits = chainData.gas_rate_units || ''

    // Convert gas_rate based on gas_rate_units to the expected unit for each chain type
    // EVM clients expect values in gwei and will multiply by 10^9 to get wei
    // UTXO clients expect satoshis per byte directly

    // First, try unit-based conversion for common patterns
    switch (gasRateUnits) {
      case 'gwei':
        return gasRate // Already in gwei for EVM chains
      case 'mwei':
        return gasRate / 1e6 // Convert mwei to gwei
      case 'centigwei':
        return gasRate / 100 // Convert centigwei to gwei
      case 'satsperbyte':
        return gasRate // UTXO chains use this directly
      case 'drop':
        return gasRate // XRP uses drops
      case 'uatom':
        return gasRate // Cosmos chains use micro units
      default:
        // Fall back to chain-specific logic for nano units and special cases
        break
    }

    // Chain-specific handling for special cases
    switch (this.chain) {
      case 'AVAX':
        // nAVAX = nano AVAX = 10^-9 AVAX = gwei equivalent
        // Already in the right unit for EVM client
        if (gasRateUnits !== 'nAVAX') {
          console.warn(`Unexpected gas_rate_units for AVAX: ${gasRateUnits}`)
        }
        return gasRate

      default:
        // For nano-prefixed units (nETH, nBSC, etc.), treat as gwei equivalent
        if (gasRateUnits.startsWith('n') && gasRateUnits.length > 1) {
          return gasRate // nano units = gwei equivalent for EVM chains
        }
        // For micro-prefixed units (uatom, etc.), return as-is for Cosmos chains
        if (gasRateUnits.startsWith('u') && gasRateUnits.length > 1) {
          return gasRate // micro units for Cosmos chains
        }
        break
    }

    // If we reach here, log a warning but return the raw value
    console.warn(`Unknown gas_rate_units "${gasRateUnits}" for chain ${this.chain}. Using raw value.`)
    return gasRate
  }

  /**
   * Get the fee rate from the Mayachain API.
   * @returns {Promise<FeeRate>} The fee rate in the expected unit for each chain type
   */
  protected async getFeeRateFromMayachain(): Promise<FeeRate> {
    const respData = await this.mayanodeAPIGet('/inbound_addresses')
    if (!Array.isArray(respData)) throw new Error('bad response from Mayanode API')

    const chainData: {
      chain: Chain
      gas_rate: string
      gas_rate_units?: string
    } = respData.find((elem) => elem.chain === this.chain && typeof elem.gas_rate === 'string')

    if (!chainData) throw new Error(`Mayanode API /inbound_addresses does not contain fees for ${this.chain}`)

    const gasRate = Number(chainData.gas_rate)
    const gasRateUnits = chainData.gas_rate_units || ''

    // Log for debugging
    if (gasRateUnits) {
      console.debug(`Mayachain gas_rate for ${this.chain}: ${gasRate} ${gasRateUnits}`)
    }

    // Maya supports a subset of chains, using same unit conversion logic as Thorchain
    switch (this.chain) {
      case 'ETH':
        // Already in gwei, which is what EVM client expects
        if (gasRateUnits !== 'gwei') {
          console.warn(`Unexpected gas_rate_units for ETH on Maya: ${gasRateUnits}`)
        }
        return gasRate

      case 'ARB':
        // ARB returns centigwei (10^-2 gwei = 0.01 gwei), but EVM client expects gwei
        // Need to convert: centigwei to gwei = divide by 100
        if (gasRateUnits === 'centigwei') {
          return gasRate / 100
        }
        console.warn(`Unexpected gas_rate_units for ARB: ${gasRateUnits}`)
        return gasRate

      case 'BTC':
      case 'DASH':
        // UTXO chains return satsperbyte, which is what clients expect
        if (gasRateUnits !== 'satsperbyte') {
          console.warn(`Unexpected gas_rate_units for ${this.chain} on Maya: ${gasRateUnits}`)
        }
        return gasRate

      case 'KUJI':
      case 'MAYA':
      case 'THOR':
        // Cosmos-based chains return in smallest unit
        return gasRate

      default:
        console.warn(`Unknown chain ${this.chain} on Maya with gas_rate_units: ${gasRateUnits}`)
        return gasRate
    }
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
   * Make a GET request to the Mayachain API.
   * @param {string} endpoint The API endpoint
   * @returns {Promise<unknown>} The response data
   */
  protected async mayanodeAPIGet(endpoint: string): Promise<unknown> {
    const url = (() => {
      switch (this.network) {
        case Network.Mainnet:
          return MAINNET_MAYANODE_API_BASE
        case Network.Stagenet:
          return STAGENET_MAYANODE_API_BASE
        case Network.Testnet:
          return TESTNET_MAYANODE_API_BASE
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
  abstract getBalance(address: string, assets?: AnyAsset[]): Promise<Balance[]>
  abstract getTransactions(params?: TxHistoryParams): Promise<TxsPage>
  abstract getTransactionData(txId: string, assetAddress?: string): Promise<Tx>
  abstract transfer(params: TxParams): Promise<string>
  abstract broadcastTx(txHex: string): Promise<TxHash>
  abstract getAssetInfo(): AssetInfo
  abstract prepareTx(params: TxParams): Promise<PreparedTx>
}
