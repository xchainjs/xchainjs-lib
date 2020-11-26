import { Asset, BaseAmount } from '@xchainjs/xchain-util'

export type Address = string

export type Network = 'testnet' | 'mainnet'

export type Balance = {
  asset: Asset
  amount: BaseAmount
}

export type Balances = Balance[]

export type TxType = 'transfer' | 'unknown'

export type TxHash = string

export type TxTo = {
  to: Address // address
  amount: BaseAmount // amount
}

export type TxFrom = {
  from: Address | TxHash // address or tx id
  amount: BaseAmount // amount
}

export type Tx = {
  asset: Asset // asset
  from: TxFrom[] // list of "to" txs. BNC will have one `TxFrom` only, `BTC` might have many transactions going "in" (based on UTXO)
  to: TxTo[] // list of "to" transactions. BNC will have one `TxTo` only, `BTC` might have many transactions going "out" (based on UTXO)
  date: Date // timestamp of tx
  type: TxType // type
  hash: string // Tx hash
}

export type Txs = Tx[]

export type TxsPage = {
  total: number
  txs: Txs
}

export type TxHistoryParams = {
  address: Address // Address to get history for
  offset?: number // Optional Offset
  limit?: number // Optional Limit of transactions
  startTime?: Date // Optional start time
  asset?: string // Optional asset. Result transactions will be filtered by this asset
}

export type TxParams = {
  asset?: Asset
  amount: BaseAmount
  recipient: Address
  memo?: string // optional memo to pass
}

export type FeeOptionKey = 'average' | 'fast' | 'fastest'
export type FeeOption = Record<FeeOptionKey, BaseAmount>

export type FeeType =
  | 'byte' // fee will be measured as `BaseAmount` per `byte`
  | 'base' // fee will be "flat" measured in `BaseAmount`

export type Fees = FeeOption & {
  type: FeeType
}

export type XChainClientParams = {
  network?: Network
  phrase?: string
}

export interface XChainClient {
  setNetwork(net: Network): void
  getNetwork(): Network

  getExplorerUrl(): string
  getExplorerAddressUrl(address: Address): string
  getExplorerTxUrl(txID: string): string

  getAddress(): Address

  setPhrase(phrase: string): Address

  getBalance(address?: Address, asset?: Asset): Promise<Balances>

  getTransactions(params?: TxHistoryParams): Promise<TxsPage>

  getTransactionData(txId: string): Promise<Tx>

  getFees(): Promise<Fees>
  getDefaultFees(): Fees

  transfer(params: TxParams): Promise<TxHash>

  purgeClient(): void
}
