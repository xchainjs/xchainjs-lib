import { AssetAtom } from '@xchainjs/xchain-cosmos/lib'
import { isAssetRuneNative } from '@xchainjs/xchain-thorchain/lib'
import { Asset, AssetBNB, AssetRuneNative, Chain, baseAmount, eqAsset } from '@xchainjs/xchain-util'

import { DefaultChainAttributes } from './chain-defaults'
import { CryptoAmount } from './crypto-amount'
import { ThorchainCache } from './thorchain-cache'
import { ChainAttributes, EstimateSwapParams, InboundDetail, SwapEstimate, TotalFees } from './types'
import { calcNetworkFee, getChainAsset } from './utils/swap'

/**
 * THORChain Class for interacting with THORChain.
 * Recommended main class to use for swapping with THORChain
 * Has access to Midgard and THORNode data
 */
export class ThorchainQuery {
  private thorchainCache: ThorchainCache
  private chainAttributes: Record<Chain, ChainAttributes>

  /**
   * Contructor to create a ThorchainAMM
   *
   * @param thorchainCache - an instance of the ThorchainCache (could be pointing to stagenet,testnet,mainnet)
   * @param chainAttributes - atrributes used to calculate waitTime & conf counting
   * @returns ThorchainAMM
   */
  constructor(thorchainCache: ThorchainCache, chainAttributes = DefaultChainAttributes) {
    this.thorchainCache = thorchainCache
    this.chainAttributes = chainAttributes
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

    const inboundDetails = await this.thorchainCache.getInboundDetails()

    const sourceInboundDetails = inboundDetails[params.input.asset.chain]
    const destinationInboundDetails = inboundDetails[params.destinationAsset.chain]

    const swapEstimate = await this.calcSwapEstimate(params, sourceInboundDetails, destinationInboundDetails)
    const errors = await this.getSwapEstimateErrors(
      params,
      swapEstimate,
      sourceInboundDetails,
      destinationInboundDetails,
    )
    if (errors.length > 0) {
      swapEstimate.canSwap = false
      swapEstimate.errors = errors
    } else {
      swapEstimate.canSwap = true
      if (params.destinationAsset.chain !== Chain.THORChain && !params.destinationAsset.synth) {
        //---------------- Work out total Wait Time for Swap ---------------------- /
        const inboundDelay = await this.confCounting(params.input)
        const outboundDelay = await this.outboundDelay(swapEstimate.netOutput)
        swapEstimate.waitTimeSeconds = inboundDelay + outboundDelay
      }
    }

    return swapEstimate
  }
  /**
   * Basic Checks for swap information
   * @param params
   */
  private isValidSwap(params: EstimateSwapParams) {
    // TODO validate all input fields

    if (eqAsset(params.input.asset, params.destinationAsset))
      throw Error(`sourceAsset and destinationAsset cannot be the same`)

    if (params.input.baseAmount.lte(0)) throw Error('inputAmount must be greater than 0')

    if (params.affiliateFeePercent && (params.affiliateFeePercent < 0 || params.affiliateFeePercent > 0.1))
      throw Error(`affiliateFee must be between 0 and 1000`)
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
  private async calcSwapEstimate(
    params: EstimateSwapParams,
    sourceInboundDetails: InboundDetail,
    destinationInboundDetails: InboundDetail,
  ): Promise<SwapEstimate> {
    //NOTE need to convert the asset to 8 decimals places for all calcs

    const input = await this.thorchainCache.convert(params.input, params.input.asset)
    const inputInRune = await this.thorchainCache.convert(input, AssetRuneNative)
    const inboundFeeInAsset = calcNetworkFee(input.asset, sourceInboundDetails.gas_rate)
    let outboundFeeInAsset = calcNetworkFee(params.destinationAsset, destinationInboundDetails.gas_rate)
    outboundFeeInAsset = outboundFeeInAsset.times(3)

    const inboundFeeInRune = await this.thorchainCache.convert(inboundFeeInAsset, AssetRuneNative)
    const outboundFeeInRune = await this.thorchainCache.convert(outboundFeeInAsset, AssetRuneNative)

    // ---------- Remove Fees from inbound before doing the swap -----------
    // TODO confirm with chris about this change
    // const inputMinusInboundFeeInRune = inputInRune.minus(inboundFeeInRune)
    const inputMinusInboundFeeInRune = inputInRune

    // remove any affiliateFee. netInput * affiliateFee (%age) of the destination asset type
    const affiliateFeeInRune = inputMinusInboundFeeInRune.times(params.affiliateFeePercent || 0)
    // remove the affiliate fee from the input.
    const inputNetAmountInRune = inputMinusInboundFeeInRune.minus(affiliateFeeInRune)
    // convert back to input asset
    const inputNetInAsset = await this.thorchainCache.convert(inputNetAmountInRune, input.asset)

    // now calculate swapfee based on inputNetAmount
    const swapOutput = await this.thorchainCache.getExpectedSwapOutput(inputNetInAsset, params.destinationAsset)

    // const swapFeeInRune = new CryptoAmount(swapOutput.swapFee, AssetRuneNative)
    // const swapFeeInAsset = await this.thorchainCache.convert(swapFeeInRune, params.input.asset)

    const outputInRune = swapOutput.output
    const swapFeeInRune = swapOutput.swapFee
    // const outputInRune = await this.thorchainCache.convert(outputInAsset, AssetRuneNative)

    // ---------------- Remove Outbound Fee ---------------------- /
    const netOutputInRune = outputInRune.minus(outboundFeeInRune)
    const netOutputInAsset = await this.thorchainCache.convert(netOutputInRune, params.destinationAsset)

    const totalFees: TotalFees = {
      inboundFee: inboundFeeInRune,
      swapFee: swapFeeInRune,
      outboundFee: outboundFeeInRune,
      affiliateFee: affiliateFeeInRune,
    }
    const swapEstimate = {
      totalFees: totalFees,
      slipPercentage: swapOutput.slip,
      netOutput: netOutputInAsset,
      waitTimeSeconds: 0, // will be set within EstimateSwap if canSwap = true
      canSwap: false, // assume false for now, the getSwapEstimateErrors() step will flip this flag if required
      errors: [],
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
  private async getSwapEstimateErrors(
    params: EstimateSwapParams,
    estimate: SwapEstimate,
    sourceInboundDetails: InboundDetail,
    destinationInboundDetails: InboundDetail,
  ): Promise<string[]> {
    const errors: string[] = []
    const sourceAsset = params.input.asset
    const destAsset = params.destinationAsset

    if (!isAssetRuneNative(sourceAsset)) {
      const sourcePool = await this.thorchainCache.getPoolForAsset(sourceAsset)
      if (!sourcePool.isAvailable())
        errors.push(`sourceAsset ${sourceAsset.ticker} does not have a valid liquidity pool`)
    }
    if (!isAssetRuneNative(destAsset)) {
      const destPool = await this.thorchainCache.getPoolForAsset(destAsset)
      if (!destPool.isAvailable())
        errors.push(`destinationAsset ${destAsset.ticker} does not have a valid liquidity pool`)
    }
    if (sourceInboundDetails.haltedChain) errors.push(`source chain is halted`)
    if (sourceInboundDetails.haltedTrading) errors.push(`source pool is halted trading`)
    if (destinationInboundDetails.haltedChain) errors.push(`destination chain is halted`)
    if (destinationInboundDetails.haltedTrading) errors.push(`destination pool is halted trading`)
    if (estimate.slipPercentage.gte(params.slipLimit || 1))
      errors.push(
        `expected slip: ${estimate.slipPercentage.toFixed()} is greater than your slip limit:${params.slipLimit?.toFixed()} `,
      )
    // only proceed to check fees if there are no errors so far
    if (errors.length > 0) return errors
    // Check if the inputAmount value is enough to cover all the fees.
    const canCoverFeesError = await this.checkCoverFees(params, estimate)
    if (canCoverFeesError) errors.push(canCoverFeesError)

    return errors
  }

  /**
   *
   * @param params
   * @param estimate
   * @returns
   */
  private async checkCoverFees(params: EstimateSwapParams, estimate: SwapEstimate): Promise<string | undefined> {
    let result: string | undefined = undefined
    const inputInRune = await this.thorchainCache.convert(params.input, AssetRuneNative)
    const feesInRune = await this.getFeesIn(estimate.totalFees, AssetRuneNative)

    const totalSwapFeesInRune = feesInRune.inboundFee
      .plus(feesInRune.outboundFee)
      .plus(feesInRune.swapFee)
      .plus(feesInRune.affiliateFee)
    const totalSwapFeesInAsset = await this.thorchainCache.convert(totalSwapFeesInRune, params.input.asset)
    if (totalSwapFeesInRune.gte(inputInRune))
      result = `Input amount ${params.input.formatedAssetString()}(${inputInRune.formatedAssetString()}) is less than or equal to total swap fees ${totalSwapFeesInAsset.formatedAssetString()}(${totalSwapFeesInRune.formatedAssetString()}) `
    return result
  }
  /**
   * Convinience method to convert TotalFees to a different CryptoAmount
   *
   * TotalFees are always calculated and returned in RUNE, this method can
   * be used to show the equivalent fees in another Asset Type
   *
   * @param fees: TotalFees - the fees you want to convert
   * @param asset: Asset - the asset you want the fees converted to
   * @returns TotalFees in asset
   */
  async getFeesIn(fees: TotalFees, asset: Asset): Promise<TotalFees> {
    return {
      inboundFee: await this.convert(fees.inboundFee, asset),
      swapFee: await this.convert(fees.swapFee, asset),
      outboundFee: await this.convert(fees.outboundFee, asset),
      affiliateFee: await this.convert(fees.affiliateFee, asset),
    }
  }
  /**
   * Returns the exchange of a CryptoAmount to a different Asset
   *
   * Ex. convert(input:100 BUSD, outAsset: BTC) -> 0.0001234 BTC
   *
   * @param input - amount/asset to convert to outAsset
   * @param ouAsset - the Asset you want to convert to
   * @returns CryptoAmount of input
   */
  async convert(input: CryptoAmount, outAsset: Asset): Promise<CryptoAmount> {
    return await this.thorchainCache.convert(input, outAsset)
  }
  /**
   * Finds the required confCount required for an inbound or outbound Tx to THORChain. Estimate based on Midgard data only.
   *
   * Finds the gas asset of the given asset (e.g. BUSD is on BNB), finds the value of asset in Gas Asset then finds the required confirmation count.
   * ConfCount is then times by 6 seconds.
   *
   * @param inbound: CryptoAmount - amount/asset of the outbound amount.
   * @returns time in seconds before a Tx is confirmed by THORChain
   * @see https://docs.thorchain.org/chain-clients/overview
   */
  private async confCounting(inbound: CryptoAmount): Promise<number> {
    // RUNE, BNB and Synths have near instant finality, so no conf counting required. - need to make a BFT only case.
    if (
      isAssetRuneNative(inbound.asset) ||
      inbound.asset.chain == AssetBNB.chain ||
      inbound.asset.chain == AssetAtom.chain ||
      inbound.asset.synth
    ) {
      return this.chainAttributes[Chain.THORChain].avgBlockTimeInSecs
    }
    // Get the gas asset for the inbound.asset.chain
    const chainGasAsset = getChainAsset(inbound.asset.chain)

    // check for chain asset, else need to convert asset value to chain asset.
    const amountInGasAsset = await this.thorchainCache.convert(inbound, chainGasAsset)
    // Convert to Asset Amount
    const amountInGasAssetInAsset = amountInGasAsset.assetAmount

    const confConfig = this.chainAttributes[inbound.asset.chain]
    // find the required confs
    const requiredConfs = Math.ceil(amountInGasAssetInAsset.amount().div(confConfig.blockReward).toNumber())
    // convert that into seconds
    return requiredConfs * confConfig.avgBlockTimeInSecs
  }
  /**
   * Works out how long an outbound Tx will be held by THORChain before sending.
   *
   * @param outboundAmount: CryptoAmount  being sent.
   * @returns required delay in seconds
   * @see https://gitlab.com/thorchain/thornode/-/blob/develop/x/thorchain/manager_txout_current.go#L548
   */
  async outboundDelay(outboundAmount: CryptoAmount): Promise<number> {
    const networkValues = await this.thorchainCache.getNetworkValues()

    const minTxOutVolumeThreshold = new CryptoAmount(
      baseAmount(networkValues['MINTXOUTVOLUMETHRESHOLD']),
      AssetRuneNative,
    )
    const maxTxOutOffset = networkValues['MAXTXOUTOFFSET']
    let txOutDelayRate = new CryptoAmount(baseAmount(networkValues['TXOUTDELAYRATE']), AssetRuneNative)
    const getScheduledOutboundValue = await this.thorchainCache.midgard.getScheduledOutboundValue()
    const thorChainblocktime = this.chainAttributes[Chain.THORChain].avgBlockTimeInSecs // blocks required to confirm tx

    // If asset is equal to Rune set runeValue as outbound amount else set it to the asset's value in rune
    const runeValue = await this.thorchainCache.convert(outboundAmount, AssetRuneNative)
    // Check rune value amount
    if (runeValue.lt(minTxOutVolumeThreshold)) {
      return thorChainblocktime
    }
    // Rune value in the outbound queue
    if (getScheduledOutboundValue == undefined) {
      throw new Error(`Could not return Scheduled Outbound Value`)
    }
    // Add OutboundAmount in rune to the oubound queue
    const outboundAmountTotal = runeValue.plus(getScheduledOutboundValue)
    // calculate the if outboundAmountTotal is over the volume threshold
    const volumeThreshold = outboundAmountTotal.div(minTxOutVolumeThreshold)
    // check delay rate
    txOutDelayRate = txOutDelayRate.minus(volumeThreshold).baseAmount.amount().lt(1)
      ? new CryptoAmount(baseAmount(1), AssetRuneNative)
      : txOutDelayRate
    // calculate the minimum number of blocks in the future the txn has to be
    let minBlocks = runeValue.div(txOutDelayRate).baseAmount.amount().toNumber()
    minBlocks = minBlocks > maxTxOutOffset ? maxTxOutOffset : minBlocks
    return minBlocks * thorChainblocktime
  }
}
