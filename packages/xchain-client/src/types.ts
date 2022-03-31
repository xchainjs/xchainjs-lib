import { Asset, BaseAmount } from '@xchainjs/xchain-util'

export type Address = string

export enum Network {
  Mainnet = 'mainnet',
  Stagenet = 'stagenet',
  Testnet = 'testnet',
}

export type Balance = {
  asset: Asset
  amount: BaseAmount
}

export enum TxType {
  Transfer = 'transfer',
  Unknown = 'unknown',
}

export type TxHash = string

export type TxTo = {
  to: Address // address
  amount: BaseAmount // amount
  asset?: Asset // asset
}

export type TxFrom = {
  from: Address | TxHash // address or tx id
  amount: BaseAmount // amount
  asset?: Asset // asset
}

export type Tx = {
  asset: Asset // asset
  from: TxFrom[] // list of "from" txs. BNC will have one `TxFrom` only, `BTC` might have many transactions going "in" (based on UTXO)
  to: TxTo[] // list of "to" transactions. BNC will have one `TxTo` only, `BTC` might have many transactions going "out" (based on UTXO)
  date: Date // timestamp of tx
  type: TxType // type
  hash: string // Tx hash
}

export type TxsPage = {
  total: number
  txs: Tx[]
}

export type TxHistoryParams = {
  address: Address // Address to get history for
  offset?: number // Optional Offset
  limit?: number // Optional Limit of transactions
  startTime?: Date // Optional start time
  asset?: string // Optional asset. Result transactions will be filtered by this asset
}

export type TxParams = {
  walletIndex?: number // send from this HD index
  asset?: Asset
  amount: BaseAmount
  recipient: Address
  memo?: string // optional memo to pass
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

export type FeeBounds = { lower: number, upper: number }

export type RootDerivationPaths = Record<Network, string>

export type XChainClientParams = {
  network?: Network
  phrase?: string
  feeBounds?: FeeBounds
  rootDerivationPaths?: RootDerivationPaths
}

export interface XChainClient {
  setNetwork(net: Network): void
  getNetwork(): Network

  getExplorerUrl(): string
  getExplorerAddressUrl(address: Address): string
  getExplorerTxUrl(txID: string): string

  validateAddress(address: string): boolean
  getAddress(walletIndex?: number): Address

  setPhrase(phrase: string, walletIndex: number): Address

  // TODO (@xchain-team|@veado) Change params to be an object to be extendable more easily
  // see changes for `xchain-bitcoin` https://github.com/xchainjs/xchainjs-lib/pull/490
  getBalance(address: Address, assets?: Asset[]): Promise<Balance[]>

  getTransactions(params?: TxHistoryParams): Promise<TxsPage>

  getTransactionData(txId: string, assetAddress?: Address): Promise<Tx>

  getFees(): Promise<Fees>

  transfer(params: TxParams): Promise<TxHash>

  purgeClient(): void
}
