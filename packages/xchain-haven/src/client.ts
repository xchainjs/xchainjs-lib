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

import { AssetXHV, getAssetByTicker } from './assets'
import { HavenCoreClient } from './haven/haven-core-client'
import { HavenBalance, HavenTicker } from './haven/types'
import { HavenClient } from './types/client-types'

// rootDerivationPaths = {
//   [Network.Mainnet]: `m/44'/60'/0'/0/`,
//   [Network.Testnet]: `m/44'/60'/0'/0/`, // this is INCORRECT but makes the unit tests pass
//   [Network.Stagenet]: `m/44'/60'/0'/0/`,

class Client extends BaseXChainClient implements XChainClient, HavenClient {
  protected havenCoreClient: HavenCoreClient

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
    this.havenCoreClient = new HavenCoreClient()
    if (this.phrase) {
      this.initCoreClient(this.phrase, this.network)
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

    Object.entries(feePriorities).forEach(async ([feeOption, priority]) => {
      const feeAmount = await this.havenCoreClient.estimateFees(priority)
      const feeBaseAmount = baseAmount(feeAmount, 12)
      fees[feeOption as FeeOption] = feeBaseAmount
    })

    fees.type = FeeType.PerByte
    return fees
  }
  getAddress(_walletIndex?: number): string {
    throw new Error('please use getAddressAsync')
  }
  async getAddressAsync(_walletIndex?: number): Promise<Address> {
    const address = await this.havenCoreClient.getAddress()
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
    const havenBalance: HavenBalance = await this.havenCoreClient.getBalance()

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

  validateAddress(_address: string): boolean {
    throw new Error('please use validateAsync')
  }

  async validateAddressAsync(address: string): Promise<boolean> {
    const isValid = await this.havenCoreClient.validateAddress(address)
    return isValid
  }

  override setPhrase(_phrase: string, _walletIndex?: number): Address {
    throw new Error('please use setPhraseAsync')
  }

  async setPhraseAsync(phrase: string, _walletIndex?: number): Promise<Address> {
    if (this.phrase !== phrase) {
      if (!validatePhrase(phrase)) {
        throw new Error('Invalid phrase')
      }
      this.phrase = phrase
      await this.initCoreClient(this.phrase, this.network)
    }
    const address = await this.getAddressAsync()
    return address
  }

  async getTransactions(params?: TxHistoryParams): Promise<TxsPage> {
    const asset: Asset = params?.asset ? assetFromString(params.asset)! : AssetXHV
    const ticker = asset.ticker
    let transactions = await this.havenCoreClient.getTransactions()
    // filter if we either send or received coins for requested asset
    transactions = ticker
      ? transactions.filter((tx, _) => {
          if (tx.from_asset_type == ticker && baseAmount(tx.fromAmount, 12).gt('0')) {
            return true
          }

          if (tx.to_asset_type == ticker && baseAmount(tx.toAmount, 12).gt('0')) {
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
    transactions = limit ? transactions.filter((_, index) => index >= offset && index <= limit) : transactions

    const txs: Tx[] = transactions.map((havenTx, _) => {
      // if we exchanged to ourself in the past with Havens own exchange mechanics, we have an out and incoming tx
      // if request is limited by an asset, we will only take by the one which matches it
      const isOut: boolean =
        baseAmount(havenTx.fromAmount, 12).gt('0') &&
        (params?.asset === undefined || (params?.asset !== undefined && havenTx.from_asset_type == params.asset))

      const isIn: boolean =
        baseAmount(havenTx.toAmount, 12).gt('0') &&
        (params?.asset === undefined || (params?.asset !== undefined && havenTx.to_asset_type == params.asset))

      const from: Array<TxFrom> = isOut
        ? [{ amount: baseAmount(havenTx.fromAmount, 12), asset: undefined, from: havenTx.hash }]
        : []
      const to: Array<TxTo> = isIn
        ? [{ amount: baseAmount(havenTx.toAmount, 12), asset: undefined, to: havenTx.hash }]
        : []

      const tx: Tx = {
        hash: havenTx.hash,
        date: new Date(havenTx.timestamp),
        type: isIn && isOut ? TxType.Unknown : TxType.Transfer,
        from,
        to,
        asset: asset,
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
    const havenTx = await this.havenCoreClient.getTx(txId)

    const isOut: boolean = baseAmount(havenTx.fromAmount, 12).gt('0')
    const isIn: boolean = baseAmount(havenTx.toAmount, 12).gt('0')

    const from: Array<TxFrom> = isOut
      ? [{ amount: baseAmount(havenTx.fromAmount, 12), asset: undefined, from: havenTx.hash }]
      : []
    const to: Array<TxTo> = isIn
      ? [{ amount: baseAmount(havenTx.toAmount, 12), asset: undefined, to: havenTx.hash }]
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
  transfer(params: TxParams): Promise<TxHash> {
    const { amount, asset, recipient, memo } = params
    if (asset === undefined) throw 'please specify asset it in Client.transfer() for Haven'
    const amountString = amount.amount.toString()
    return this.havenCoreClient.transfer(amountString, asset.ticker as HavenTicker, recipient, memo)
  }
  isSyncing(): boolean {
    throw new Error('Method not implemented.')
  }
  syncHeight(): number {
    throw new Error('Method not implemented.')
  }
  blockHeight(): number {
    throw new Error('Method not implemented.')
  }

  private async initCoreClient(phrase: string, network: Network) {
    const havenSeed = await convertBip39ToHavenMnemonic(phrase, '')
    this.havenCoreClient.init(havenSeed, network)
  }
}
export { Client }
