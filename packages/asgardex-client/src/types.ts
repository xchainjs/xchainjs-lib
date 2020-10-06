import { Asset, BaseAmount } from "@thorchain/asgardex-util"

export type Address = string

export type Network = 'testnet' | 'mainnet'

export type Balance = {
  asset: Asset
  amount: BaseAmount
  frozenAmount?: BaseAmount
}

export type Balances = Balance[]

type TxType = 'transfer' | 'freeze' | 'unfreeze' | 'unkown'

type TxTo = {
  address: string // to address
  amount: BaseAmount // amount sent to
}

type Tx = {
  asset: Asset // asset
  from: Address // from address
  to: TxTo[] // list of "to" transactions. BNC will have one `TxTo` only, `BTC` might have many transactions going "out" (based on UTXO)
  date: Date // timestamp of tx
  type: TxType // type
  hash: string // Tx hash
}

type Txs = Tx[]

type TxsPage = {
  total: number
  txs: Txs
}


type TxHistoryParams = {
  address: Address // Address to get history for
  offset?: number // Optional Offset
  limit?: number // Optional Limit of transactions
  startTime?: Date // Optional start time
}

type TxHash = string

type TxParams = {
  asset: Asset
  amount: BaseAmount
  recipient: Address
  feeRate?: number // optional feeRate
  memo?: string // optional memo to pass
}

type FeeType
  = 'byte' // fee will be measured as `BaseAmount` per `byte`
  | 'base' // fee will be "flat" measured in `BaseAmount`

type Fees = {
  type: FeeType
  fastest?: number
  fast?: number
  average: number
}

export type AsgardexClientParams = {
  network?: Network,
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
