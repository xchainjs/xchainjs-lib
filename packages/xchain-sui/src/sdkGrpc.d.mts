/** Return shape of the gRPC helpers this package calls. Matches `@mysten/sui` 2.35 core. */
export interface SuiGrpcCore {
  getBalance(input: { owner: string; coinType: string }): Promise<{
    balance: { balance: string }
  }>
  listBalances(input: { owner: string; cursor?: string }): Promise<{
    balances: Array<{ coinType: string; balance: string }>
    hasNextPage: boolean
    cursor: string | null
  }>
  getTransaction(input: { digest: string; include?: { balanceChanges?: boolean } }): Promise<SuiGrpcTransactionResult>
  executeTransaction(input: { transaction: Uint8Array; signatures: string[] }): Promise<SuiGrpcTransactionResult>
  getReferenceGasPrice(): Promise<{ referenceGasPrice: string }>
  getCoinMetadata(input: { coinType: string }): Promise<{
    coinMetadata?: { decimals?: number } | null
  }>
  listCoins(input: { owner: string; coinType: string }): Promise<{
    objects: Array<{ objectId: string; version: string; digest: string }>
  }>
}

export interface SuiGrpcTransactionResult {
  $kind?: string
  Transaction?: SuiGrpcExecutedTransaction
  FailedTransaction?: SuiGrpcExecutedTransaction
}

export interface SuiGrpcExecutedTransaction {
  digest?: string
  timestampMs?: string | number | null
  status?: unknown
  balanceChanges?: Array<{ coinType: string; address: string; amount: string }>
}

export function createGrpcCoreClient(baseUrl: string, network: 'mainnet' | 'testnet'): SuiGrpcCore
