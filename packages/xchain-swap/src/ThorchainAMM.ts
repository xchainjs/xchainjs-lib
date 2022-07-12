import { AssetLUNA } from '@xchainjs/xchain-terra/lib'
import { isAssetRuneNative } from '@xchainjs/xchain-thorchain/lib'
import {
  Asset,
  AssetBCH,
  AssetBNB,
  AssetBTC,
  AssetDOGE,
  AssetETH,
  AssetLTC,
  AssetRuneNative,
  BCHChain,
  BNBChain,
  BTCChain,
  BaseAmount,
  Chain,
  CosmosChain,
  DOGEChain,
  ETHChain,
  LTCChain,
  PolkadotChain,
  THORChain,
  TerraChain,
  baseAmount,
  baseToAsset,
  eqAsset,
  eqChain,
  formatAssetAmountCurrency,
} from '@xchainjs/xchain-util'
import { BigNumber } from 'bignumber.js'

import { LiquidityPool } from './LiquidityPool'
import { Wallet } from './Wallet'
import { defaultChainAttributes } from './chainDefaults'
import {
  ChainAttributes,
  EstimateSwapParams,
  InboundDetail,
  PoolCache,
  SwapEstimate,
  SwapOutput,
  SwapSubmitted,
  TotalFees,
} from './types'
import { Midgard } from './utils/midgard'
import { calcInboundFee, getDoubleSwap, getSingleSwap } from './utils/swap'

const BN_1 = new BigNumber(1)

/**
 * THORChain Class for interacting with THORChain.
 * Recommended main class to use for swapping with THORChain
 * Has access to Midgard and THORNode data
 */
export class ThorchainAMM {
  private midgard: Midgard
  private poolCache: PoolCache | undefined
  private expirePoolCacheMillis
  private chainAttributes: Record<Chain, ChainAttributes>

  constructor(midgard: Midgard, expirePoolCacheMillis = 6000, chainAttributes = defaultChainAttributes) {
    this.midgard = midgard
    this.expirePoolCacheMillis = expirePoolCacheMillis
    this.chainAttributes = chainAttributes
    //initialize the cache
    this.refereshPoolCache()
  }
  /**
   * Provides a swap estimate for the given swap detail. Will check the params for errors before trying to get the estimate.
   * Uses current pool data, works out inbound and outboud fee, affiliate fees and works out the expected wait time for the swap (in and out)
   *
   * @param params - amount to swap

   * @returns The SwapEstimate
   */
  public async estimateSwap(params: EstimateSwapParams): Promise<SwapEstimate> {
    this.isValidSwap(params)

    const [sourceInboundDetails, destinationInboundDetails] = await this.midgard.getInboundDetails([
      params.sourceAsset.chain,
      params.destinationAsset.chain,
    ])
    const sourcePool = await this.getPoolForAsset(params.sourceAsset)
    const destinationPool = await this.getPoolForAsset(params.destinationAsset)
    const swapEstimate = this.calcSwapEstimate(
      params,
      sourceInboundDetails,
      destinationInboundDetails,
      sourcePool,
      destinationPool,
    )
    const errors = this.getSwapEstimateErrors(
      params,
      swapEstimate,
      sourcePool,
      sourceInboundDetails,
      destinationPool,
      destinationInboundDetails,
    )
    if (destinationPool) {
      if (errors.length > 0) {
        swapEstimate.canSwap = false
        swapEstimate.errors = errors
      } else {
        swapEstimate.canSwap = true
      }
      //---------------- Work out total Wait Time for Swap ---------------------- /
      if (swapEstimate.canSwap) {
        const inboundDelay = await this.confCounting(params.sourceAsset, params.inputAmount)
        const outboundDelay = await this.outboundDelay(destinationPool, params.destinationAsset, swapEstimate.netOutput)
        swapEstimate.waitTime = inboundDelay + outboundDelay
      }
    }
    return swapEstimate
  }
  /**
   * Conducts a swap with the given inputs. Should be called after estimateSwap() to ensure the swap is valid
   *
   * @param wallet - wallet to use
   * @param params - swap paraps
   * @param destinationAddress - were to send the output of the swap
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
    this.isValidSwap(params)
    // remove any affiliateFee. netInput * affiliateFee (%age) of the destination asset type
    const affiliateFee = params.inputAmount.times(params.affiliateFeePercent || 0)
    // Work out LIM from the slip percentage
    let limPercentage = BN_1
    if (params.slipLimit) {
      limPercentage = BN_1.minus(params.slipLimit || 1)
    } // else allowed slip is 100%
    // out min outbound asset based on limPercentage
    const limAssetAmount = await this.convertAssetToAsset(
      params.sourceAsset,
      params.inputAmount.times(limPercentage),
      params.destinationAsset,
    )
    if (!limAssetAmount) {
      throw new Error(`Could not convert ${params.sourceAsset} to ${params.destinationAsset}`)
    }
    let waitTime = await this.confCounting(params.sourceAsset, params.inputAmount)
    const destPool = await this.getPoolForAsset(params.destinationAsset)
    if (destPool) {
      const outboundDelay = await this.outboundDelay(destPool, params.destinationAsset, limAssetAmount)
      waitTime = outboundDelay + waitTime
    }

    return await wallet.executeSwap({
      fromBaseAmount: params.inputAmount,
      sourceAsset: params.sourceAsset,
      destinationAsset: params.destinationAsset,
      limit: limAssetAmount,
      destinationAddress,
      affiliateAddress,
      affiliateFee,
      interfaceID,
      waitTime,
    })
  }
  /**
   * Basic Checks for swap information
   * @param params
   */
  private isValidSwap(params: EstimateSwapParams) {
    if (eqAsset(params.sourceAsset, params.destinationAsset))
      throw Error(`sourceAsset and destinationAsset cannot be the same`)

    if (params.inputAmount.lte(0)) throw Error('inputAmount must be greater than 0')

    if (params.affiliateFeePercent && (params.affiliateFeePercent < 0 || params.affiliateFeePercent > 0.1))
      throw Error(`affiliateFee must be between 0 and 1000`)
  }
  /**
   * Takes an Asset and converts it to the value of the other asset using pool ratio's
   *
   * @param sourceAsset Input Asset Type
   * @param inputAssetAmount Input Asset amount
   * @param destinationAsset Output Asset Type
   * @returns {destinationAmount} - amount in destination asset after conversion
   */
  public async convertAssetToAsset(
    sourceAsset: Asset,
    inputAmount: BaseAmount,
    destinationAsset: Asset,
  ): Promise<BaseAmount> {
    let destinationAmount: BaseAmount

    const sourceAssetPool = await this.getPoolForAsset(sourceAsset)
    const destinationAssetPool = await this.getPoolForAsset(destinationAsset)

    // Convert RUNE to Asset
    if (eqAsset(sourceAsset, AssetRuneNative) && destinationAssetPool) {
      const inversedRuneOverAsset = destinationAssetPool.inverseAssetPrice
      destinationAmount = inputAmount.times(inversedRuneOverAsset.amount())
      // Convert Asset to RUNE
    } else if (eqAsset(destinationAsset, AssetRuneNative) && sourceAssetPool) {
      destinationAmount = sourceAssetPool.getValueInRUNE(sourceAsset, inputAmount)
      // Convert Asset to Asset
    } else if (sourceAssetPool && destinationAssetPool) {
      const assetToAssetRatio = sourceAssetPool.getPriceIn(destinationAssetPool)
      destinationAmount = inputAmount.times(assetToAssetRatio.amount())
    } else {
      throw Error('Source or destination pool is undefined')
    }
    return destinationAmount
  }

  /**
   * Does the calculations for the swap.
   * Used by estimateSwap
   *
   * @param params
   * @param sourceInboundDetails
   * @param destinationInboundDetails
   * @param sourcePool
   * @param destinationPool
   * @returns
   */
  private calcSwapEstimate(
    params: EstimateSwapParams,
    sourceInboundDetails: InboundDetail,
    destinationInboundDetails: InboundDetail,
    sourcePool: LiquidityPool | undefined,
    destinationPool: LiquidityPool | undefined,
  ): SwapEstimate {
    let inboundFee: BaseAmount
    let outboundFee: BaseAmount

    // works out inbound fee.
    if (eqChain(params.sourceAsset.chain, Chain.THORChain) || params.sourceAsset.synth) {
      // flat rune fee or Synths inbput
      inboundFee = baseAmount(2000000)
    } else {
      inboundFee = calcInboundFee(params.sourceAsset, sourceInboundDetails.gas_rate)
    }
    // works out outbound fee.
    if (eqChain(params.destinationAsset.chain, Chain.THORChain) || params.destinationAsset.synth) {
      outboundFee = baseAmount(2000000)
    } else {
      outboundFee = calcInboundFee(params.destinationAsset, destinationInboundDetails.gas_rate)
    }
    outboundFee = outboundFee.times(3)
    // ---------- Remove Fees from inbound before doing the swap -----------
    let inputNetAmount = params.inputAmount.minus(inboundFee) // are of the same type so this works.

    // remove any affiliateFee. netInput * affiliateFee (%age) of the destination asset type
    const affiliateFee = inputNetAmount.times(params.affiliateFeePercent || 0)
    // remove the affiliate fee from the input.
    inputNetAmount = inputNetAmount.minus(affiliateFee)
    // now calculate swapfee based on inputNetAmount
    const swapOutput = this.calcSwapOutput(inputNetAmount, sourcePool, destinationPool)

    // ---------------- Remove Outbound Fee ---------------------- /
    const netOutput = swapOutput.output.minus(outboundFee) // swap outbound and outbound fee should be in the same type also

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
      waitTime: 0, // will be set within EstimateSwap if canSwap = true
      canSwap: false, // assume false for now, the getSwapEstimateErrors() step will flip this flag if required
    }
    return swapEstimate
  }
  /**
   * Looks for errors or issues within swap prams before doing the swap.
   *
   *
   * @param params
   * @param estimate
   * @param sourcePool
   * @param sourceInboundDetails
   * @param destinationPool
   * @param destinationInboundDetails
   * @returns
   */
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
    } else {
    }
    if (estimate.slipPercentage.gte(params.slipLimit || 1))
      errors.push(
        `expected slip: ${estimate.slipPercentage.toFixed()} is greater than your slip limit:${params.slipLimit?.toFixed()} `,
      )
    // only proceed to check fees if there are no errors so far
    if (errors.length > 0) return errors
    // Check if the inputAmount value is enough to cover all the fees.
    const canCoverFeesError = this.checkCoverFees(params, estimate, sourcePool, destinationPool)
    if (canCoverFeesError) errors.push(canCoverFeesError)

    return errors
  }
  private checkCoverFees(
    params: EstimateSwapParams,
    estimate: SwapEstimate,
    sourcePool: LiquidityPool | undefined,
    destinationPool: LiquidityPool | undefined,
  ): string | undefined {
    let result: string | undefined = undefined
    if (sourcePool && destinationPool) {
      //non-rune -> non-rune
      const inputAmountInRune = sourcePool?.getValueInRUNE(params.sourceAsset, params.inputAmount)
      const inboundFeeInRune = sourcePool?.getValueInRUNE(params.sourceAsset, estimate.totalFees.inboundFee)
      const outboundFeeInRune = destinationPool.getValueInRUNE(params.destinationAsset, estimate.totalFees.outboundFee)
      const swapFeeInRune = sourcePool.getValueInRUNE(params.sourceAsset, estimate.totalFees.swapFee)
      const affiliateFeeInRune = sourcePool?.getValueInRUNE(params.sourceAsset, estimate.totalFees.affiliateFee)
      const totalSwapFeesInRune = inboundFeeInRune.plus(outboundFeeInRune).plus(swapFeeInRune).plus(affiliateFeeInRune)
      if (totalSwapFeesInRune.gte(inputAmountInRune))
        result = `Input amount ${formatAssetAmountCurrency({
          amount: baseToAsset(params.inputAmount),
          asset: params.sourceAsset,
        })} is less than or equal to total swap fees`
    } else if (!sourcePool && destinationPool) {
      // rune -> non-rune
      const inputAmountInRune = params.inputAmount
      console.log(inputAmountInRune.amount().toFixed())
      const inboundFeeInRune = estimate.totalFees.inboundFee
      const outboundFeeInRune = destinationPool.getValueInRUNE(params.destinationAsset, estimate.totalFees.outboundFee)
      const swapFeeInRune = estimate.totalFees.swapFee
      const affiliateFeeInRune = estimate.totalFees.affiliateFee
      const totalSwapFeesInRune = inboundFeeInRune.plus(outboundFeeInRune).plus(swapFeeInRune).plus(affiliateFeeInRune)
      if (totalSwapFeesInRune.gte(inputAmountInRune))
        result = `Input amount ${formatAssetAmountCurrency({
          amount: baseToAsset(params.inputAmount),
          asset: params.sourceAsset,
        })} is less than or equal to total swap fees`
    } else if (sourcePool && !destinationPool) {
      // non-rune -> rune
      const inputAmountInRune = sourcePool?.getValueInRUNE(params.sourceAsset, params.inputAmount)
      const inboundFeeInRune = sourcePool?.getValueInRUNE(params.sourceAsset, estimate.totalFees.inboundFee)
      const outboundFeeInRune = estimate.totalFees.outboundFee
      const swapFeeInRune = sourcePool.getValueInRUNE(params.sourceAsset, estimate.totalFees.swapFee)
      const affiliateFeeInRune = sourcePool?.getValueInRUNE(params.sourceAsset, estimate.totalFees.affiliateFee)
      const totalSwapFeesInRune = inboundFeeInRune.plus(outboundFeeInRune).plus(swapFeeInRune).plus(affiliateFeeInRune)
      if (totalSwapFeesInRune.gte(inputAmountInRune))
        result = `Input amount ${formatAssetAmountCurrency({
          amount: baseToAsset(params.inputAmount),
          asset: params.sourceAsset,
        })} is less than or equal to total swap fees`
    }
    return result
  }
  /**
   * Works out the swap direction and amount and calls the swap functions.
   *
   * @param netInputAmount - amount post removing inbound and affiliate Fee
   * @param sourcePool
   * @param destinationPool
   * @returns
   */
  private calcSwapOutput(
    netInputAmount: BaseAmount,
    sourcePool: LiquidityPool | undefined,
    destinationPool: LiquidityPool | undefined,
  ): SwapOutput {
    if (sourcePool && destinationPool) {
      return getDoubleSwap(netInputAmount, sourcePool, destinationPool)
    } else if (sourcePool && !destinationPool) {
      // Asset->RUNE
      return getSingleSwap(netInputAmount, sourcePool, true)
    } else if (destinationPool) {
      // RUNE->Asset
      return getSingleSwap(netInputAmount, destinationPool, false)
    }
    throw Error('Cannot calcSwapOutput, source asset or destination asset undefined')
  }
  /**
   * Works out how long an outbound Tx will be held by THORChain before sending.
   *
   * @param asset asset being sent.
   * @param outboundAmount the amount of that asset
   * @returns required delay in seconds
   * @see https://gitlab.com/thorchain/thornode/-/blob/develop/x/thorchain/manager_txout_current.go#L548
   */
  async outboundDelay(liquidtyPool: LiquidityPool, asset: Asset, outboundAmount: BaseAmount): Promise<number> {
    const minTxOutVolumeThreshold = await this.midgard.getNetworkValueByName('MinTxOutVolumeThreshold')
    const maxTxOutOffset = await this.midgard.getNetworkValueByName('MaxTxOutOffset')
    const getScheduledOutboundValue = await this.midgard.getScheduledOutboundValue()
    const thorChainblocktime = this.chainAttributes[THORChain].avgBlockTimeInSecs // blocks required to confirm tx
    let txOutDelayRate = await this.midgard.getNetworkValueByName('TXOUTDELAYRATE') // set to 100 rune

    // If asset is equal to Rune set runeValue as outbound amount else set it to the asset's value in rune
    const runeValue: BaseAmount = eqAsset(AssetRuneNative, asset)
      ? outboundAmount
      : liquidtyPool.getValueInRUNE(asset, outboundAmount)
    // Check rune value amount
    if (runeValue.amount().isLessThan(baseAmount(minTxOutVolumeThreshold).amount())) {
      return thorChainblocktime
    }
    // Rune value in the outbound queue
    if (getScheduledOutboundValue == undefined) {
      throw new Error(`Could not return Scheduled Outbound Value`)
    }
    // Add OutboundAmount in rune to the oubound queue
    const outboundAmountTotal: BaseAmount = runeValue.plus(getScheduledOutboundValue)
    // calculate the if outboundAmountTotal is over the volume threshold
    const volumeThreshold = outboundAmountTotal.amount().dividedBy(minTxOutVolumeThreshold)
    // check delay rate
    txOutDelayRate = txOutDelayRate - volumeThreshold.toNumber() < 1 ? 1 : txOutDelayRate
    // calculate the minimum number of blocks in the future the txn has to be
    let minBlocks = runeValue.div(txOutDelayRate).amount().toNumber()
    minBlocks = minBlocks > maxTxOutOffset ? maxTxOutOffset : minBlocks
    return minBlocks * thorChainblocktime
  }
  /**
   * Finds the required confCount required for an inbound or outbound Tx to THORChain. Estimate based on Midgard data only.
   *
   * Finds the gas asset of the given asset (e.g. BUSD is on BNB), finds the value of asset in Gas Asset then finds the required confirmation count.
   * ConfCount is then times by 6 seconds.
   *
   * @param inboundAsset - asset of the outbound amount.
   * @param inboundAmount - netOuput of asset being swapped (any asset).
   * @returns time in seconds before a Tx is confirmed by THORChain
   * @see https://docs.thorchain.org/chain-clients/overview
   */
  private async confCounting(inboundAsset: Asset, inboundAmount: BaseAmount): Promise<number> {
    let amountInGasAsset: BaseAmount

    // RUNE, BNB and Synths have near instant finality, so no conf counting required.
    if (eqAsset(AssetRuneNative, inboundAsset) || eqAsset(AssetBNB, inboundAsset) || inboundAsset.synth) {
      return 0
    }
    // Get the gas asset for the inboundAsset.chain
    const chainGasAsset = this.getChainAsset(inboundAsset.chain)

    // check for chain asset, else need to convert asset value to chain asset.
    if (eqAsset(chainGasAsset, inboundAsset)) {
      amountInGasAsset = inboundAmount
    } else {
      amountInGasAsset = await this.convertAssetToAsset(inboundAsset, inboundAmount, chainGasAsset)
    }
    // Convert to Asset Amount
    const amountInGasAssetInAsset = baseToAsset(amountInGasAsset)

    const confConfig = this.chainAttributes[inboundAsset.chain]
    // find the requried confs
    const requiredConfs = Math.ceil(amountInGasAssetInAsset.amount().div(confConfig.blockReward).toNumber())
    // convert that into seconds
    return requiredConfs * confConfig.avgBlockTimeInSecs
  }
  /**
   * Gets the Liquidity Pool for a given Asset
   * @param asset - cannot be RUNE.
   * @returns
   */
  async getPoolForAsset(asset: Asset): Promise<LiquidityPool | undefined> {
    const pools = await this.getPools()
    return pools[asset.ticker]
  }
  /**
   * Refereshs the pool values
   * @returns
   */
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
        const lp = new LiquidityPool(pool)
        poolMap[lp.asset.ticker] = lp
      }
      this.poolCache = {
        lastRefreshed: Date.now(),
        pools: poolMap,
      }
    }
  }
  /**
   * Return the chain for a given Asset This method should live somewhere else.
   * @param chain
   * @returns the gas asset type for the given chain
   */
  protected getChainAsset = (chain: Chain): Asset => {
    switch (chain) {
      case BNBChain:
        return AssetBNB
      case BTCChain:
        return AssetBTC
      case ETHChain:
        return AssetETH
      case THORChain:
        return AssetRuneNative
      case CosmosChain:
        throw Error('Cosmos is not supported yet')
      case BCHChain:
        return AssetBCH
      case LTCChain:
        return AssetLTC
      case DOGEChain:
        return AssetDOGE
      case TerraChain:
        return AssetLUNA
      case PolkadotChain:
        throw Error('Polkadot is not supported yet')
      default:
        throw Error('Unknown chain')
    }
  }

  // public async addLiquidity(
  //   wallet: Wallet,
  //   asset: Asset,
  //   assetAmount: BaseAmount,
  //   runeAmount: BaseAmount,
  // ): Promise<SwapSubmitted> {
  //   let symAdd = false

  //   const [assetInboundDetails] = await this.midgard.getInboundDetails([asset.chain])
  //   const assetInboundFee = this.calcInboundFee(asset, assetInboundDetails.gas_rate)
  //   // Might be better to do assetInboundFee * 4 to account for inbound and outbound fees
  //   if (assetInboundFee.gt(assetAmount)) {
  //     throw Error('Source or destination pool is undefined')
  //   }
  //   const memo = `+:${asset.chain}.${asset.ticker}`

  //   if (assetAmount.amount().gt(0) && runeAmount.amount().gt(0)) {
  //     symAdd = true
  //     wallet.addLiquiditySym(memo) // send Tx for Asset and RUNE
  //   } else if (symAdd == false && assetAmount.amount().gt(0)) {
  //     wallet.depositAsset(memo)
  //   }
  //   if (symAdd == false && runeAmount.amount().gt(0)) {
  //     wallet.depositRUNE(memo)
  //   }

  //   return SwapSubmitted({
  //     hash: 0,
  //     url: '',
  //     waitTime: 0,
  //   })
  // }

  // public async removeLiquidity(wallet: Wallet, asset: Asset, percent: Percent) {
  //   const memo = `-:${asset.chain}.${asset.symbol}:${percent.mul(100).toFixed(0)}`
  // }
}
