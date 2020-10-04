export enum Network {
  TEST = 'testnet',
  MAIN = 'mainnet',
}

export enum Path {
  address = 'address',
  tx = 'tx',
}

export interface Balance {
  coin: string
  amount: number
}

export type TxPage = {
  from: string
  to: string
  amount: number
  date: string
}

export type Address = string

export type TransferResult = string

export type TxParams = {
  asset: string // BTC.BTC
  amount: number // in base format (10**8)
  recipient: Address // address
  feeRate: number // feeRate
  memo?: string // optional memo to pass
}

export type Fees = {
  fast: number
  average: number
  slow: number
}

export interface AsgardexClient {
  setNetwork(net: Network): void

  getNetwork(): Network

  getExplorerUrl(type: Path, param: string): string

  setNodeURL(url: string): void

  setNodeAPIKey(key: string): void

  setPhrase(phrase: string): Address

  getBalance(address?: string): Promise<Balance[]>

  // TODO: implement this later
  // getTransactions(address: string): Promise<TxPage[]>

  transfer(params: TxParams): Promise<TransferResult>

  deposit(params: TxParams): Promise<TransferResult>

  getFees(): Promise<Fees>
}
