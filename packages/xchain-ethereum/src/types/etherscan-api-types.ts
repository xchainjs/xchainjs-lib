export type GasOracleResponse = {
  LastBlock?: string
  SafeGasPrice?: string
  ProposeGasPrice?: string
  FastGasPrice?: string
}

export type TransactionHash = {
  blockHash: string
  blockNumber: string
  from: string
  gas: string
  gasPrice: string
  hash: string
  input: string
  nonce: string
  to: string
  transactionIndex: string
  value: string
  v: string
  r: string
  s: string
}

export type TransactionHistoryParam = {
  address?: string
  assetAddress?: string
  page?: number
  offset?: number
  startblock?: number
  endblock?: number
}

export type TokenTransactionInfo = {
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

export type ETHTransactionInfo = {
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
