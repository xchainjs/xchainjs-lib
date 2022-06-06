import { isAssetRuneNative } from '@xchainjs/xchain-thorchain/lib'
import { Asset, AssetETH, BaseAmount, Chain, assetToString, baseAmount, eqAsset } from '@xchainjs/xchain-util'
import { BigNumber } from 'bignumber.js'

import { LiquidityPool } from './LiquidityPool'
import { EstimateSwapParams, InboundDetail, PoolCache, SwapEstimate, SwapOutput, TotalFees } from './types'
import { Midgard } from './utils/midgard'
import { getDoubleSwap, getSingleSwap } from './utils/swap'

export class ThorchainAMM {
  private midgard: Midgard
  private poolCache: PoolCache | undefined
  private expirePoolCacheMillis

  constructor(midgard: Midgard, expirePoolCacheMillis = 6000) {
    this.midgard = midgard
    this.expirePoolCacheMillis = expirePoolCacheMillis
    //initialize the cache
    this.refereshPoolCache()
  }

  private isValidSwap(params: EstimateSwapParams) {
    if (eqAsset(params.sourceAsset, params.destinationAsset))
      throw Error(`sourceAsset and destinationAsset cannot be the same`)

    if (params.inputAmount.lte(0)) throw Error('inputAmount must be greater than 0')

    if (params.affiliateFeePercent && (params.affiliateFeePercent < 0 || params.affiliateFeePercent > 0.1))
      throw Error(`affiliateFee must be between 0 and 1000`)
  }

  private getSwapEstimateErrors(
    params: EstimateSwapParams,
    estimate: SwapEstimate,
    sourcePool: LiquidityPool | undefined,
    sourceInboundDetails: InboundDetail,
    destinationPool: LiquidityPool | undefined,
    destinationInboundDetails: InboundDetail,
  ): string[] {
    const errors: string[] = []
    if (!isAssetRuneNative(params.sourceAsset)) {
      if (!sourcePool?.isAvailable())
        errors.push(`sourceAsset ${params.sourceAsset.ticker} does not have a valid liquidity pool`)
      if (sourceInboundDetails.haltedChain || sourceInboundDetails.haltedTrading) errors.push(`source pool is halted`)
    }
    if (!isAssetRuneNative(params.destinationAsset)) {
      if (!destinationPool?.isAvailable())
        errors.push(`destinationAsset ${params.destinationAsset.ticker} does not have a valid liquidity pool`)
      if (destinationInboundDetails.haltedChain || destinationInboundDetails.haltedTrading)
        errors.push(`destination pool is halted`)
    }
    if (estimate.slipPercentage.gte(params.slipLimit || 1))
      errors.push(
        `expected slip: ${estimate.slipPercentage.toFixed()} is greater than your slip limit:${params.slipLimit?.toFixed()} `,
      )
    // TODO implement the following
    //  If valueofRUNE(inbound fee + outbound fee) > valueOfRUNE(inboundAsset)
    //   return "insufficent inbound asset amount "
    return errors
  }
  private calcSwapEstimate(
    params: EstimateSwapParams,
    sourceInboundDetails: InboundDetail,
    sourcePool: LiquidityPool,
    destinationPool: LiquidityPool,
  ): SwapEstimate {
    let inboundFee: BaseAmount
    let outboundFee: BaseAmount

    if (params.sourceAsset.chain === Chain.THORChain) {
      //flat rune fee
      inboundFee = baseAmount(2000000)
      outboundFee = inboundFee.times(3)
    } else {
      inboundFee = this.calcInboundFee(params.sourceAsset, sourceInboundDetails.gas_rate)
      outboundFee = inboundFee.times(3)
    }
    // ---------- Remove Fees from inbound before doing the swap -----------
    let inputNetAmount = params.inputAmount.minus(inboundFee) // are of the same type so this works.

    // remove any affiliateFee. netInput * affiliateFee (%age) of the desitnaiton asset type
    const affiliateFee = inputNetAmount.times(params.affiliateFeePercent || 0)
    // remove the affiliate fee from the input.
    inputNetAmount = inputNetAmount.minus(affiliateFee)
    //now we calculate swapfee based on inputNetAmount
    const swapOutput = this.calcSwapOutput(
      inputNetAmount,
      params.sourceAsset,
      sourcePool,
      params.destinationAsset,
      destinationPool,
    )

    // ---------------- Remove Outbound Fee ---------------------- /
    const netOutput = swapOutput.output.minus(outboundFee) // swap outbout and outbound fee should be in the same type also

    const totalFees: TotalFees = {
      inboundFee: inboundFee,
      swapFee: swapOutput.swapFee,
      outboundFee: outboundFee,
      affiliateFee: affiliateFee,
    }
    const swapEstimate = {
      totalFees: totalFees,
      slipPercentage: swapOutput.slip,
      netOutput: netOutput,
      canSwap: false, //assume false for now, the getSwapEstimateErrors() step will flip this flag if required
    }
    return swapEstimate
  }
  private calcSwapOutput(
    netInputAmount: BaseAmount,
    sourceAsset: Asset,
    sourcePool: LiquidityPool,
    destAsset: Asset,
    destinationPool: LiquidityPool,
  ): SwapOutput {
    let swapOutput: SwapOutput

    if (isAssetRuneNative(sourceAsset)) {
      // cannot be double swap and destination HAS to be asset.
      swapOutput = getSingleSwap(netInputAmount, destinationPool, false)
    }
    // is it a double swap? if source and destination != rune then its a double swap.
    const isDoubleSwap = (!isAssetRuneNative(sourceAsset) && !isAssetRuneNative(destAsset)) ?? false
    if (isDoubleSwap) {
      swapOutput = getDoubleSwap(netInputAmount, sourcePool, destinationPool)
    } else {
      swapOutput = getSingleSwap(netInputAmount, destinationPool, true)
    }
    return swapOutput
  }
  /**
   *
   * @param params - amount to swap

   * @returns The SwapEstimate
   */
  async estimateSwap(params: EstimateSwapParams): Promise<SwapEstimate> {
    //first make sure the swap has no input errors
    this.isValidSwap(params)

    //now get the pools involved
    const pools = await this.getPools()
    const [sourceInboundDetails, destinationInboundDetails] = await this.midgard.getInboundDetails([
      params.sourceAsset.chain,
      params.destinationAsset.chain,
    ])
    const sourceAssetString = assetToString(params.sourceAsset)
    const sourcePool = pools[sourceAssetString]
    const destinationAssetString = assetToString(params.destinationAsset)
    const destinationPool = pools[destinationAssetString]

    const swapEstimate = this.calcSwapEstimate(params, sourceInboundDetails, sourcePool, destinationPool)
    const errors = this.getSwapEstimateErrors(
      params,
      swapEstimate,
      sourcePool,
      sourceInboundDetails,
      destinationPool,
      destinationInboundDetails,
    )
    if (errors.length > 0) {
      swapEstimate.canSwap = false
      swapEstimate.errors = errors
    } else {
      swapEstimate.canSwap = true
    }
    return swapEstimate
  }
  // async getSwapEstimateInUSD(){

  //   const pools = await this.getPools()
  // }
  // public doSwap(
  //   params: EstimateSwapParams,
  //   destinationAddress: string,
  //   affiliateAddress: string,
  //   interfaceID: Int,
  // ): string {
  //   let limPercentage = new BigNumber(1)
  //   let lim = new BigNumber(1)
  //   let memo: string
  //   let inboundFee
  //   let outboundFee
  //   let isHalted

  //   if (params.sourceAsset.chain === Chain.THORChain) {
  //     //flat rune fee
  //     inboundFee = baseAmount(2000000)
  //     outboundFee = inboundFee.times(3)
  //   } else {
  //     //   check if the chain for that asset is halted and gets the fees
  //     const sourceAssetInboundDetails = await getInboundDetails(params.sourceAsset.chain)
  //     isHalted = sourceAssetInboundDetails.haltedChain || sourceAssetInboundDetails.haltedTrading
  //     inboundFee = this.calcInboundFee(params.sourceAsset, sourceAssetInboundDetails.gas_rate)
  //     // if the sourceAsset is BNB, then check the Binance Chain. Will need a asset to chain map or something.
  //     // if the source or desingation asset is halted, return an error.
  //     if (isHalted == true) {
  //       throw new Error(`Halted chain for ${assetToString(params.sourceAsset)}`)
  //     }
  //     outboundFee = inboundFee.times(3)
  //   }

  //   limPercentage = lim.minus(params.slipLimit)
  //   lim = params.inputAmount.times(limPercentage) // need to get output value of this.
  //   // need to trip lim and add interfaceID

  //   //   // remove any affiliateFee. netInput * affiliateFee (%age) of the desitnaiton asset type
  //   const affiliateFeeAmount = inputNetAmount.times(params.affiliateFee)

  //   memo = `:${params.destinationAsset.chain.toString}.${params.destinationAsset.symbol}:${destinationAddress}:${lim}:${affiliateAddress}:${affiliateFeeAmount}`

  //   if (params.destinationAsset == AssetBTC && memo.length > 80) {
  //     // if memo length is too long for BTC, need to trim it
  //     memo = `:${params.destinationAsset.chain.toString}.${params.destinationAsset.symbol}:${destinationAddress}`
  //   }

  //   // send transaction from the wallet using the transfer function. Will need to set it to the asgard vault.
  //   // TODO estimates wait time.
  //   const TxId: string = params.sourceAsset.Transfer()
  //   return TxId
  // }

  private calcInboundFee(sourceAsset: Asset, gasRate: BigNumber): BaseAmount {
    // https://dev.thorchain.org/thorchain-dev/thorchain-and-fees#fee-calcuation-by-chain

    switch (sourceAsset.chain) {
      case Chain.Bitcoin:
      case Chain.BitcoinCash:
      case Chain.Litecoin:
      case Chain.Doge:
        // NOTE: UTXO chains estimate fees with a 250 byte size
        return baseAmount(gasRate.multipliedBy(250))
        break
      case Chain.Binance:
        //flat fee
        return baseAmount(gasRate)
        break
      case Chain.Ethereum:
        if (eqAsset(sourceAsset, AssetETH)) {
          return baseAmount(gasRate.multipliedBy(35000).multipliedBy(10 ** 9))
        } else {
          return baseAmount(gasRate.multipliedBy(70000).multipliedBy(10 ** 9))
        }
        break
      case Chain.Terra:
        return baseAmount(gasRate)
        break
    }
    throw new Error(`could not calculate inbound fee for ${sourceAsset.chain}`)
  }

  async getPools(): Promise<Record<string, LiquidityPool>> {
    const millisSinceLastRefeshed = Date.now() - (this.poolCache?.lastRefreshed || 0)
    if (millisSinceLastRefeshed > this.expirePoolCacheMillis) {
      try {
        await this.refereshPoolCache()
        console.log('updated pool cache')
      } catch (e) {
        console.error(e)
      }
    }
    if (this.poolCache) {
      return this.poolCache?.pools
    } else {
      throw Error(`Could not refresh Pools `)
    }
  }

  /**
   * NOTE: do not call refereshPoolCache() directly, call getPools() instead
   * which will refresh the cache if it's expired
   */
  private async refereshPoolCache(): Promise<void> {
    const pools = await this.midgard.getPools()
    const poolMap: Record<string, LiquidityPool> = {}
    if (pools) {
      for (const pool of pools) {
        poolMap[pool.asset] = new LiquidityPool(pool)
      }
      this.poolCache = {
        lastRefreshed: Date.now(),
        pools: poolMap,
      }
    }
  }
}
