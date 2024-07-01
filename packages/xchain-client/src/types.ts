import { Address, AnyAsset, Asset, BaseAmount } from '@xchainjs/xchain-util'

/**
 * Enumeration of network types.
 */
export enum Network {
  Mainnet = 'mainnet',
  Stagenet = 'stagenet',
  Testnet = 'testnet',
}

/**
 * Type definition for asset information.
 */
export type AssetInfo = {
  asset: Asset // The asset
  decimal: number // The decimal value
}

/**
 * Type definition for a balance.
 */
export type Balance = {
  asset: AnyAsset // The asset
  amount: BaseAmount // The amount
}

/**
 * Enumeration of transaction types.
 */
export enum TxType {
  Transfer = 'transfer',
  Unknown = 'unknown',
}

/**
 * Type definition for a transaction hash.
 */
export type TxHash = string

/**
 * Type definition for the recipient of a transaction.
 */
export type TxTo = {
  to: Address // The recipient address
  amount: BaseAmount // The amount
  asset?: AnyAsset // The asset (optional)
}

/**
 * Type definition for the sender of a transaction.
 */
export type TxFrom = {
  from: Address | TxHash // The sender address or transaction hash
  amount: BaseAmount // The amount
  asset?: AnyAsset // The asset (optional)
}

/**
 * Type definition for a transaction.
 */
export type Tx = {
  asset: AnyAsset // The asset
  from: TxFrom[] // List of sender transactions
  to: TxTo[] // List of recipient transactions
  date: Date // Timestamp of the transaction
  type: TxType // Type of transaction
  hash: string // Transaction hash
}

/**
 * Type definition for a page of transactions.
 */
export type TxsPage = {
  total: number // Total number of transactions
  txs: Tx[] // Array of transactions
}

/**
 * Type definition for parameters used to retrieve transaction history.
 */
export type TxHistoryParams = {
  address: Address // Address to get history for
  offset?: number // Optional offset
  limit?: number // Optional limit of transactions
  startTime?: Date // Optional start time
  asset?: string // Optional asset. Result transactions will be filtered by this asset
}

/**
 * Type definition for transaction parameters.
 */
export type TxParams = {
  walletIndex?: number // Send from this HD index
  asset?: AnyAsset // The asset
  amount: BaseAmount // The amount
  recipient: Address // The recipient address
  memo?: string // Optional memo to pass
}

/**
 * Type definition for fee estimate options.
 */
export type FeeEstimateOptions = {
  memo?: string // Memo
  sender?: string // Sender
}

/**
 * Enumeration of fee options.
 */
export enum FeeOption {
  Average = 'average',
  Fast = 'fast',
  Fastest = 'fastest',
}

/**
 * Type definition for a fee rate.
 */
export type FeeRate = number

/**
 * Type definition for fee rates.
 */
export type FeeRates = Record<FeeOption, FeeRate>

/**
 * Enumeration of fee types.
 */
export enum FeeType {
  FlatFee = 'base',
  PerByte = 'byte',
}

/**
 * Type definition for a fee.
 */
export type Fee = BaseAmount

/**
 * Type definition for fees.
 */
export type Fees = Record<FeeOption, Fee> & {
  type: FeeType // Type of fee
}

/**
 * Type definition for fees with rates.
 */
export type FeesWithRates = { rates: FeeRates; fees: Fees }

/**
 * Type definition for fee bounds.
 */
export type FeeBounds = { lower: number; upper: number }

/**
 * Type definition for root derivation paths.
 */
export type RootDerivationPaths = Record<Network, string>

/**
 * Type definition for parameters used to configure an XChain client.
 */
export type XChainClientParams = {
  network?: Network // Network type
  phrase?: string // Phrase
  feeBounds?: FeeBounds // Fee bounds
  rootDerivationPaths?: RootDerivationPaths // Root derivation paths
}

/**
 * Type definition for a prepared transaction.
 */
export type PreparedTx = {
  rawUnsignedTx: string // Raw unsigned transaction
}

/**
 * Interface for an XChain client.
 */
export interface XChainClient {
  setNetwork(net: Network): void // Set network
  getNetwork(): Network // Get network
  getExplorerUrl(): string // Get explorer URL
  getExplorerAddressUrl(address: Address): string // Get explorer address URL
  getExplorerTxUrl(txID: string): string // Get explorer transaction URL
  validateAddress(address: string): boolean // Validate address
  getAddress(walletIndex?: number): Address // Get address
  getAddressAsync(walletIndex?: number): Promise<Address> // Get address asynchronously
  setPhrase(phrase: string, walletIndex: number): Address // Set phrase
  getBalance(address: Address, assets?: AnyAsset[]): Promise<Balance[]> // Get balance
  getTransactions(params?: TxHistoryParams): Promise<TxsPage> // Get transactions
  getTransactionData(txId: string, assetAddress?: Address): Promise<Tx> // Get transaction data
  getFees(options?: FeeEstimateOptions): Promise<Fees> // Get fees
  transfer(params: TxParams): Promise<TxHash> // Transfer
  prepareTx(params: TxParams): Promise<PreparedTx> // Prepare transaction
  broadcastTx(txHex: string): Promise<TxHash> // Broadcast transaction
  purgeClient(): void // Purge client
  getAssetInfo(): AssetInfo // Get native asset info
}
