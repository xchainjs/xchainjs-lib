import { EstimateSwapParams, ThorchainQuery } from '@xchainjs/xchain-thorchain-query'
import { BigNumber } from 'bignumber.js'

import { SwapSubmitted } from './types'
import { Wallet } from './wallet'

const BN_1 = new BigNumber(1)

/**
 * THORChain Class for interacting with THORChain.
 * Recommended main class to use for swapping with THORChain
 * Has access to Midgard and THORNode data
 */
export class ThorchainAMM {
  private thorchainQuery: ThorchainQuery

  /**
   * Contructor to create a ThorchainAMM
   *
   * @param thorchainQuery - an instance of the ThorchainQuery
   * @returns ThorchainAMM
   */
  constructor(thorchainQuery: ThorchainQuery) {
    this.thorchainQuery = thorchainQuery
  }

  /**
   * Conducts a swap with the given inputs. Should be called after estimateSwap() to ensure the swap is valid
   *
   * @param wallet - wallet to use
   * @param params - swap paraps
   * @param destinationAddress - where to send the output of the swap
   * @param affiliateAddress - were to send the affilate Address, should be a THOR address (optional)
   * @param interfaceID - id if the calling interface (optional)
   * @returns {SwapSubmitted} - Tx Hash, URL of BlockExplorer and expected wait time.
   */
  public async doSwap(
    wallet: Wallet,
    params: EstimateSwapParams,
    destinationAddress: string,
    affiliateAddress = '',
    interfaceID = 999,
  ): Promise<SwapSubmitted> {
    // TODO validate all input fields
    const txDetails = await this.thorchainQuery.estimateSwap(params)
    if (!txDetails.txEstimate.canSwap) {
      throw Error(txDetails.txEstimate.errors.join('\n'))
    }
    // remove any affiliateFee. netInput * affiliateFee (%age) of the destination asset type
    const affiliateFee = params.input.baseAmount.times(params.affiliateFeePercent || 0)
    // Work out LIM from the slip percentage
    let limPercentage = BN_1
    if (params.slipLimit) {
      limPercentage = BN_1.minus(params.slipLimit || 1)
    } // else allowed slip is 100%

    const limAssetAmount = txDetails.txEstimate.netOutput.times(limPercentage)

    const waitTimeSeconds = txDetails.txEstimate.waitTimeSeconds

    return await wallet.executeSwap({
      input: params.input,
      destinationAsset: params.destinationAsset,
      limit: limAssetAmount.baseAmount,
      destinationAddress,
      affiliateAddress,
      affiliateFee,
      interfaceID,
      waitTimeSeconds,
    })
  }
}
