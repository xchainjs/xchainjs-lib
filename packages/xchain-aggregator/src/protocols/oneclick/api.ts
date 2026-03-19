import { OneClickQuoteRequest, OneClickQuoteResponse, OneClickToken } from './types'

const BASE_URL = 'https://1click.chaindefuser.com'

export class OneClickApi {
  private headers: Record<string, string>

  constructor(apiKey?: string) {
    this.headers = { 'Content-Type': 'application/json' }
    if (apiKey) {
      this.headers['Authorization'] = `Bearer ${apiKey}`
    }
  }

  async getTokens(): Promise<OneClickToken[]> {
    const resp = await fetch(`${BASE_URL}/v0/tokens`, { headers: this.headers })
    if (!resp.ok) throw new Error(`1Click getTokens failed: ${resp.status}`)
    return resp.json()
  }

  async getQuote(params: OneClickQuoteRequest): Promise<OneClickQuoteResponse> {
    const resp = await fetch(`${BASE_URL}/v0/quote`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify(params),
    })
    if (!resp.ok) throw new Error(`1Click getQuote failed: ${resp.status}`)
    return resp.json()
  }

  async submitDeposit(txHash: string, depositAddress: string): Promise<void> {
    await fetch(`${BASE_URL}/v0/deposit/submit`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify({ txHash, depositAddress }),
    }).catch(() => {
      // Fire-and-forget
    })
  }
}
