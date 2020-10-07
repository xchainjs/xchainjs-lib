import { Asset, BaseAmount } from '@thorchain/asgardex-util'

export type Address = string

export type Network = 'testnet' | 'mainnet'

export type Balance = {
  asset: Asset
  amount: BaseAmount
  frozenAmount?: BaseAmount
}

export type Balances = Balance[]

export type TxType = 'transfer' | 'freeze' | 'unfreeze' | 'unkown'

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
}

export type TxParams = {
  asset: Asset
  amount: BaseAmount
  recipient: Address
  feeRate?: number // optional feeRate
  memo?: string // optional memo to pass
}

export type FeeType =
  | 'byte' // fee will be measured as `BaseAmount` per `byte`
  | 'base' // fee will be "flat" measured in `BaseAmount`

export type Fees = {
  type: FeeType
  fastest?: number
  fast?: number
  average: number
}

export type AsgardexClientParams = {
  network?: Network
  phrase: string
}

export interface AsgardexClient {
  setNetwork(net: Network): void
  getNetwork(): Network

  getExplorerAddressUrl(): string
  getExplorerTxUrl(): string

  getAddress(): Address

  setPhrase(phrase: string): Address

  getBalance(address?: Address, asset?: Asset): Promise<Balances>

  getTransactions(params?: TxHistoryParams): Promise<TxsPage>

  getFees(): Promise<Fees>

  transfer(params: TxParams): Promise<TxHash>
  deposit(params: TxParams): Promise<TxHash>

  purgeClient(): void
}
