import { validatePhrase } from '@xchainjs/xchain-crypto'
import { Address, AnyAsset, Chain } from '@xchainjs/xchain-util'
import axios from 'axios'
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

const MAINNET_THORNODE_API_BASE = 'https://gateway.liquify.com/chain/thorchain_api/thorchain'
const STAGENET_THORNODE_API_BASE = ''
const TESTNET_THORNODE_API_BASE = 'https://testnet.thornode.thorchain.info/thorchain'

const MAINNET_MAYANODE_API_BASE = 'https://mayanode.mayachain.info/mayachain'
const STAGENET_MAYANODE_API_BASE = 'https://stagenet.mayanode.mayachain.info/mayachain'
const TESTNET_MAYANODE_API_BASE = 'https://testnet.mayanode.mayachain.info/mayachain'

export abstract class BaseXChainClient implements XChainClient {
  protected chain: Chain
  protected network: Network
  protected feeBounds: FeeBounds
  protected phrase = '' // Mnemonic used for wallet derivation
  protected rootDerivationPaths: RootDerivationPaths | undefined

  constructor(chain: Chain, params: XChainClientParams) {
    this.chain = chain
    this.network = params.network || Network.Testnet
    this.feeBounds = params.feeBounds || { lower: 1, upper: Infinity }

    if (this.network === Network.Stagenet) console.warn('WARNING: This is using stagenet! Real assets are being used!')

    if (params.rootDerivationPaths) this.rootDerivationPaths = params.rootDerivationPaths

    if (params.phrase) {
      if (!validatePhrase(params.phrase)) {
        throw new Error('Invalid phrase')
      }
      this.phrase = params.phrase
    }
  }

  public setNetwork(network: Network): void {
    if (!network) {
      throw new Error('Network must be provided')
    }
    this.network = network

    if (this.network === Network.Stagenet) console.warn('WARNING: This is using stagenet! Real assets are being used!')
  }

  public getNetwork(): Network {
    return this.network
  }

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

    // EVM clients expect gwei and multiply by 10^9 to get wei.
    // UTXO clients expect satoshis per byte directly.
    switch (gasRateUnits) {
      case 'gwei':
        return gasRate // Already in gwei for EVM chains
      case 'mwei':
        return gasRate / 1e3 // mwei to gwei (1 mwei = 0.001 gwei)
      case 'centigwei':
        return gasRate / 100 // centigwei to gwei
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

    switch (this.chain) {
      case 'AVAX':
        // nAVAX = nano AVAX = 10^-9 AVAX = gwei equivalent
        // Already in the right unit for EVM client
        if (gasRateUnits !== 'nAVAX') {
          console.warn(`Unexpected gas_rate_units for AVAX: ${gasRateUnits}`)
        }
        return gasRate

      default:
        // Nano-prefixed units (nETH, nBSC, etc.) are gwei equivalent
        if (gasRateUnits.startsWith('n') && gasRateUnits.length > 1) {
          return gasRate
        }
        // Micro-prefixed units (uatom, etc.) are returned as-is for Cosmos chains
        if (gasRateUnits.startsWith('u') && gasRateUnits.length > 1) {
          return gasRate
        }
        break
    }

    console.warn(`Unknown gas_rate_units "${gasRateUnits}" for chain ${this.chain}. Using raw value.`)
    return gasRate
  }

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

    if (gasRateUnits) {
      console.debug(`Mayachain gas_rate for ${this.chain}: ${gasRate} ${gasRateUnits}`)
    }

    // Prefer unit-based conversion (parity with Thornode logic)
    switch (gasRateUnits) {
      case 'gwei':
        return gasRate
      case 'mwei':
        return gasRate / 1e3
      case 'centigwei':
        return gasRate / 100
      case 'satsperbyte':
        return gasRate
      case 'drop':
        return gasRate
      case 'uatom':
        return gasRate
      default:
        // Chain-specific fallbacks for nano/micro prefixes
        if (gasRateUnits.startsWith('n') && gasRateUnits.length > 1) return gasRate
        if (gasRateUnits.startsWith('u') && gasRateUnits.length > 1) return gasRate
        console.warn(`Unknown gas_rate_units "${gasRateUnits}" for chain ${this.chain} on Mayachain. Using raw value.`)
        return gasRate
    }
  }

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

  public setPhrase(phrase: string, walletIndex = 0): Address {
    if (this.phrase !== phrase) {
      if (!validatePhrase(phrase)) {
        throw new Error('Invalid phrase')
      }
      this.phrase = phrase
    }

    return this.getAddress(walletIndex)
  }

  protected getFullDerivationPath(walletIndex: number): string {
    return this.rootDerivationPaths ? `${this.rootDerivationPaths[this.network]}${walletIndex}` : ''
  }

  public purgeClient(): void {
    this.phrase = ''
  }

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
