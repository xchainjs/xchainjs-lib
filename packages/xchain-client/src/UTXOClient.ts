import { BaseXChainClient as Client } from './BaseXChainClient'
import { standardFeeRates } from './feeRates'
import { calcFeesAsync } from './fees'
import { Fee, FeeRate, FeeRates, Fees, FeesWithRates } from './types'

export abstract class UTXOClient extends Client {
  protected abstract getSuggestedFeeRate(): Promise<FeeRate>
  protected abstract calcFee(feeRate: FeeRate, memo?: string): Promise<Fee>

  async getFeesWithRates(memo?: string): Promise<FeesWithRates> {
    const rates = await this.getFeeRates()
    return {
      fees: await calcFeesAsync(rates, this.calcFee.bind(this), memo),
      rates,
    }
  }

  async getFees(memo?: string): Promise<Fees> {
    const { fees } = await this.getFeesWithRates(memo)
    return fees
  }

  /**
   * @deprecated Use getFees(memo) instead
   */
  async getFeesWithMemo(memo: string): Promise<Fees> {
    const { fees } = await this.getFeesWithRates(memo)
    return fees
  }

  async getFeeRates(): Promise<FeeRates> {
    const feeRate: FeeRate = await (async () => {
      try {
        return await this.getFeeRateFromThorchain()
      } catch (error) {
        console.warn(`Rate lookup via Thorchain failed: ${error}`)
      }
      return await this.getSuggestedFeeRate()
    })()

    return standardFeeRates(feeRate, this.feeBounds)
  }
}
