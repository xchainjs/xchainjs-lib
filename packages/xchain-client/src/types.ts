import { Address, AnyAsset, Asset, BaseAmount, SynthAsset, TokenAsset, TradeAsset } from '@xchainjs/xchain-util'

export enum Network {
  Mainnet = 'mainnet',
  Stagenet = 'stagenet',
  Testnet = 'testnet',
}

export type AssetInfo = {
  asset: Asset
  decimal: number
}

export type TokenAssetInfo = {
  asset: TokenAsset
  decimal: number
}

export type SynthAssetInfo = {
  asset: SynthAsset
  decimal: number
}

export type TradeAssetInfo = {
  asset: TradeAsset
  decimal: number
}

export type Balance = {
  asset: AnyAsset
  amount: BaseAmount
}

export enum TxType {
  Transfer = 'transfer',
  Unknown = 'unknown',
}

export type TxHash = string

export type TxTo = {
  to: Address
  amount: BaseAmount
  asset?: AnyAsset
}

export type TxFrom = {
  from: string // The sender Address or the TxHash
  amount: BaseAmount
  asset?: AnyAsset
}

export type Tx = {
  asset: AnyAsset
  from: TxFrom[]
  to: TxTo[]
  date: Date
  type: TxType
  hash: string
}

export type TxsPage = {
  total: number
  txs: Tx[]
}

export type TxHistoryParams = {
  address: Address
  offset?: number
  limit?: number
  startTime?: Date
  asset?: string // Result transactions are filtered to this asset
}

export type TxParams = {
  walletIndex?: number // Send from this HD index
  asset?: AnyAsset
  amount: BaseAmount
  recipient: Address
  memo?: string
}

export type FeeEstimateOptions = {
  memo?: string
  sender?: string
}

export enum FeeOption {
  Average = 'average',
  Fast = 'fast',
  Fastest = 'fastest',
}

export type FeeRate = number

export type FeeRates = Record<FeeOption, FeeRate>

export enum FeeType {
  FlatFee = 'base',
  PerByte = 'byte',
}

export type Fee = BaseAmount

export type Fees = Record<FeeOption, Fee> & {
  type: FeeType
}

export type FeesWithRates = { rates: FeeRates; fees: Fees }

export type FeeBounds = { lower: number; upper: number }

export type RootDerivationPaths = Record<Network, string>

export type XChainClientParams = {
  network?: Network
  phrase?: string
  feeBounds?: FeeBounds
  rootDerivationPaths?: RootDerivationPaths
}

export type PreparedTx = {
  rawUnsignedTx: string
}

export interface XChainClient {
  setNetwork(net: Network): void
  getNetwork(): Network
  getExplorerUrl(): string
  getExplorerAddressUrl(address: Address): string
  getExplorerTxUrl(txID: string): string
  validateAddress(address: string): boolean
  getAddress(walletIndex?: number): Address
  getAddressAsync(walletIndex?: number): Promise<Address>
  setPhrase(phrase: string, walletIndex: number): Address
  getBalance(address: Address, assets?: AnyAsset[]): Promise<Balance[]>
  getTransactions(params?: TxHistoryParams): Promise<TxsPage>
  getTransactionData(txId: string, assetAddress?: Address): Promise<Tx>
  getFees(options?: FeeEstimateOptions): Promise<Fees>
  transfer(params: TxParams): Promise<TxHash>
  prepareTx(params: TxParams): Promise<PreparedTx>
  broadcastTx(txHex: string): Promise<TxHash>
  purgeClient(): void
  getAssetInfo(): AssetInfo
}
