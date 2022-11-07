import {
  Asset,
  AssetAtom,
  AssetBNB,
  AssetBTC,
  AssetRuneNative,
  Chain,
  assetAmount,
  assetToBase,
  assetToString,
  baseAmount,
  eqAsset,
  isAssetRuneNative,
} from '@xchainjs/xchain-util'
import { BigNumber } from 'bignumber.js'

import { DefaultChainAttributes } from './chain-defaults'
import { CryptoAmount } from './crypto-amount'
import { ThorchainCache } from './thorchain-cache'
import {
  AddliquidityPosition,
  Block,
  ChainAttributes,
  ConstructMemo,
  DustValues,
  EstimateAddLP,
  EstimateAddSaver,
  EstimateSwapParams,
  EstimateWithdrawLP,
  EstimateWithdrawSaver,
  InboundDetail,
  LiquidityPosition,
  PoolRatios,
  PostionDepositValue,
  SaverFees,
  SaversPosition,
  SwapEstimate,
  SwapOutput,
  TotalFees,
  TxDetails,
  UnitData,
  WithdrawLiquidityPosition,
  getSaver,
} from './types'
import { getLiquidityProtectionData, getLiquidityUnits, getPoolShare, getSlipOnLiquidity } from './utils/liquidity'
import { calcNetworkFee, calcOutboundFee, getBaseAmountWithDiffDecimals, getChainAsset } from './utils/swap'

const BN_1 = new BigNumber(1)
const defaultCache = new ThorchainCache()
/**
 * THORChain Class for interacting with THORChain.
 * Recommended main class to use for swapping with THORChain
 * Has access to Midgard and THORNode data
 */
export class ThorchainQuery {
  readonly thorchainCache: ThorchainCache
  private chainAttributes: Record<Chain, ChainAttributes>

  /**
   * Contructor to create a ThorchainAMM
   *
   * @param thorchainCache - an instance of the ThorchainCache (could be pointing to stagenet,testnet,mainnet)
   * @param chainAttributes - atrributes used to calculate waitTime & conf counting
   * @returns ThorchainAMM
   */
  constructor(thorchainCache = defaultCache, chainAttributes = DefaultChainAttributes) {
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
  public async estimateSwap({
    input,
    destinationAsset,
    destinationAddress,
    slipLimit = new BigNumber('0.03'), //default to 3%
    interfaceID = '555',
    affiliateAddress = '',
    affiliateFeeBasisPoints = 0,
  }: EstimateSwapParams): Promise<TxDetails> {
    await this.isValidSwap({
      input,
      destinationAsset,
      destinationAddress,
      slipLimit,
      affiliateAddress,
      affiliateFeeBasisPoints,
      interfaceID,
    })

    const inboundDetails = await this.thorchainCache.getInboundDetails()
    const sourceInboundDetails = inboundDetails[input.asset.chain]
    const destinationInboundDetails = inboundDetails[destinationAsset.chain]

    // Calculate swap estimate
    const swapEstimate = await this.calcSwapEstimate(
      {
        input,
        destinationAsset,
        destinationAddress,
        slipLimit,
        affiliateAddress,
        affiliateFeeBasisPoints,
        interfaceID,
      },
      sourceInboundDetails,
      destinationInboundDetails,
    )
    // Calculate transaction expiry time
    const currentDatetime = new Date()
    const minutesToAdd = 15
    const expiryDatetime = new Date(currentDatetime.getTime() + minutesToAdd * 60000)

    // Check for errors
    const errors = await this.getSwapEstimateErrors(
      {
        input,
        destinationAsset,
        destinationAddress,
        slipLimit,
        affiliateAddress,
        affiliateFeeBasisPoints,
        interfaceID,
      },
      swapEstimate,
      sourceInboundDetails,
      destinationInboundDetails,
    )
    const txDetails: TxDetails = {
      memo: '',
      toAddress: '',
      expiry: expiryDatetime,
      txEstimate: swapEstimate,
    }
    if (errors.length > 0) {
      txDetails.txEstimate.canSwap = false
      txDetails.txEstimate.errors = errors
    } else {
      txDetails.txEstimate.canSwap = true
      const inboundAsgard = (await this.thorchainCache.getInboundDetails())[input.asset.chain]
      txDetails.toAddress = inboundAsgard?.address || ''
      // Work out LIM from the slip percentage
      let limPercentage = BN_1
      if (slipLimit) {
        limPercentage = BN_1.minus(slipLimit || 1)
      } // else allowed slip is 100%
      // Lim should allways be 1e8
      const limAssetAmount = swapEstimate.netOutput.times(limPercentage)
      const limAssetAmount8Decimals = getBaseAmountWithDiffDecimals(limAssetAmount, 8)
      const inboundDelay = await this.confCounting(input)
      const outboundDelay = await this.outboundDelay(limAssetAmount)
      txDetails.txEstimate.waitTimeSeconds = outboundDelay + inboundDelay
      // Construct memo
      txDetails.memo = this.constructSwapMemo({
        input: input,
        destinationAsset: destinationAsset,
        limit: baseAmount(limAssetAmount8Decimals),
        destinationAddress: destinationAddress,
        affiliateAddress: affiliateAddress,
        affiliateFeeBasisPoints: affiliateFeeBasisPoints,
        interfaceID: interfaceID,
      })
    }
    return txDetails
  }
  /**
   * Basic Checks for swap information
   * @param params
   */
  private async isValidSwap(params: EstimateSwapParams) {
    if (isAssetRuneNative(params.input.asset)) {
      if (params.input.baseAmount.decimal !== 8)
        throw Error(`input asset ${assetToString(params.input.asset)}  must have decimals of 8`)
    } else {
      const assetPool = await this.thorchainCache.getPoolForAsset(params.input.asset)
      const nativeDecimals = assetPool?.pool.nativeDecimal
      if (
        nativeDecimals &&
        nativeDecimals !== '-1' &&
        params.input.baseAmount.decimal !== Number(assetPool?.pool.nativeDecimal)
      ) {
        throw Error(
          `input asset ${assetToString(params.input.asset)}  must have decimals of ${assetPool?.pool.nativeDecimal}`,
        )
      }
    }
    if (eqAsset(params.input.asset, params.destinationAsset))
      throw Error(`sourceAsset and destinationAsset cannot be the same`)

    if (params.input.baseAmount.lte(0)) throw Error('inputAmount must be greater than 0')
    // Affiliate fee % can't exceed 10% because this is set by TC.
    if (params.affiliateFeeBasisPoints && (params.affiliateFeeBasisPoints < 0 || params.affiliateFeeBasisPoints > 1000))
      throw Error(`affiliateFeeBasisPoints must be between 0 and 1000 basis points`)
    if (params.affiliateFeeBasisPoints && !Number.isInteger(params.affiliateFeeBasisPoints))
      throw Error(`affiliateFeeBasisPoints must be an integer`)
    if (params.slipLimit?.lte(0) || params.slipLimit?.gt(1)) throw Error(`slipLimit must be between 0 and 1`)
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
    const DEFAULT_THORCHAIN_DECIMALS = 8
    // If input is already in 8 decimals skip the convert
    const input =
      params.input.baseAmount.decimal === DEFAULT_THORCHAIN_DECIMALS
        ? params.input
        : await this.thorchainCache.convert(params.input, params.input.asset)

    const inboundFeeInInboundGasAsset = calcNetworkFee(input.asset, sourceInboundDetails)
    const outboundFeeInOutboundGasAsset = calcOutboundFee(params.destinationAsset, destinationInboundDetails)

    // ----------- Remove Fees from inbound before doing the swap -----------
    const inboundFeeInInboundAsset = await this.thorchainCache.convert(inboundFeeInInboundGasAsset, params.input.asset)
    const inputMinusInboundFeeInAsset = input.minus(inboundFeeInInboundAsset)
    // console.log('y', inputMinusInboundFeeInAsset.formatedAssetString())

    // remove any affiliateFee. netInput * affiliateFee (percentage) of the destination asset type
    const affiliateFeePercent = params.affiliateFeeBasisPoints ? params.affiliateFeeBasisPoints / 10000 : 0
    const affiliateFeeInAsset = inputMinusInboundFeeInAsset.times(affiliateFeePercent)
    let affiliateFeeSwapOutputInRune: SwapOutput
    if (isAssetRuneNative(affiliateFeeInAsset.asset)) {
      affiliateFeeSwapOutputInRune = {
        output: affiliateFeeInAsset,
        swapFee: new CryptoAmount(baseAmount(0), AssetRuneNative),
        slip: new BigNumber(0),
      }
    } else {
      affiliateFeeSwapOutputInRune = await this.thorchainCache.getExpectedSwapOutput(
        affiliateFeeInAsset,
        AssetRuneNative,
      )
    }
    // remove the affiliate fee from the input.
    const inputNetInAsset = inputMinusInboundFeeInAsset.minus(affiliateFeeInAsset)

    // Now calculate swap output based on inputNetAmount
    const swapOutputInDestinationAsset = await this.thorchainCache.getExpectedSwapOutput(
      inputNetInAsset,
      params.destinationAsset,
    )
    // ---------------- Remove Outbound Fee ---------------------- /
    const outboundFeeInDestinationAsset = await this.thorchainCache.convert(
      outboundFeeInOutboundGasAsset,
      params.destinationAsset,
    )
    const netOutputInAsset = swapOutputInDestinationAsset.output.minus(outboundFeeInDestinationAsset)
    const totalFees: TotalFees = {
      inboundFee: inboundFeeInInboundGasAsset,
      swapFee: swapOutputInDestinationAsset.swapFee,
      outboundFee: outboundFeeInOutboundGasAsset,
      affiliateFee: affiliateFeeSwapOutputInRune.output,
    }

    const swapEstimate = {
      totalFees: totalFees,
      slipPercentage: swapOutputInDestinationAsset.slip,
      netOutput: netOutputInAsset,
      waitTimeSeconds: 0, // will be set within EstimateSwap if canSwap = true
      canSwap: false, // assume false for now, the getSwapEstimateErrors() step will flip this flag if required
      errors: [],
    }
    return swapEstimate
  }

  /**
   *
   * @param params - swap object
   * @returns - constructed memo string
   */
  private constructSwapMemo(params: ConstructMemo): string {
    const limstring = params.limit.amount().toFixed()
    // create LIM with interface ID
    const lim = limstring.substring(0, limstring.length - 3).concat(params.interfaceID)
    // create the full memo
    let memo = `=:${assetToString(params.destinationAsset)}`
    // NOTE: we should validate affiliate address is EITHER: a thorname or valid thorchain address, currently we cannot do this without importing xchain-thorchain

    if (params.affiliateAddress?.length > 0) {
      // NOTE: we should validate destinationAddress address is valid destination address for the asset type requested
      memo = memo.concat(
        `:${params.destinationAddress}:${lim}:${params.affiliateAddress}:${params.affiliateFeeBasisPoints}`,
      )
    } else {
      memo = memo.concat(`:${params.destinationAddress}:${lim}`)
    }

    // If memo length is too long for BTC, trim it
    if (eqAsset(params.input.asset, AssetBTC) && memo.length > 80) {
      memo = `=:${assetToString(params.destinationAsset)}:${params.destinationAddress}`
    }
    return memo
  }
  // this is commented out for now, see note about affiliate address ~10 lines above
  //
  // private async validateAffiliateAddress(affiliateAddress: string) {
  //   // Affiliate address should be THORName or THORAddress
  //   if (affiliateAddress.length > 0) {
  //     const isValidThorchainAddress = this.clients[Chain.THORChain].validateAddress(affiliateAddress)
  //     const isValidThorname = await this.isThorname(affiliateAddress)
  //     if (!(isValidThorchainAddress || isValidThorname))
  //       throw Error(`affiliateAddress ${affiliateAddress} is not a valid THOR address`)
  //   }
  // }
  // private async isThorname(name: string): Promise<boolean> {
  //   const thornameDetails = await this.thorchainCache.midgard.getTHORNameDetails(name)
  //   return thornameDetails !== undefined
  // }

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
   * Convenience method to convert TotalFees to a different CryptoAmount
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
  async confCounting(inbound: CryptoAmount): Promise<number> {
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
    let txOutDelayRate = new CryptoAmount(baseAmount(networkValues['TXOUTDELAYRATE']), AssetRuneNative).assetAmount
      .amount()
      .toNumber()
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
    txOutDelayRate = txOutDelayRate - volumeThreshold.assetAmount.amount().toNumber() <= 1 ? 1 : txOutDelayRate
    // calculate the minimum number of blocks in the future the txn has to be
    let minBlocks = runeValue.assetAmount.amount().toNumber() / txOutDelayRate
    minBlocks = minBlocks > maxTxOutOffset ? maxTxOutOffset : minBlocks
    return minBlocks * thorChainblocktime
  }

  /**
   * Estimates a liquidity position for given crypto amount value, both asymmetrical and symetrical
   * @param params - parameters needed for a estimated liquidity position
   * @returns - type object EstimateLP
   */
  public async estimateAddLP(params: AddliquidityPosition): Promise<EstimateAddLP> {
    const errors: string[] = []
    if (params.asset.asset.synth || params.rune.asset.synth) errors.push('you cannot add liquidity with a synth')
    if (!isAssetRuneNative(params.rune.asset)) errors.push('params.rune must be THOR.RUNE')

    const assetPool = await this.thorchainCache.getPoolForAsset(params.asset.asset)

    const lpUnits = getLiquidityUnits({ asset: params.asset, rune: params.rune }, assetPool)
    const inboundDetails = await this.thorchainCache.getInboundDetails()
    const unitData: UnitData = {
      liquidityUnits: lpUnits,
      totalUnits: new BigNumber(assetPool.pool.liquidityUnits),
    }
    const poolShare = getPoolShare(unitData, assetPool)
    const assetWaitTimeSeconds = await this.confCounting(params.asset)
    const runeWaitTimeSeconds = await this.confCounting(params.rune)
    const waitTimeSeconds = assetWaitTimeSeconds > runeWaitTimeSeconds ? assetWaitTimeSeconds : runeWaitTimeSeconds

    let assetInboundFee = new CryptoAmount(baseAmount(0), params.asset.asset)
    let runeInboundFee = new CryptoAmount(baseAmount(0), AssetRuneNative)

    if (!params.asset.assetAmount.eq(0)) {
      assetInboundFee = calcNetworkFee(params.asset.asset, inboundDetails[params.asset.asset.chain])
      if (assetInboundFee.assetAmount.amount().times(3).gt(params.asset.assetAmount.amount()))
        errors.push(`Asset amount is less than fees`)
    }
    if (!params.rune.assetAmount.eq(0)) {
      runeInboundFee = calcNetworkFee(params.rune.asset, inboundDetails[params.rune.asset.chain])
      if (runeInboundFee.assetAmount.amount().times(3).gt(params.rune.assetAmount.amount()))
        errors.push(`Rune amount is less than fees`)
    }
    const totalFees = (await this.convert(assetInboundFee, AssetRuneNative)).plus(runeInboundFee)
    const slip = getSlipOnLiquidity({ asset: params.asset, rune: params.rune }, assetPool)
    const estimateLP: EstimateAddLP = {
      assetPool: assetPool.pool.asset,
      slipPercent: slip.times(100),
      poolShare: poolShare,
      lpUnits: baseAmount(lpUnits),
      runeToAssetRatio: assetPool.runeToAssetRatio,
      inbound: {
        fees: {
          asset: assetInboundFee,
          rune: runeInboundFee,
          total: totalFees,
        },
      },
      estimatedWaitSeconds: waitTimeSeconds,
      errors,
      canAdd: errors.length > 0 ? false : true,
    }
    return estimateLP
  }

  /**
   * @param - Asset for lp
   * @param address - address used for Lp
   * @returns - Type Object liquidityPosition
   */
  public async checkLiquidityPosition(asset: Asset, assetOrRuneAddress?: string): Promise<LiquidityPosition> {
    const poolAsset = await this.thorchainCache.getPoolForAsset(asset)
    if (!poolAsset) throw Error(`Could not find pool for ${asset}`)
    if (!assetOrRuneAddress) throw Error(`No address provided ${assetOrRuneAddress}`)

    const liquidityProvider = await this.thorchainCache.thornode.getLiquidityProvider(
      poolAsset.assetString,
      assetOrRuneAddress,
    )
    if (!liquidityProvider) throw Error(`Could not find LP for ${assetOrRuneAddress}`)
    // Current block number for that chain
    const blockData = (await this.thorchainCache.thornode.getLastBlock()).find((item) => item.chain === asset.chain)
    if (!blockData) throw Error(`Could not get block data`)
    // Pools total units & Lp's total units
    const unitData: UnitData = {
      totalUnits: new BigNumber(poolAsset.pool.liquidityUnits),
      liquidityUnits: new BigNumber(liquidityProvider.units),
    }
    const networkValues = await this.thorchainCache.midgard.getNetworkValues()
    const block: Block = {
      current: blockData.thorchain,
      lastAdded: liquidityProvider.last_add_height,
      fullProtection: networkValues['FULLIMPLOSSPROTECTIONBLOCKS'],
    }
    //
    const currentLP: PostionDepositValue = {
      asset: baseAmount(liquidityProvider.asset_deposit_value),
      rune: baseAmount(liquidityProvider.rune_deposit_value),
    }

    const poolShare = getPoolShare(unitData, poolAsset)
    // Liquidity Unit Value Index = sprt(assetdepth * runeDepth) / Poolunits
    // Using this formula we can work out an individual position to find LUVI and then the growth rate
    const depositLuvi = Math.sqrt(
      currentLP.asset.times(currentLP.rune).div(unitData.liquidityUnits).amount().toNumber(),
    )
    const redeemLuvi = Math.sqrt(
      poolShare.assetShare.baseAmount
        .times(poolShare.runeShare.baseAmount)
        .div(unitData.liquidityUnits)
        .amount()
        .toNumber(),
    )
    const lpGrowth = redeemLuvi - depositLuvi
    const currentLpGrowth = lpGrowth > 0 ? lpGrowth / depositLuvi : 0

    const impermanentLossProtection = getLiquidityProtectionData(currentLP, poolShare, block)
    const lpPosition: LiquidityPosition = {
      poolShare,
      lpGrowth: `${(currentLpGrowth * 100).toFixed(2)} %`,
      position: liquidityProvider,
      impermanentLossProtection: impermanentLossProtection,
    }
    return lpPosition
  }

  /**
   * Do not send assetNativeRune, There is no pool for it.
   * @param asset - asset required to find the pool
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
   * @param params
   */
  public async estimateWithdrawLP(params: WithdrawLiquidityPosition): Promise<EstimateWithdrawLP> {
    // Caution Dust Limits: BTC,BCH,LTC chains 10k sats; DOGE 1m Sats; ETH 0 wei; THOR 0 RUNE.
    const assetOrRuneAddress = params.assetAddress ? params.assetAddress : params.runeAddress
    const memberDetail = await this.checkLiquidityPosition(params.asset, assetOrRuneAddress)
    const dustValues = await this.getDustValues(params.asset) // returns asset and rune dust values
    const assetPool = await this.thorchainCache.getPoolForAsset(params.asset)
    // get pool share from unit data
    const poolShare = getPoolShare(
      {
        liquidityUnits: new BigNumber(memberDetail.position.units),
        totalUnits: new BigNumber(assetPool.pool.liquidityUnits),
      },
      assetPool,
    )
    // get slip on liquidity removal
    const slip = getSlipOnLiquidity(
      {
        asset: poolShare.assetShare,
        rune: poolShare.runeShare,
      },
      assetPool,
    )
    // TODO make sure we compare wait times for withdrawing both rune and asset OR just rune OR just asset
    const waitTimeSecondsForAsset = await this.confCounting(poolShare.assetShare.div(params.percentage / 100))
    const waitTimeSecondsForRune = await this.confCounting(poolShare.runeShare.div(params.percentage / 100))
    let waitTimeSeconds = 0
    if (memberDetail.position.asset_address && memberDetail.position.rune_address) {
      waitTimeSeconds =
        waitTimeSecondsForAsset > waitTimeSecondsForRune ? waitTimeSecondsForAsset : waitTimeSecondsForRune
    } else if (memberDetail.position.asset_address) {
      waitTimeSeconds = waitTimeSecondsForAsset
    } else {
      waitTimeSeconds = waitTimeSecondsForRune
    }
    const allInboundDetails = await this.thorchainCache.getInboundDetails()
    const inboundDetails = allInboundDetails[params.asset.chain]
    const runeInbound = calcNetworkFee(AssetRuneNative, inboundDetails)
    const assetInbound = calcNetworkFee(params.asset, inboundDetails)
    const runeOutbound = calcOutboundFee(AssetRuneNative, inboundDetails)
    const assetOutbound = calcOutboundFee(params.asset, inboundDetails)

    const estimateLP: EstimateWithdrawLP = {
      assetAddress: memberDetail.position.asset_address,
      runeAddress: memberDetail.position.rune_address,
      slipPercent: slip.times(100),
      inbound: {
        minToSend: {
          rune: dustValues.rune,
          asset: dustValues.asset,
          total: (await this.convert(dustValues.asset, AssetRuneNative)).plus(dustValues.rune),
        },
        fees: {
          rune: runeInbound,
          asset: assetInbound,
          total: (await this.convert(assetInbound, AssetRuneNative)).plus(runeInbound),
        },
      },
      outboundFee: {
        asset: assetOutbound,
        rune: runeOutbound,
        total: (await this.convert(assetOutbound, AssetRuneNative)).plus(runeOutbound),
      },
      assetAmount: poolShare.assetShare,
      runeAmount: poolShare.runeShare,
      lpGrowth: memberDetail.lpGrowth,
      estimatedWaitSeconds: waitTimeSeconds,
      impermanentLossProtection: memberDetail.impermanentLossProtection,
      assetPool: assetPool.pool.asset,
    }
    return estimateLP
  }
  /**
   * // can this become a quried constant? added to inbound_addresses or something
   * @param asset - asset needed to retrieve dust values
   * @returns - object type dust values
   */
  private async getDustValues(asset: Asset): Promise<DustValues> {
    let dustValues: DustValues
    switch (asset.chain) {
      case 'BNB':
        dustValues = {
          asset: new CryptoAmount(assetToBase(assetAmount(0.000001)), AssetBNB),
          rune: new CryptoAmount(assetToBase(assetAmount(0)), AssetRuneNative),
        }
        return dustValues
      case 'BTC' || `BCH` || `LTC`:
        // 10k sats
        dustValues = {
          asset: new CryptoAmount(assetToBase(assetAmount(0.0001)), asset),
          rune: new CryptoAmount(assetToBase(assetAmount(0)), AssetRuneNative),
        }
        return dustValues
      case 'ETH':
        // 0 wei
        dustValues = {
          asset: new CryptoAmount(assetToBase(assetAmount(0)), asset),
          rune: new CryptoAmount(assetToBase(assetAmount(0)), AssetRuneNative),
        }
        return dustValues
      case 'THOR':
        // 0 Rune
        dustValues = {
          asset: new CryptoAmount(assetToBase(assetAmount(0)), asset),
          rune: new CryptoAmount(assetToBase(assetAmount(0)), AssetRuneNative),
        }
        return dustValues
      case 'GAIA':
        // 0 GAIA
        dustValues = {
          asset: new CryptoAmount(assetToBase(assetAmount(0)), asset),
          rune: new CryptoAmount(assetToBase(assetAmount(0)), AssetRuneNative),
        }
        return dustValues
      case 'DOGE':
        // 1 million sats
        dustValues = {
          asset: new CryptoAmount(assetToBase(assetAmount(0.01)), asset),
          rune: new CryptoAmount(assetToBase(assetAmount(0)), AssetRuneNative),
        }
        return dustValues
      default:
        throw Error('Unknown chain')
    }
  }

  // Savers Queries
  // Derrived from https://dev.thorchain.org/thorchain-dev/connection-guide/savers-guide
  public async estimateAddSaver(addAmount: CryptoAmount): Promise<EstimateAddSaver> {
    if (isAssetRuneNative(addAmount.asset)) throw Error(`Native Rune is not supported only L1's`)
    const allInboundDetails = await this.thorchainCache.getInboundDetails()
    const pool = (await this.thorchainCache.getPoolForAsset(addAmount.asset)).pool
    const inboundDetails = allInboundDetails[addAmount.asset.chain]
    const vault = inboundDetails.address
    const isSaversPool = (await this.thorchainCache.thornode.getPools()).find(
      (item) => item.asset === `${addAmount.asset.chain}/${addAmount.asset.ticker}`,
    )?.is_savers_pool
    if (!isSaversPool) throw Error(`Pool has no record of being a saver`)
    // network fee is a 1/3 of the outbound fee
    const networkFees = new CryptoAmount(
      baseAmount(inboundDetails.outboundFee.times(0.33), +pool.nativeDecimal),
      addAmount.asset,
    )
    // Pool asset depth
    const assetDepth = new CryptoAmount(baseAmount(+pool.assetDepth, +pool.nativeDecimal), addAmount.asset)

    // liquidity fees calculated from amount added and pool depths
    const liquidityFees = addAmount.div(addAmount.plus(assetDepth)).times(addAmount)
    const saversFees: SaverFees = {
      networkFee: networkFees,
      liquidityFee: liquidityFees,
      totalFees: networkFees.plus(liquidityFees),
    }
    //construct memo
    const memo = `+:${addAmount.asset.chain}/${addAmount.asset.ticker}`

    // Calculate transaction expiry time of the vault address
    const currentDatetime = new Date()
    const minutesToAdd = 15
    const expiryDatetime = new Date(currentDatetime.getTime() + minutesToAdd * 60000)

    const estimatedWait = await this.confCounting(addAmount)
    const estimateAddSaver: EstimateAddSaver = {
      assetAmount: addAmount,
      fee: saversFees,
      expiry: expiryDatetime,
      toAddress: vault,
      memo: memo,
      estimatedWaitTime: estimatedWait,
      canAddSaver: isSaversPool,
    }
    return estimateAddSaver
  }
  public async estimateWithdrawSaver(removeAmount: CryptoAmount): Promise<EstimateWithdrawSaver> {
    if (isAssetRuneNative(removeAmount.asset)) throw Error(`Native Rune is not supported`)
    const allInboundDetails = await this.thorchainCache.getInboundDetails()
    const pool = (await this.thorchainCache.getPoolForAsset(removeAmount.asset)).pool
    const inboundDetails = allInboundDetails[removeAmount.asset.chain]
    const vault = inboundDetails.address

    // network fee is the outbound fee
    const networkFees = new CryptoAmount(
      baseAmount(inboundDetails.outboundFee, +pool.nativeDecimal),
      removeAmount.asset,
    )
    // Pool asset depth
    const assetDepth = new CryptoAmount(baseAmount(+pool.assetDepth, +pool.nativeDecimal), removeAmount.asset)

    // liquidity fees calculated from amount added and pool depths
    const liquidityFees = removeAmount.div(removeAmount.plus(assetDepth)).times(removeAmount)
    const saversFees: SaverFees = {
      networkFee: networkFees,
      liquidityFee: liquidityFees,
      totalFees: networkFees.plus(liquidityFees),
    }

    // Calculate transaction expiry time of the vault address
    const currentDatetime = new Date()
    const minutesToAdd = 15
    const expiryDatetime = new Date(currentDatetime.getTime() + minutesToAdd * 60000)
    //construct memo
    const memo = `-:${removeAmount.asset.chain}/${removeAmount.asset.ticker}`

    const estimatedWait = await this.confCounting(removeAmount)

    const estimateWithdrawSaver: EstimateWithdrawSaver = {
      assetAmount: removeAmount,
      fee: saversFees,
      expiry: expiryDatetime,
      toAddress: vault,
      memo: memo,
      estimatedWaitTime: estimatedWait,
    }
    return estimateWithdrawSaver
  }

  /**
   *
   * @param params - getSaver object > asset, addresss, height?
   * @returns - Savers position object
   */
  public async getSaverPosition(params: getSaver): Promise<SaversPosition> {
    const blockData = (await this.thorchainCache.thornode.getLastBlock()).find(
      (item) => item.chain === params.asset.chain,
    )
    const savers = (await this.thorchainCache.thornode.getSavers(`${params.asset.chain}.${params.asset.ticker}`)).find(
      (item) => item.asset_address === params.address,
    )
    const pool = (await this.thorchainCache.getPoolForAsset(params.asset)).pool
    const saversPool = (await this.thorchainCache.thornode.getPools()).find(
      (item) => item.asset === `${params.asset.chain}/${params.asset.ticker}`,
    )
    if (!saversPool) throw Error(`Pool has no record of being a saver`)
    if (!savers?.last_add_height) throw Error(`Could not find position for ${params.address}`)
    if (!blockData?.thorchain) throw Error(`Could not get thorchain block height`)
    const ownerUnits = savers.units
    const saverUnits = saversPool.synth_units
    const assetDepth = saversPool.balance_asset
    const redeemableValue = (+ownerUnits * +saverUnits) / +assetDepth
    const depositAmount = new CryptoAmount(baseAmount(savers.asset_deposit_value, +pool.nativeDecimal), params.asset)
    const redeemableAssetAmount = new CryptoAmount(baseAmount(redeemableValue, +pool.nativeDecimal), params.asset)
    const saversAge = (blockData?.thorchain - savers.last_add_height) / ((365 * 86400) / 6)

    const saverGrowth = redeemableAssetAmount.minus(depositAmount).div(depositAmount).times(100)
    const saversPos: SaversPosition = {
      depositValue: depositAmount,
      redeemableValue: redeemableAssetAmount,
      lastAddHeight: savers.last_add_height,
      growth: saverGrowth.assetAmount.amount().toNumber(),
      age: saversAge,
    }
    return saversPos
  }
}
