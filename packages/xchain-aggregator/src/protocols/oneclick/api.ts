import { OneClickQuoteRequest, OneClickQuoteResponse, OneClickToken } from './types'
import { toOneClickAmountString } from './utils'

const BASE_URL = 'https://1click.chaindefuser.com'

export class OneClickApi {
  private headers: Record<string, string>
  private referral?: string

  constructor(apiKey?: string, referral?: string) {
    this.headers = { 'Content-Type': 'application/json' }
    if (apiKey) {
      this.headers['Authorization'] = `Bearer ${apiKey}`
    }
    if (referral) this.referral = referral
  }

  async getTokens(): Promise<OneClickToken[]> {
    const resp = await fetch(`${BASE_URL}/v0/tokens`, { headers: this.headers })
    if (!resp.ok) throw new Error(`1Click getTokens failed: ${resp.status}`)
    return resp.json()
  }

  async getQuote(params: OneClickQuoteRequest): Promise<OneClickQuoteResponse> {
    const body: OneClickQuoteRequest = {
      ...params,
      amount: toOneClickAmountString(params.amount),
      ...(this.referral ? { referral: this.referral } : {}),
    }
    const resp = await fetch(`${BASE_URL}/v0/quote`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify(body),
    })
    if (!resp.ok) throw new Error(await this.failureDetail(resp, `1Click getQuote failed: ${resp.status}`))
    return resp.json()
  }

  async submitDeposit(txHash: string, depositAddress: string): Promise<void> {
    const resp = await fetch(`${BASE_URL}/v0/deposit/submit`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify({ txHash, depositAddress }),
    })
    if (!resp.ok) {
      throw new Error(await this.failureDetail(resp, `1Click submitDeposit failed: ${resp.status}`))
    }
  }

  private async failureDetail(resp: Response, fallback: string): Promise<string> {
    let detail = fallback
    try {
      const errBody = (await resp.json()) as { message?: unknown; error?: unknown }
      const message = typeof errBody?.message === 'string' ? errBody.message : undefined
      const error = typeof errBody?.error === 'string' ? errBody.error : undefined
      const parsed = message || error
      if (parsed) detail = `${detail}: ${parsed}`
    } catch {
      // Non-JSON error body
    }
    return detail
  }
}
