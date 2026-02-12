export interface OperationResult<T = unknown> {
  loading: boolean
  error: Error | null
  result: T | null
  duration: number | null
}

export interface ApiKeyConfig {
  etherscan?: string
  blockcypher?: string
  nownodes?: string
}
