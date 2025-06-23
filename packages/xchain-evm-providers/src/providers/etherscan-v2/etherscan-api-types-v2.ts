export type GasOracleResponseV2 = {
  LastBlock: string
  SafeGasPrice: string
  ProposeGasPrice: string
  FastGasPrice: string
}

export type TokenBalanceParamV2 = {
  address: string
  assetAddress: string
  chainId: number
}

export type TransactionHistoryParamV2 = {
  address?: string
  assetAddress?: string
  page?: number
  offset?: number
  startblock?: number | null
  endblock?: number
  chainId: number
}

export type TokenTransactionInfoV2 = {
  blockNumber: string
  timeStamp: string
  hash: string
  nonce: string
  blockHash: string
  from: string
  contractAddress: string
  to: string
  value: string
  tokenName: string
  tokenSymbol: string
  tokenDecimal: string
  transactionIndex: string
  gas: string
  gasPrice: string
  gasUsed: string
  cumulativeGasUsed: string
  input: string
  confirmations: string
}

export type ETHTransactionInfoV2 = {
  blockNumber: string
  timeStamp: string
  hash: string
  from: string
  to: string
  value: string
  contractAddress: string
  input: string
  type: string
  gas: string
  gasUsed: string
  traceId: string
  isError: string
  errCode: string
}
