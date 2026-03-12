/**
 * Lightweight Radix Gateway API client replacing the heavy
 * @radixdlt/babylon-gateway-api-sdk (~2.7 MB).
 *
 * Only implements the endpoints actually used by xchain-radix.
 */

// #region Types

export type LedgerState = {
  network: string
  state_version: number
  proposer_round_timestamp: string
  epoch: number
  round: number
}

export type GatewayStatusResponse = {
  ledger_state: LedgerState
}

export type FungibleResourcesCollectionItem = {
  aggregation_level: string
  resource_address: string
  amount: number | string
  last_updated_at_state_version: number
}

export type NonFungibleResourcesCollectionItem = {
  aggregation_level: string
  resource_address: string
  amount: number
  last_updated_at_state_version: number
}

export type StateEntityDetailsVaultResponseItem = {
  address: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  details?: { type: string; divisibility?: number; [key: string]: any }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any
}

export type StateEntityFungiblesPageRequest = {
  address: string
  limit_per_page: number
  cursor?: string
  at_ledger_state?: { state_version: number }
}

export type StateEntityFungiblesPageResponse = {
  ledger_state: LedgerState
  total_count?: number
  items: FungibleResourcesCollectionItem[]
  next_cursor?: string
  address?: string
}

export type StateEntityNonFungiblesPageRequest = {
  address: string
  limit_per_page: number
  cursor?: string
  at_ledger_state?: { state_version: number }
}

export type StateEntityNonFungiblesPageResponse = {
  ledger_state: LedgerState
  total_count?: number
  items: NonFungibleResourcesCollectionItem[]
  next_cursor?: string
  address?: string
}

export type GatewayPublicKey = {
  key_type: string
  key_hex: string
}

export type TransactionPreviewRequest = {
  manifest: string
  blobs_hex: string[]
  start_epoch_inclusive: number
  end_epoch_exclusive: number
  notary_public_key: GatewayPublicKey
  notary_is_signatory: boolean
  tip_percentage: number
  nonce: number
  signer_public_keys: GatewayPublicKey[]
  flags: {
    assume_all_signature_proofs: boolean
    skip_epoch_check: boolean
    use_free_credit: boolean
  }
}

export type TransactionPreviewResponse = {
  receipt: {
    status: string
    fee_summary: {
      execution_cost_units_consumed: number
      finalization_cost_units_consumed: number
      xrd_total_execution_cost: string
      xrd_total_finalization_cost: string
      xrd_total_royalty_cost: string
      xrd_total_storage_cost: string
      xrd_total_tipping_cost: string
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any
}

export type TransactionSubmitResponse = {
  duplicate: boolean
}

export type CommittedTransactionInfo = {
  transaction_status: string
  state_version: number
  epoch: number
  round: number
  round_timestamp: string
  payload_hash: string
  intent_hash: string
  fee_paid: string
  confirmed_at?: Date
  raw_hex?: string
  receipt?: { status: string }
  manifest_classes?: string[]
}

export type TransactionCommittedDetailsResponse = {
  ledger_state?: LedgerState
  transaction: CommittedTransactionInfo
}

export type StreamTransactionsRequest = {
  affected_global_entities_filter?: string[]
  limit_per_page?: number
  from_ledger_state?: { state_version: number }
  manifest_resources_filter?: string[]
  opt_ins?: { raw_hex?: boolean }
  cursor?: string
}

export type StreamTransactionsResponse = {
  items: CommittedTransactionInfo[]
  next_cursor?: string
}

export type TransactionStatusResponse = {
  status: string
  intent_hash: string
}

// #endregion Types

// #region API Client

const NETWORK_URLS: Record<number, string> = {
  1: 'https://mainnet.radixdlt.com',
  2: 'https://stokenet.radixdlt.com',
}

export class RadixGatewayApi {
  private baseUrl: string

  constructor(networkId: number) {
    const url = NETWORK_URLS[networkId]
    if (!url) throw new Error(`Unsupported Radix network ID: ${networkId}`)
    this.baseUrl = url
  }

  private async post<T>(path: string, body: unknown): Promise<T> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    if (!response.ok) {
      throw new Error(`Radix Gateway API error: ${response.status} ${response.statusText}`)
    }
    return response.json() as Promise<T>
  }

  async getStatus(): Promise<GatewayStatusResponse> {
    return this.post('/status/gateway-status', {})
  }

  async getEntityDetailsVaultAggregated(addresses: string[]): Promise<StateEntityDetailsVaultResponseItem[]> {
    const response = await this.post<{ items: StateEntityDetailsVaultResponseItem[] }>('/state/entity/details', {
      addresses,
      aggregation_level: 'Vault',
    })
    return response.items
  }

  async getEntityFungiblesPage(request: StateEntityFungiblesPageRequest): Promise<StateEntityFungiblesPageResponse> {
    return this.post('/state/entity/page/fungibles/', request)
  }

  async getEntityNonFungiblesPage(
    request: StateEntityNonFungiblesPageRequest,
  ): Promise<StateEntityNonFungiblesPageResponse> {
    return this.post('/state/entity/page/non-fungibles/', request)
  }

  async previewTransaction(request: TransactionPreviewRequest): Promise<TransactionPreviewResponse> {
    return this.post('/transaction/preview', request)
  }

  async submitTransaction(notarizedTransactionHex: string): Promise<TransactionSubmitResponse> {
    return this.post('/transaction/submit', {
      notarized_transaction_hex: notarizedTransactionHex,
    })
  }

  async getTransactionDetails(request: {
    intent_hash: string
    opt_ins?: { raw_hex?: boolean }
  }): Promise<TransactionCommittedDetailsResponse> {
    const response = await this.post<TransactionCommittedDetailsResponse>('/transaction/committed-details', request)
    if (response.transaction.confirmed_at) {
      response.transaction.confirmed_at = new Date(response.transaction.confirmed_at as unknown as string)
    }
    return response
  }

  async getStreamTransactions(request: StreamTransactionsRequest): Promise<StreamTransactionsResponse> {
    const response = await this.post<StreamTransactionsResponse>('/stream/transactions', request)
    for (const item of response.items) {
      if (item.confirmed_at) {
        item.confirmed_at = new Date(item.confirmed_at as unknown as string)
      }
    }
    return response
  }

  async getTransactionStatus(intentHash: string): Promise<TransactionStatusResponse> {
    return this.post('/transaction/status', { intent_hash: intentHash })
  }
}

// #endregion API Client
