import { AssetAtom } from '@xchainjs/xchain-cosmos/lib'
import { MemberPool } from '@xchainjs/xchain-midgard/lib'
import { isAssetRuneNative } from '@xchainjs/xchain-thorchain/lib'
import { Asset, AssetBNB, AssetRuneNative, Chain, THORChain, baseAmount, eqAsset } from '@xchainjs/xchain-util'
import { BigNumber } from 'bignumber.js'

import { DefaultChainAttributes } from './chain-defaults'
import { CryptoAmount } from './crypto-amount'
import { ThorchainCache } from './thorchain-cache'
import {
  ChainAttributes,
  EstimateLP,
  EstimateSwapParams,
  InboundDetail,
  PoolRatios,
  SwapEstimate,
  TotalFees,
  TxSubmitted,
  UnitData,
  liquidityPosition,
} from './types'
import { getLiquidityUnits, getPoolShare, getSlipOnLiquidity } from './utils'
import { calcNetworkFee, getChainAsset } from './utils/swap'
import { Wallet } from './wallet'

const BN_1 = new BigNumber(1)

/**
 * THORChain Class for interacting with THORChain.
 * Recommended main class to use for swapping with THORChain
 * Has access to Midgard and THORNode data
 */
export class ThorchainAMM {
  private thorchainCache: ThorchainCache
  private chainAttributes: Record<Chain, ChainAttributes>

  /**
   * Contructor to create a ThorchainAMM
   *
   * @param midgard - an instance of the midgard API (could be pointing to stagenet,testnet,mainnet)
   * @param expirePoolCacheMillis - how long should the pools be cached before expiry
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
    console.log(JSON.stringify(inboundDetails, null, 2))
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
   * Conducts a swap with the given inputs. Should be called after estimateSwap() to ensure the swap is valid
   *
   * @param wallet - wallet to use
   * @param params - swap paraps
   * @param destinationAddress - were to send the output of the swap
   * @param affiliateAddress - were to send the affilate Address, should be a THOR address (optional)
   * @param interfaceID - id if the calling interface (optional)
   * @returns {TxSubmitted} - Tx Hash, URL of BlockExplorer and expected wait time.
   */
  public async doSwap(
    wallet: Wallet,
    params: EstimateSwapParams,
    destinationAddress: string,
    affiliateAddress = '',
    interfaceID = 999,
  ): Promise<TxSubmitted> {
    // TODO validate all input fields
    this.isValidSwap(params)
    // remove any affiliateFee. netInput * affiliateFee (%age) of the destination asset type
    const affiliateFee = params.input.baseAmount.times(params.affiliateFeePercent || 0)
    // Work out LIM from the slip percentage
    let limPercentage = BN_1
    if (params.slipLimit) {
      limPercentage = BN_1.minus(params.slipLimit || 1)
    } // else allowed slip is 100%

    // out min outbound asset based on limPercentage
    const limAssetAmount = await this.thorchainCache.convert(params.input.times(limPercentage), params.destinationAsset)

    let waitTimeSeconds = await this.confCounting(params.input)
    const outboundDelay = await this.outboundDelay(limAssetAmount)
    waitTimeSeconds = outboundDelay + waitTimeSeconds

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
    const input = params.input
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

    const swapFeeInAsset = new CryptoAmount(swapOutput.swapFee, AssetRuneNative)
    const swapFeeInRune = await this.thorchainCache.convert(swapFeeInAsset, AssetRuneNative)

    const outputInAsset = new CryptoAmount(swapOutput.output, params.destinationAsset)
    const outputInRune = await this.thorchainCache.convert(outputInAsset, AssetRuneNative)

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
  private async checkCoverFees(params: EstimateSwapParams, estimate: SwapEstimate): Promise<string | undefined> {
    let result: string | undefined = undefined
    const input = await this.thorchainCache.convert(params.input, AssetRuneNative)
    const fees = await this.getFeesIn(estimate.totalFees, AssetRuneNative)

    const totalSwapFeesInRune = fees.inboundFee.plus(fees.outboundFee).plus(fees.swapFee).plus(fees.affiliateFee)
    if (totalSwapFeesInRune.gte(input))
      result = `Input amount ${input.formatedAssetString()} is less than or equal to total swap fees`
    return result
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
    const thorChainblocktime = this.chainAttributes[THORChain].avgBlockTimeInSecs // blocks required to confirm tx

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
   *
   * @param params - parameters needed for a estimated liquidity position
   * @returns - type object EstimateLP
   */
  public async estimatAddLP(params: liquidityPosition): Promise<EstimateLP> {
    const assetPool = await this.thorchainCache.getPoolForAsset(params.asset.asset)
    // returns lp units for asset/rune for the pool
    const lpUnits = getLiquidityUnits(
      { assetDeposited: params.asset.baseAmount, runeDeposited: params.rune.baseAmount },
      assetPool,
    )
    const inboundDetails = await this.thorchainCache.midgard.getInboundDetails()
    const unitData: UnitData = {
      totalUnits: new BigNumber(assetPool.pool.liquidityUnits),
      liquidityUnits: lpUnits,
    }
    const poolShare = getPoolShare(unitData, assetPool)
    const waitTimeSeconds = await this.confCounting(params.asset)
    const assetInboundFee = calcNetworkFee(params.asset.asset, inboundDetails[params.asset.asset.chain].gas_rate)
    const runeInboundFee = calcNetworkFee(params.rune.asset, inboundDetails[params.rune.asset.chain].gas_rate)
    const totalFees = (await this.convert(assetInboundFee, AssetRuneNative)).plus(runeInboundFee)
    const slip = getSlipOnLiquidity(
      { assetShare: params.asset.baseAmount.amount(), runeShare: params.rune.baseAmount.amount() },
      assetPool,
    )
    const estimateLP: EstimateLP = {
      slip: slip,
      poolShare: poolShare,
      runeToAssetRatio: assetPool.runeToAssetRatio,
      transactionFee: {
        assetFee: assetInboundFee,
        runeFee: runeInboundFee,
        TotalFees: totalFees,
      },
      estimatedWait: waitTimeSeconds,
    }
    return estimateLP
  }

  /**
   *
   * @param wallet - instantiated wallet
   * @param params - liquidity parameters
   * @returns
   */
  public async liquidityPosition(wallet: Wallet, params: liquidityPosition): Promise<TxSubmitted[]> {
    const inboundDetails = await this.thorchainCache.midgard.getInboundDetails()
    const assetInboundFee = calcNetworkFee(params.asset.asset, inboundDetails[params.asset.asset.chain].gas_rate)
    const runeInboundFee = calcNetworkFee(params.rune.asset, inboundDetails[params.rune.asset.chain].gas_rate)
    const waitTimeSeconds = await this.confCounting(params.asset)
    // Need to do a fee check here
    console.log(await this.convert(assetInboundFee, params.asset.asset))
    console.log(await this.convert(runeInboundFee, AssetRuneNative))
    // Fees need to be less than LP amount.
    // Might be better to do assetInboundFee * 4 to account for inbound and outbound fees
    // if (as) {
    //   throw Error('Fee is greater than asset amount')
    // }
    return wallet.addLiquidity({
      asset: params.asset,
      rune: params.rune,
      action: params.action,
      waitTimeSeconds: waitTimeSeconds,
    })
  }

  /**
   * Do not send assetNativeRune, There is no pool for it.
   * @param asset - asset needed to find the pool
   * @returns - object type ratios
   */
  public async getPoolRatios(asset: Asset): Promise<PoolRatios> {
    const assetPool = await this.thorchainCache.getPoolForAsset(asset)
    const poolRatio: PoolRatios = {
      assetToRune: assetPool.assetToRuneRatio,
      runeToAsset: assetPool.runeToAssetRatio,
    }
    return poolRatio
  }

  /**
   *
   * @param params - liquidity parameters
   * @param percent - percentage removed
   * @return
   */
  public async removeLiquidityPosition(wallet: Wallet, params: liquidityPosition): Promise<TxSubmitted> {
    const assetClient = wallet.clients[params.asset.asset.chain]
    const address = assetClient.getAddress()
    const memberDetail = (await this.thorchainCache.midgard.getMember(address)).pools.find((item) => item)
    if (!memberDetail) throw Error(`could not find details for this address`)
    const assetAmount = new CryptoAmount(baseAmount(memberDetail.assetAdded), params.asset.asset)
    const waitTimeSeconds = await this.confCounting(assetAmount)
    if (!params.percentage) throw Error(`Please pass in a percentage for withdrawal`)

    return wallet.removeLiquidity({
      asset: params.asset,
      rune: params.rune,
      action: params.action,
      percentage: params.percentage,
      waitTimeSeconds: waitTimeSeconds,
    })
    //const memo = `-:${asset.chain}.${asset.symbol}:${percent.mul(100).toFixed(0)}`
  }

  /**
   *
   * @param address - address used for Lp
   * @returns - Type Object MemberPool
   */
  public async checkLiquidityPosition(address: string): Promise<MemberPool> {
    const memberDetails = (await this.thorchainCache.midgard.getMember(address)).pools.find((item) => item)
    if (!memberDetails) throw Error(`could not find details for this address`)
    return memberDetails
  }
}
