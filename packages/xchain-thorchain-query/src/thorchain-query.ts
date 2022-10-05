// import { Network } from '@xchainjs/xchain-client'

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
  EstimateSwapParams,
  EstimateWithdrawLP,
  InboundDetail,
  LiquidityPosition,
  PoolRatios,
  PostionDepositValue,
  RemoveLiquidityPosition,
  SwapEstimate,
  TotalFees,
  TxDetails,
  UnitData,
} from './types'
import { getLiquidityProtectionData, getLiquidityUnits, getPoolShare, getSlipOnLiquidity } from './utils/liquidity'
import { calcNetworkFee, getChainAsset } from './utils/swap'

const BN_1 = new BigNumber(1)

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
  public async estimateSwap({
    input,
    destinationAsset,
    destinationAddress,
    affiliateAddress = '',
    interfaceID = 999,
    affiliateFeePercent = 0,
    slipLimit,
  }: EstimateSwapParams): Promise<TxDetails> {
    this.isValidSwap({
      input,
      destinationAsset,
      destinationAddress,
      affiliateAddress,
      interfaceID,
      affiliateFeePercent,
      slipLimit,
    })

    const inboundDetails = await this.thorchainCache.getInboundDetails()

    const sourceInboundDetails = inboundDetails[input.asset.chain]
    // console.log(JSON.stringify(sourceInboundDetails, null, 2))
    const destinationInboundDetails = inboundDetails[destinationAsset.chain]
    // console.log(JSON.stringify(destinationInboundDetails, null, 2))

    const swapEstimate = await this.calcSwapEstimate(
      {
        input,
        destinationAsset,
        destinationAddress,
        affiliateAddress,
        interfaceID,
        affiliateFeePercent,
        slipLimit,
      },
      sourceInboundDetails,
      destinationInboundDetails,
    )

    // Remove any affiliateFee. netInput * affiliateFee (%age) of the destination asset type
    const affiliateFee = input.baseAmount.times(affiliateFeePercent || 0)

    // Calculate expiry time
    const currentDatetime = new Date()
    const minutesToAdd = 15
    const expiryDatetime = new Date(currentDatetime.getTime() + minutesToAdd * 60000)

    // Check for errors
    const errors = await this.getSwapEstimateErrors(
      {
        input,
        destinationAsset,
        destinationAddress,
        affiliateAddress,
        interfaceID,
        affiliateFeePercent,
        slipLimit,
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
      // Retrieve inbound Asgard address.
      const inboundAsgard = (await this.thorchainCache.getInboundAddresses())[input.asset.chain]
      txDetails.toAddress = inboundAsgard?.address || ''
      // Work out LIM from the slip percentage
      let limPercentage = BN_1
      if (slipLimit) {
        limPercentage = BN_1.minus(slipLimit || 1)
      } // else allowed slip is 100%
      const limAssetAmount = swapEstimate.netOutput.times(limPercentage)

      const inboundDelay = await this.confCounting(input)
      const outboundDelay = await this.outboundDelay(limAssetAmount)
      txDetails.txEstimate.waitTimeSeconds = outboundDelay + inboundDelay

      // Construct memo
      txDetails.memo = this.constructSwapMemo({
        input: input,
        destinationAsset: destinationAsset,
        limit: limAssetAmount.baseAmount,
        destinationAddress: destinationAddress,
        affiliateAddress: affiliateAddress,
        affiliateFee,
        interfaceID: interfaceID,
      })
    }

    return txDetails
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
    // NOTE need to convert the asset to 8 decimals places for all calcs
    const DEFAULT_THORCHAIN_DECIMALS = 8
    // If input is already in 8 decimals skip the convert
    const input =
      params.input.baseAmount.decimal === DEFAULT_THORCHAIN_DECIMALS
        ? params.input
        : await this.thorchainCache.convert(params.input, params.input.asset)

    // If asset is already rune native, skip the convert
    const inputInRune =
      input.asset === AssetRuneNative ? input : await this.thorchainCache.convert(input, AssetRuneNative)

    const inboundFeeInAsset = calcNetworkFee(input.asset, sourceInboundDetails)
    // Retrieve outbound fee from inboundAddressDetails.
    const outboundFeeInAsset = new CryptoAmount(
      baseAmount(destinationInboundDetails.outboundFee),
      params.destinationAsset,
    )
    // convert fees to rune
    const inboundFeeInRune = await this.thorchainCache.convert(inboundFeeInAsset, AssetRuneNative)
    let outboundFeeInRune = await this.thorchainCache.convert(outboundFeeInAsset, AssetRuneNative)

    // ---------- Remove Fees from inbound before doing the swap -----------
    // TODO confirm with chris about this change, was there a reason why this was commented out?
    const inputMinusInboundFeeInRune = inputInRune.minus(inboundFeeInRune)
    //>//const inputMinusInboundFeeInRune = inputInRune

    // remove any affiliateFee. netInput * affiliateFee (%age) of the destination asset type
    const affiliateFeeInRune = inputMinusInboundFeeInRune.times(params.affiliateFeePercent || 0)
    // remove the affiliate fee from the input.
    const inputNetAmountInRune = inputMinusInboundFeeInRune.minus(affiliateFeeInRune)
    // convert back to input asset
    const inputNetInAsset = await this.thorchainCache.convert(inputNetAmountInRune, input.asset)

    // Check outbound fee is equal too or greater than 1 USD * need to find a more permanent solution to this. referencing just 1 stable coin pool has problems
    if (params.destinationAsset.chain !== Chain.THORChain && !params.destinationAsset.synth) {
      const deepestUSDPOOL = await this.thorchainCache.getDeepestUSDPool()
      const usdAsset = deepestUSDPOOL.asset

      const networkValues = await this.thorchainCache.midgard.getNetworkValues()
      const usdMinFee = new CryptoAmount(baseAmount(networkValues['MINIMUML1OUTBOUNDFEEUSD']), usdAsset)
      // const FeeInUSD = await this.convert(outboundFeeInRune, usdAsset)
      const checkOutboundFee = (await this.convert(outboundFeeInRune, usdAsset)).gte(usdMinFee)
      if (!checkOutboundFee) {
        const newFee = usdMinFee
        outboundFeeInRune = await this.convert(newFee, AssetRuneNative)
      }
    }

    // Now calculate swap output based on inputNetAmount
    const swapOutput = await this.thorchainCache.getExpectedSwapOutput(inputNetInAsset, params.destinationAsset)
    const swapFeeInRune = await this.thorchainCache.convert(swapOutput.swapFee, AssetRuneNative)
    const outputInRune = await this.thorchainCache.convert(swapOutput.output, AssetRuneNative)

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
   *
   * @param params - swap object
   * @returns - constructed memo string
   */
  private constructSwapMemo(params: ConstructMemo): string {
    const limstring = params.limit.amount().toFixed()

    // create LIM with interface ID
    const lim = limstring.substring(0, limstring.length - 3).concat(params.interfaceID.toString())
    // create the full memo
    let memo = `=:${assetToString(params.destinationAsset)}`

    if (params.affiliateAddress != '' || params.affiliateFee == undefined) {
      memo = memo.concat(
        `:${params.destinationAddress}:${lim}:${params.affiliateAddress}:${params.affiliateFee.amount().toFixed()}`,
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
    const lpUnits = getLiquidityUnits({ asset: params.asset.baseAmount, rune: params.rune.baseAmount }, assetPool)
    const inboundDetails = await this.thorchainCache.getInboundDetails()
    const unitData: UnitData = {
      liquidityUnits: baseAmount(lpUnits),
      totalUnits: baseAmount(assetPool.pool.liquidityUnits),
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
    const slip = getSlipOnLiquidity({ asset: params.asset.baseAmount, rune: params.rune.baseAmount }, assetPool)
    const estimateLP: EstimateAddLP = {
      slipPercent: slip.times(100),
      poolShare: poolShare,
      lpUnits: baseAmount(lpUnits),
      runeToAssetRatio: assetPool.runeToAssetRatio,
      transactionFee: {
        assetFee: assetInboundFee,
        runeFee: runeInboundFee,
        totalFees: totalFees,
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
  public async checkLiquidityPosition(asset: Asset, assetOrRuneAddress: string): Promise<LiquidityPosition> {
    const poolAsset = await this.thorchainCache.getPoolForAsset(asset)
    if (!poolAsset) throw Error(`Could not find pool for ${asset}`)

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
      totalUnits: baseAmount(poolAsset.pool.liquidityUnits),
      liquidityUnits: baseAmount(liquidityProvider.units),
    }
    //console.log(`unit data`, unitData.totalUnits.amount().toNumber(), unitData.liquidityUnits.amount().toNumber())
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
    // console.log(poolShare.assetShare.toNumber(), poolShare.runeShare.toNumber())
    // console.log(poolAsset.pool.liquidityUnits)
    const impermanentLossProtection = getLiquidityProtectionData(currentLP, poolShare, block)
    const lpPosition: LiquidityPosition = {
      poolShare,
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
  public async estimateWithdrawLP(params: RemoveLiquidityPosition): Promise<EstimateWithdrawLP> {
    // Caution Dust Limits: BTC,BCH,LTC chains 10k sats; DOGE 1m Sats; ETH 0 wei; THOR 0 RUNE.
    if (!params.assetAddress) throw Error(`can't estimate lp without an asset address`)
    const memberDetail = await this.checkLiquidityPosition(params.asset, params.assetAddress)
    const dustValues = await this.getDustValues(params.asset) // returns asset and rune dust values
    const assetPool = await this.thorchainCache.getPoolForAsset(params.asset)

    // get pool share from unit data
    const poolShare = getPoolShare(
      {
        liquidityUnits: baseAmount(memberDetail.position.units),
        totalUnits: baseAmount(assetPool.pool.liquidityUnits),
      },
      assetPool,
    )
    // calculate total fees
    const totalFees = (await this.convert(dustValues.asset, AssetRuneNative)).plus(dustValues.rune)
    // get slip on liquidity removal
    const slip = getSlipOnLiquidity(
      {
        asset: poolShare.assetShare.baseAmount,
        rune: poolShare.runeShare.baseAmount,
      },
      assetPool,
    )
    // TODO make sure we compare wait times for withdrawing both rune and asset OR just rune OR just asset
    const waitTimeSecondsForAsset = await this.confCounting(poolShare.assetShare.div(params.percentage / 100))
    const waitTimeSecondsForRune = await this.confCounting(poolShare.runeShare.div(params.percentage / 100))
    let waitTimeSeconds = 0
    if (params.assetAddress && params.runeAddress) {
      waitTimeSeconds = waitTimeSecondsForAsset + waitTimeSecondsForRune
    } else if (params.assetAddress) {
      waitTimeSeconds = waitTimeSecondsForAsset
    } else {
      waitTimeSeconds = waitTimeSecondsForRune
    }
    const estimateLP: EstimateWithdrawLP = {
      slipPercent: slip.times(100),
      transactionFee: {
        assetFee: dustValues.asset,
        runeFee: dustValues.rune,
        totalFees: totalFees,
      },
      assetAmount: poolShare.assetShare,
      runeAmount: poolShare.runeShare,
      estimatedWaitSeconds: waitTimeSeconds,
      impermanentLossProtection: memberDetail.impermanentLossProtection,
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
}
