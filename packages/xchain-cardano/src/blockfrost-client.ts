import { FeeOption, FeeRates, Network } from '@xchainjs/xchain-client'

export interface BlockFrostConfig {
  projectId: string
  network: Network
}

export interface AddressResponse {
  amount: Array<{
    unit: string
    quantity: string
  }>
}

export interface EpochParameters {
  min_fee_a: number
  min_fee_b: number
  pool_deposit: string
  key_deposit: string
  coins_per_utxo_size: string
  max_val_size: string
  max_tx_size: number
}

export interface BlockResponse {
  slot: number
}

export interface UTxOResponse {
  tx_hash: string
  output_index: number
  amount: Array<{
    unit: string
    quantity: string
  }>
}

export interface TransactionResponse {
  hash: string
  block_time: number
}

export interface TransactionUTxOResponse {
  inputs: Array<{
    address: string
    amount: Array<{
      unit: string
      quantity: string
    }>
  }>
  outputs: Array<{
    address: string
    amount: Array<{
      unit: string
      quantity: string
    }>
  }>
}

export class BlockFrostClient {
  private readonly baseUrl: string
  private readonly headers: HeadersInit

  constructor(config: BlockFrostConfig) {
    const networkPrefix = config.network === Network.Mainnet ? 'mainnet' : 'testnet'
    this.baseUrl = `https://cardano-${networkPrefix}.blockfrost.io/api/v0`
    this.headers = {
      project_id: config.projectId,
      'Content-Type': 'application/json',
    }
  }

  private async fetch<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      headers: this.headers,
    })

    if (!response.ok) {
      throw { mensaje: 'Fetch error', status_code: response.status }
    }

    return response.json()
  }

  async addresses(address: string): Promise<AddressResponse> {
    return this.fetch<AddressResponse>(`/addresses/${address}`)
  }

  async epochsLatestParameters(): Promise<EpochParameters> {
    return this.fetch<EpochParameters>('/epochs/latest/parameters')
  }

  async blocksLatest(): Promise<BlockResponse> {
    return this.fetch<BlockResponse>('/blocks/latest')
  }

  async addressesUtxosAll(address: string): Promise<UTxOResponse[]> {
    return this.fetch<UTxOResponse[]>(`/addresses/${address}/utxos`)
  }

  async txs(txId: string): Promise<TransactionResponse> {
    return this.fetch<TransactionResponse>(`/txs/${txId}`)
  }

  async txsUtxos(txId: string): Promise<TransactionUTxOResponse> {
    return this.fetch<TransactionUTxOResponse>(`/txs/${txId}/utxos`)
  }

  async getFeeRates(): Promise<FeeRates> {
    const parameters = await this.epochsLatestParameters()
    const fee = parameters.min_fee_a + parameters.min_fee_b // Fee for 1 byte transaction

    return {
      [FeeOption.Average]: fee,
      [FeeOption.Fast]: fee,
      [FeeOption.Fastest]: fee,
    }
  }

  async txSubmit(txHex: string): Promise<string> {
    const tx = Buffer.from(txHex, 'hex')

    const response = await fetch(`${this.baseUrl}/tx/submit`, {
      method: 'POST',
      headers: {
        ...this.headers,
        'Content-Type': 'application/cbor',
      },
      body: tx,
    })

    if (!response.ok) {
      throw new Error(`BlockFrost API error: ${response.statusText}`)
    }

    return response.text()
  }
}
