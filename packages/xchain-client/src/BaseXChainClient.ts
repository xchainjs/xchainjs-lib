import { validatePhrase } from '@xchainjs/xchain-crypto'
import { Address, Asset, Chain } from '@xchainjs/xchain-util'
import axios from 'axios'

import {
  Balance,
  FeeBounds,
  FeeRate,
  Fees,
  Network,
  RootDerivationPaths,
  Tx,
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
  protected chain: Chain
  protected network: Network
  protected feeBounds: FeeBounds
  protected phrase = ''
  protected rootDerivationPaths: RootDerivationPaths | undefined

  /**
   * Constructor
   *
   * Client has to be initialised with network type and phrase.
   * It will throw an error if an invalid phrase has been passed.
   *
   * @param {XChainClientParams} params
   *
   * @throws {"Invalid phrase"} Thrown if the given phase is invalid.
   */
  constructor(chain: Chain, params: XChainClientParams) {
    this.chain = chain
    this.network = params.network || Network.Testnet
    this.feeBounds = params.feeBounds || { lower: 1, upper: Infinity }
    // Fire off a warning in the console to indicate that stagenet and real assets are being used.
    if (this.network === Network.Stagenet) console.warn('WARNING: This is using stagenet! Real assets are being used!')
    if (params.rootDerivationPaths) this.rootDerivationPaths = params.rootDerivationPaths
    //NOTE: we don't call this.setPhrase() to vaoid generating an address and paying the perf penalty
    if (params.phrase) {
      if (!validatePhrase(params.phrase)) {
        throw new Error('Invalid phrase')
      }
      this.phrase = params.phrase
    }
  }
  /**
   * Set/update the current network.
   *
   * @param {Network} network
   * @returns {void}
   *
   * @throws {"Network must be provided"}
   * Thrown if network has not been set before.
   */
  public setNetwork(network: Network): void {
    if (!network) {
      throw new Error('Network must be provided')
    }
    this.network = network
    // Fire off a warning in the console to indicate that stagenet and real assets are being used.
    if (this.network === Network.Stagenet) console.warn('WARNING: This is using stagenet! Real assets are being used!')
  }

  /**
   * Get the current network.
   *
   * @returns {Network}
   */
  public getNetwork(): Network {
    return this.network
  }

  protected async getFeeRateFromThorchain(): Promise<FeeRate> {
    const respData = await this.thornodeAPIGet('/inbound_addresses')
    if (!Array.isArray(respData)) throw new Error('bad response from Thornode API')

    const chainData: { chain: Chain; gas_rate: string } = respData.find(
      (elem) => elem.chain === this.chain && typeof elem.gas_rate === 'string',
    )
    if (!chainData) throw new Error(`Thornode API /inbound_addresses does not contain fees for ${this.chain}`)

    return Number(chainData.gas_rate)
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

  /**
   * Set/update a new phrase
   *
   * @param {string} phrase A new phrase.
   * @param {number} walletIndex (optional) HD wallet index
   * @returns {Address} The address from the given phrase
   *
   * @throws {"Invalid phrase"}
   * Thrown if the given phase is invalid.
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
   * Get getFullDerivationPath
   *
   * @param {number} walletIndex HD wallet index
   * @returns {string} The bitcoin derivation path based on the network.
   */
  protected getFullDerivationPath(walletIndex: number): string {
    return this.rootDerivationPaths ? `${this.rootDerivationPaths[this.network]}${walletIndex}` : ''
  }
  /**
   * Purge client.
   *
   * @returns {void}
   */
  public purgeClient(): void {
    this.phrase = ''
  }
  //individual clients will need to implement these
  abstract getFees(): Promise<Fees>
  abstract getAddress(walletIndex?: number): string
  abstract getExplorerUrl(): string
  abstract getExplorerAddressUrl(address: string): string
  abstract getExplorerTxUrl(txID: string): string
  abstract validateAddress(address: string): boolean
  abstract getBalance(address: string, assets?: Asset[]): Promise<Balance[]>
  abstract getTransactions(params?: TxHistoryParams): Promise<TxsPage>
  abstract getTransactionData(txId: string, assetAddress?: string): Promise<Tx>
  abstract transfer(params: TxParams): Promise<string>
}
