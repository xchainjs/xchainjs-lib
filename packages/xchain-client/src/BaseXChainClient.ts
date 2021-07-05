import { validatePhrase } from '@xchainjs/xchain-crypto'
import { Asset, Chain } from '@xchainjs/xchain-util/lib'
import axios from 'axios'

import {
  Address,
  Balances,
  FeeRates,
  Fees,
  FeesParams,
  Network,
  RootDerivationPaths,
  Tx,
  TxHistoryParams,
  TxParams,
  TxsPage,
  XChainClient,
  XChainClientParams,
} from './types'

const MAINNET_THORNODE_API_BASE = 'https://thornode.thorchain.info/thorchain'
const TESTNET_THORNODE_API_BASE = 'https://testnet.thornode.thorchain.info/thorchain'

export abstract class BaseXChainClient implements XChainClient {
  protected chain: Chain
  protected network: Network
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
    this.network = params.network || 'testnet'
    if (params.rootDerivationPaths) this.rootDerivationPaths = params.rootDerivationPaths
    if (params.phrase) this.setPhrase(params.phrase)
  }
  /**
   * Set/update the current network.
   *
   * @param {Network} network `mainnet` or `testnet`.
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
  }

  /**
   * Get the current network.
   *
   * @returns {Network} The current network. (`mainnet` or `testnet`)
   */
  public getNetwork(): Network {
    return this.network
  }

  protected async getFeeRatesFromThorchain(): Promise<FeeRates> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const respData = (await this.thornodeAPIGet('/inbound_addresses')) as any[]
    const chainData = respData.find((elem) => elem.chain === this.chain) || undefined
    if (!chainData) {
      throw new Error(`Thornode API /inbound_addresses does not cain fees for ${this.chain}`)
    }
    const feeRates: FeeRates = {
      fastest: chainData.gas_rate * 5,
      fast: chainData.gas_rate * 1,
      average: chainData.gas_rate * 0.5,
    }
    return feeRates
  }

  protected async thornodeAPIGet(endpoint: string): Promise<unknown> {
    const url = this.network === 'testnet' ? TESTNET_THORNODE_API_BASE : MAINNET_THORNODE_API_BASE
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
  abstract getFees(params?: FeesParams): Promise<Fees>
  abstract getAddress(walletIndex: number): string
  abstract getExplorerUrl(): string
  abstract getExplorerAddressUrl(address: string): string
  abstract getExplorerTxUrl(txID: string): string
  abstract validateAddress(address: string): boolean
  abstract getBalance(address: string, assets?: Asset[]): Promise<Balances>
  abstract getTransactions(params?: TxHistoryParams): Promise<TxsPage>
  abstract getTransactionData(txId: string, assetAddress?: string): Promise<Tx>
  abstract transfer(params: TxParams): Promise<string>
}
