import {
  AddliquidityPosition,
  EstimateSwapParams,
  RemoveLiquidityPosition,
  ThorchainQuery,
  TxDetails,
  calcNetworkFee,
} from '@xchainjs/xchain-thorchain-query'
import { isAssetRuneNative } from '@xchainjs/xchain-util'
import { BigNumber } from 'bignumber.js'

import { TxSubmitted } from './types'
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
   * Provides a swap estimate for the given swap detail. Will check the params for errors before trying to get the estimate.
   * Uses current pool data, works out inbound and outboud fee, affiliate fees and works out the expected wait time for the swap (in and out)
   *
   * @param params - amount to swap

   * @returns The SwapEstimate
   */
  public estimateSwap({
    input,
    destinationAsset,
    destinationAddress,
    affiliateAddress = '',
    interfaceID = 999,
    affiliateFeePercent = 0,
    slipLimit,
  }: EstimateSwapParams): Promise<TxDetails> {
    return this.thorchainQuery.estimateSwap({
      input,
      destinationAsset,
      destinationAddress,
      affiliateAddress,
      interfaceID,
      affiliateFeePercent,
      slipLimit,
    })
  }

  /**
   * Conducts a swap with the given inputs. Should be called after estimateSwap() to ensure the swap is valid
   *
   * @param wallet - wallet to use
   * @param params - swap params
   * @returns {SwapSubmitted} - Tx Hash, URL of BlockExplorer and expected wait time.
   */
  public async doSwap(wallet: Wallet, params: EstimateSwapParams): Promise<TxSubmitted> {
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
      destinationAddress: params.destinationAddress,
      affiliateAddress: params.affiliateAddress || '',
      affiliateFee,
      interfaceID: params.interfaceID || 999,
      waitTimeSeconds,
    })
  }
  /**
   *
   * @param wallet - wallet class
   * @param params - liquidity parameters
   * @returns
   */
  public async addLiquidityPosition(wallet: Wallet, params: AddliquidityPosition): Promise<TxSubmitted[]> {
    if (params.asset.asset.synth || params.rune.asset.synth) throw Error('you cannot add liquidity with a synth')
    if (!isAssetRuneNative(params.rune.asset)) throw Error('params.rune must be THOR.RUNE')

    let waitTimeSeconds = 0
    const inboundDetails = await this.thorchainQuery.thorchainCache.midgard.getInboundDetails()
    const assetInboundFee = calcNetworkFee(params.asset.asset, inboundDetails[params.asset.asset.chain].gas_rate)
    const runeInboundFee = calcNetworkFee(params.rune.asset, inboundDetails[params.rune.asset.chain].gas_rate)

    if (!params.asset.assetAmount.eq(0)) {
      waitTimeSeconds = await this.thorchainQuery.confCounting(params.asset)
      if (assetInboundFee.baseAmount.times(4).gt(params.asset.baseAmount)) throw Error(`Asset amount is less than fees`)
    }
    if (!params.rune.assetAmount.eq(0)) {
      waitTimeSeconds = await this.thorchainQuery.confCounting(params.rune)
      if (runeInboundFee.baseAmount.times(4).gt(params.rune.baseAmount)) throw Error(`Rune amount is less than fees`)
    }
    return wallet.addLiquidity({
      asset: params.asset,
      rune: params.rune,
      waitTimeSeconds: waitTimeSeconds,
    })
  }
  /**
   *
   * @param params - liquidity parameters
   * @param wallet - wallet needed to perform tx
   * @return
   */
  public async removeLiquidityPosition(wallet: Wallet, params: RemoveLiquidityPosition): Promise<TxSubmitted[]> {
    // Caution Dust Limits: BTC,BCH,LTC chains 10k sats; DOGE 1m Sats; ETH 0 wei; THOR 0 RUNE.
    const estimateWithrawLp = await this.thorchainQuery.estimateWithdrawLP(params)
    return wallet.removeLiquidity({
      asset: estimateWithrawLp.transactionFee.assetFee,
      rune: estimateWithrawLp.transactionFee.runeFee,
      percentage: params.percentage,
      waitTimeSeconds: estimateWithrawLp.estimatedWait,
    })
  }
}
