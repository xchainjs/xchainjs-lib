import {
  Address,
  Balance,
  BaseXChainClient,
  FeeOption,
  FeeType,
  Fees,
  Network,
  Tx,
  TxFrom,
  TxHash,
  TxHistoryParams,
  TxParams,
  TxTo,
  TxType,
  TxsPage,
  XChainClient,
  XChainClientParams,
} from '@xchainjs/xchain-client'
import { validatePhrase } from '@xchainjs/xchain-crypto'
import { Asset, Chain, assetFromString, baseAmount } from '@xchainjs/xchain-util'
import { convertBip39ToHavenMnemonic } from 'mnemonicconverter'

import { getAssetByTicker } from './assets'
import { HavenCoreClient } from './haven/haven-core-client'
import { HavenBalance, HavenTicker, SyncObserver } from './haven/types'
import { assertIsDefined } from './haven/utils'
import { HavenClient } from './types/client-types'

// rootDerivationPaths = {
//   [Network.Mainnet]: `m/44'/60'/0'/0/`,
//   [Network.Testnet]: `m/44'/60'/0'/0/`, // this is INCORRECT but makes the unit tests pass
//   [Network.Stagenet]: `m/44'/60'/0'/0/`,

class Client extends BaseXChainClient implements XChainClient, HavenClient {
  private havenSDK: HavenCoreClient
  private havenMnemonic: string | undefined

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
  constructor({
    network = Network.Testnet,
    rootDerivationPaths = {
      [Network.Mainnet]: `m/44'/535'/0'/0/`,
      [Network.Testnet]: `m/44'/535'/0'/0/`,
      [Network.Stagenet]: `m/44'/535'/0'/0/`,
    },
    phrase = '',
  }: XChainClientParams) {
    super(Chain.Haven, { network, rootDerivationPaths, phrase })
    this.havenSDK = new HavenCoreClient()
    if (this.phrase) {
      this.initSDK()
    }
  }

  async getFees(): Promise<Fees> {
    // map xchains Fee options to Havens priorites
    const feePriorities = {
      [FeeOption.Average]: 1,
      [FeeOption.Fast]: 2,
      [FeeOption.Fastest]: 4,
    }

    const fees: Fees = {} as Fees

    for (const feeOption in feePriorities) {
      const priority = feePriorities[feeOption as FeeOption]
      const feeAmount = await this.havenSDK.estimateFees(priority)
      const feeBaseAmount = baseAmount(feeAmount, 12)
      fees[feeOption as FeeOption] = feeBaseAmount
    }
    fees.type = FeeType.PerByte
    return fees
  }
  getAddress(_walletIndex?: number): string {
    assertIsDefined(this.phrase)
    const address = this.havenSDK.getAddress()
    return address
  }

  getExplorerUrl(): string {
    const explorerLink = `https://explorer${
      this.network === Network.Mainnet ? '' : '-' + this.network
    }.havenprotocol.org`
    return explorerLink
  }
  getExplorerAddressUrl(_address: string): string {
    throw new Error('cannot lookup addresses in explorer for haven')
  }
  getExplorerTxUrl(txID: string): string {
    return `${this.getExplorerUrl()}/tx/${txID}`
  }
  async getBalance(_address: string, assets?: Asset[]): Promise<Balance[]> {
    const havenBalance: HavenBalance = await this.havenSDK.getBalance()

    //TODO return all asset balances when no assets param provided?
    const balances: Balance[] = []

    if (assets) {
      assets.forEach((asset) => {
        const assetBalance: Balance = {
          asset,
          amount: baseAmount(havenBalance[asset.ticker as HavenTicker].balance, 12),
        }
        balances.push(assetBalance)
      })
    }

    return balances
  }

  validateAddress(address: string): boolean {
    const isValid = this.havenSDK.validateAddress(address)
    return isValid
  }

  override setPhrase(phrase: string, _walletIndex?: number): Address {
    if (this.phrase !== phrase) {
      if (!validatePhrase(phrase)) {
        throw new Error('Invalid phrase')
      }
      this.phrase = phrase
      this.initSDK()
    }
    const address = this.getAddress()
    return address
  }

  async getTransactions(params?: TxHistoryParams): Promise<TxsPage> {
    const asset: Asset | undefined = params?.asset ? assetFromString(params.asset)! : undefined
    const ticker = asset?.ticker
    let transactions = await this.havenSDK.getTransactions()

    // filter if we either send or received coins for requested asset
    transactions = ticker
      ? transactions.filter((tx, _) => {
          if (tx.from_asset_type == ticker && baseAmount(tx.total_sent[tx.from_asset_type], 12).gt('0')) {
            return true
          }

          if (tx.to_asset_type == ticker && baseAmount(tx.total_received[tx.to_asset_type], 12).gt('0')) {
            return true
          }

          return false
        })
      : transactions

    //filter by date
    transactions = params?.startTime
      ? transactions.filter((tx, _) => new Date(tx.timestamp) >= params.startTime!)
      : transactions

    const offset = params?.offset ? params.offset : 0
    const limit = params?.limit ? params.limit + offset : undefined

    // filter by offset/limit
    transactions = limit ? transactions.filter((_, index) => index >= offset && index < limit) : transactions

    const txs: Tx[] = transactions.map((havenTx, _) => {
      // if we exchanged to ourself in the past with Havens own exchange mechanics, we have an out and incoming tx
      // if request is limited by an asset, we will only take by the one which matches it
      const isOut: boolean =
        baseAmount(havenTx.total_sent[havenTx.from_asset_type], 12).gt('0') &&
        (params?.asset === undefined || (params?.asset !== undefined && havenTx.from_asset_type == params.asset))

      const isIn: boolean =
        baseAmount(havenTx.total_received[havenTx.to_asset_type], 12).gt('0') &&
        (params?.asset === undefined || (params?.asset !== undefined && havenTx.to_asset_type == params.asset))

      const from: Array<TxFrom> = isOut
        ? [
            {
              amount: baseAmount(havenTx.fromAmount, 12),
              asset: getAssetByTicker(havenTx.from_asset_type),
              from: havenTx.hash,
            },
          ]
        : []
      const to: Array<TxTo> = isIn
        ? [
            {
              amount: baseAmount(havenTx.toAmount, 12),
              asset: getAssetByTicker(havenTx.to_asset_type),
              to: havenTx.hash,
            },
          ]
        : []

      const tx: Tx = {
        hash: havenTx.hash,
        date: new Date(havenTx.timestamp),
        type: havenTx.from_asset_type === havenTx.to_asset_type ? TxType.Transfer : TxType.Unknown,
        from,
        to,
        asset: isOut ? getAssetByTicker(havenTx.from_asset_type) : getAssetByTicker(havenTx.to_asset_type),
      }

      return tx
    })

    const txPages: TxsPage = {
      txs,
      total: txs.length,
    }
    return txPages
  }
  async getTransactionData(txId: string, _assetAddress?: string): Promise<Tx> {
    const havenTx = await this.havenSDK.getTx(txId)

    const isOut: boolean = baseAmount(havenTx.total_sent[havenTx.from_asset_type], 12).gt('0')
    const isIn: boolean = baseAmount(havenTx.total_received[havenTx.to_asset_type], 12).gt('0')

    const from: Array<TxFrom> = isOut
      ? [
          {
            amount: baseAmount(havenTx.fromAmount, 12),
            asset: getAssetByTicker(havenTx.from_asset_type),
            from: havenTx.hash,
          },
        ]
      : []
    const to: Array<TxTo> = isIn
      ? [
          {
            amount: baseAmount(havenTx.toAmount, 12),
            asset: getAssetByTicker(havenTx.to_asset_type),
            to: havenTx.hash,
          },
        ]
      : []

    const asset: Asset = isOut ? getAssetByTicker(havenTx.from_asset_type) : getAssetByTicker(havenTx.to_asset_type)

    const tx: Tx = {
      hash: havenTx.hash,
      date: new Date(havenTx.timestamp),
      type: isIn && isOut ? TxType.Unknown : TxType.Transfer,
      from,
      to,
      asset,
    }
    return tx
  }

  async transfer(params: TxParams): Promise<TxHash> {
    const { amount, asset, recipient, memo } = params
    if (asset === undefined) throw new Error('please specify asset it in Client.transfer() for Haven')
    const amountString = amount.amount().toString()
    let txHash
    try {
      txHash = await this.havenSDK.transfer(amountString, asset.ticker as HavenTicker, recipient, memo)
      return txHash
    } catch (e) {
      throw new Error('Tx could not be sent')
    }
  }

  purgeClient(): void {
    super.purgeClient()
    this.havenSDK.purge()
    this.havenMnemonic = undefined
  }

  /**
   * checks if syncing is going on which can take up to a few seconds or hours
   * @returns boolean
   */
  async isSyncing(): Promise<boolean> {
    return this.havenSDK.isSyncing()
  }

  /**
   * subscribe sync progress which updates every X seconds with SyncStats
   * and notifys on completion
   * @param observer
   */
  subscribeSyncProgress(observer: SyncObserver): void {
    this.havenSDK.subscribeSyncProgress(observer)
  }

  /**
   * preloads the sdk once, so that we can use it in a synchron style,
   * function must be called and awaited once after this class is initalized
   */
  async preloadSDK(): Promise<boolean> {
    await this.havenSDK.preloadModule()
    return true
  }

  /**
   *
   * @returns {string} havenMnemonic
   */
  getHavenMnemonic(): string {
    assertIsDefined(this.havenMnemonic)
    return this.havenMnemonic
  }

  /**
   * haven SDK needs to be reinitialized when we use new phrase/account
   * client takes care of it on itself
   */
  private async initSDK() {
    assertIsDefined(this.phrase)
    assertIsDefined(this.network)
    this.havenMnemonic = convertBip39ToHavenMnemonic(this.phrase, '')
    await this.havenSDK.init(this.havenMnemonic, this.network)
  }
}
export { Client }
