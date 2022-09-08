import { EstimateSwapParams, ThorchainQuery, TxDetails, calcNetworkFee } from '@xchainjs/xchain-thorchain-query'
import { BigNumber } from 'bignumber.js'

import { AddliquidityPosition, RemoveLiquidityPosition, TxSubmitted } from './types'
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
  public estimateSwap(params: EstimateSwapParams): Promise<TxDetails> {
    return this.thorchainQuery.estimateSwap(params)
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
  ): Promise<TxSubmitted> {
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
  /**
   *
   * @param wallet - wallet class
   * @param params - liquidity parameters
   * @returns
   */
  public async addLiquidityPosition(wallet: Wallet, params: AddliquidityPosition): Promise<TxSubmitted[]> {
    let waitTimeSeconds = 0
    const inboundDetails = await this.thorchainQuery.thorchainCache.midgard.getInboundDetails()
    const assetInboundFee = calcNetworkFee(params.asset.asset, inboundDetails[params.asset.asset.chain].gas_rate)
    const runeInboundFee = calcNetworkFee(params.rune.asset, inboundDetails[params.rune.asset.chain].gas_rate)

    if (!params.asset.assetAmount.eq(0)) {
      waitTimeSeconds = await this.thorchainQuery.confCounting(params.asset)
      if (assetInboundFee.baseAmount.times(4).gt(params.asset.baseAmount)) throw Error(`Asset amount is less than fees`)
    }
    if (!params.rune.assetAmount.eq(0)) {
      waitTimeSeconds = await this.confCounting(params.rune)
      if (runeInboundFee.baseAmount.times(4).gt(params.rune.baseAmount)) throw Error(`Rune amount is less than fees`)
    }
    return wallet.addLiquidity({
      asset: params.asset,
      rune: params.rune,
      action: params.action,
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
    let waitTimeSeconds = 0
    const membersLP = await this.thorchainQuery.checkLiquidityPosition(params.assetAddress)
    // Caution Dust Limits: BTC,BCH,LTC chains 10k sats; DOGE 1m Sats; ETH 0 wei; THOR 0 RUNE.
    const dustValues = await this.getDustValues(membersLP.assetAmount.asset)
    console.log(dustValues.asset.assetAmount.amount().toNumber(), dustValues.rune.assetAmount.amount().toNumber())

    // Calculating wait time for amount to be withdrawn based off the percentage
    const assetAmount = membersLP.assetAmount.times(params.percentage / 100)
    // bug right here

    waitTimeSeconds = await this.confCounting(assetAmount)
    waitTimeSeconds += await this.confCounting(membersLP.runeAmount)

    return wallet.removeLiquidity({
      asset: dustValues.asset,
      rune: dustValues.rune,
      action: params.action,
      percentage: params.percentage,
      waitTimeSeconds: waitTimeSeconds,
    })
  }
}
