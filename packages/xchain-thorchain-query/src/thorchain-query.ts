import { LastBlock } from '@xchainjs/xchain-thornode'
import {
  Asset,
  Chain,
  assetAmount,
  assetFromStringEx,
  assetToBase,
  assetToString,
  baseAmount,
} from '@xchainjs/xchain-util'
import { BigNumber } from 'bignumber.js'

import { DefaultChainAttributes } from './chain-defaults'
import { CryptoAmount } from './crypto-amount'
import { ThorchainCache } from './thorchain-cache'
import {
  AddliquidityPosition,
  Block,
  ChainAttributes,
  DustValues,
  EstimateAddLP,
  EstimateAddSaver,
  EstimateWithdrawLP,
  EstimateWithdrawSaver,
  LiquidityPosition,
  LoanCloseParams,
  LoanCloseQuote,
  LoanOpenParams,
  LoanOpenQuote,
  PoolRatios,
  PostionDepositValue,
  QuoteSwapParams,
  SaverFees,
  SaversPosition,
  SaversWithdraw,
  TotalFees,
  TxDetails,
  UnitData,
  WithdrawLiquidityPosition,
  getSaver,
} from './types'
import { AssetBNB, AssetRuneNative, BNBChain, GAIAChain, THORChain, isAssetRuneNative } from './utils'
import { getLiquidityProtectionData, getLiquidityUnits, getPoolShare, getSlipOnLiquidity } from './utils/liquidity'
import { calcNetworkFee, calcOutboundFee, getBaseAmountWithDiffDecimals, getChainAsset } from './utils/utils'

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
   *
   * @param quoteSwapParams -  input params
   * @returns
   */
  public async quoteSwap({
    fromAsset,
    destinationAsset,
    amount,
    destinationAddress,
    streamingInterval,
    streamingQuantity,
    fromAddress,
    toleranceBps,
    affiliateBps,
    affiliateAddress,
    height,
  }: QuoteSwapParams): Promise<TxDetails> {
    const errors: string[] = []

    const fromAssetString = assetToString(fromAsset)
    const toAssetString = assetToString(destinationAsset)
    const inputAmount = getBaseAmountWithDiffDecimals(amount, 8)

    // fetch quote
    const swapQuote = await this.thorchainCache.thornode.getSwapQuote(
      fromAssetString,
      toAssetString,
      inputAmount.toNumber(),
      destinationAddress,
      streamingInterval,
      streamingQuantity,
      fromAddress,
      toleranceBps,
      affiliateBps,
      affiliateAddress,
      height,
    )

    // error handling for fetch response
    const response: { error?: string } = JSON.parse(JSON.stringify(swapQuote))
    if (response.error) errors.push(`Thornode request quote: ${response.error}`)
    if (errors.length > 0) {
      return {
        memo: ``,
        toAddress: ``,
        dustThreshold: new CryptoAmount(baseAmount(0), AssetRuneNative),
        expiry: new Date(),
        txEstimate: {
          totalFees: {
            asset: destinationAsset,
            affiliateFee: new CryptoAmount(baseAmount(0), AssetRuneNative),
            outboundFee: new CryptoAmount(baseAmount(0), AssetRuneNative),
          },
          slipBasisPoints: 0,
          netOutput: new CryptoAmount(baseAmount(0), destinationAsset),
          outboundDelaySeconds: 0,
          inboundConfirmationSeconds: 0,
          canSwap: false,
          errors,
          netOutputStreaming: new CryptoAmount(baseAmount(0), AssetRuneNative),
          maxStreamingQuantity: 0,
          outboundDelayBlocks: 0,
          streamingSlipBasisPoints: 0,
          streamingSwapBlocks: 0,
          totalSwapSeconds: 0,
          warning: '',
        },
      }
    }
    // The recommended minimum inbound amount for this transaction type & inbound asset.
    // Sending less than this amount could result in failed refunds
    const feeAsset = assetFromStringEx(swapQuote.fees.asset)
    if (swapQuote.recommended_min_amount_in && inputAmount.toNumber() < +swapQuote.recommended_min_amount_in)
      errors.push(
        `Error amount in: ${inputAmount.toNumber()} is less than reccommended Min Amount: ${
          swapQuote.recommended_min_amount_in
        }`,
      )
    // Check to see if memo is undefined
    if (swapQuote.memo === undefined) errors.push(`Error parsing swap quote: Memo is ${swapQuote.memo}`)

    // No errors ? and memo is returned ? return quote flag canSwap to true
    const txDetails: TxDetails = {
      memo: swapQuote.memo ? swapQuote.memo : '',
      dustThreshold: new CryptoAmount(baseAmount(swapQuote.dust_threshold), fromAsset),
      toAddress: swapQuote.inbound_address ? swapQuote.inbound_address : '',
      expiry: new Date(swapQuote.expiry * 1000),
      txEstimate: {
        totalFees: {
          asset: fromAsset,
          affiliateFee: new CryptoAmount(baseAmount(swapQuote.fees.affiliate), feeAsset),
          outboundFee: new CryptoAmount(baseAmount(swapQuote.fees.outbound), feeAsset),
        },
        slipBasisPoints: swapQuote.slippage_bps,
        netOutput: new CryptoAmount(baseAmount(swapQuote.expected_amount_out), destinationAsset),
        netOutputStreaming: new CryptoAmount(baseAmount(swapQuote.expected_amount_out), destinationAsset),
        outboundDelaySeconds: swapQuote.outbound_delay_seconds,
        inboundConfirmationSeconds: swapQuote.inbound_confirmation_seconds,
        recommendedMinAmountIn: swapQuote.recommended_min_amount_in,
        maxStreamingQuantity: swapQuote.max_streaming_quantity ? swapQuote.max_streaming_quantity : 0,
        outboundDelayBlocks: swapQuote.outbound_delay_blocks,
        streamingSlipBasisPoints: swapQuote.streaming_slippage_bps,
        streamingSwapBlocks: swapQuote.streaming_swap_blocks ? swapQuote.streaming_swap_blocks : 0,
        totalSwapSeconds: swapQuote.total_swap_seconds ? swapQuote.total_swap_seconds : 0,
        canSwap: !swapQuote.memo || errors.length > 0 ? false : true,
        errors,
        warning: swapQuote.warning,
      },
    }
    return txDetails
  }

  // /**
  //  * This is no longer used
  //  * @param params - swap object
  //  * @returns - constructed memo string
  //  */
  // private constructSwapMemo(memo: string, interfaceID: string): string {
  //   const memoPart = memo.split(':')
  //   if (memoPart.length > 3) {
  //     memoPart[3] =
  //       memoPart[3].length >= 3 ? memoPart[3].substring(0, memoPart[3].length - 3).concat(interfaceID) : interfaceID
  //     let outmemo = ''
  //     for (let i = 0; i < memoPart.length; i++) {
  //       outmemo = outmemo.concat(`${memoPart[i]}:`)
  //     }
  //     return outmemo.substring(0, outmemo.length - 1)
  //   }
  //   return memo
  // }

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
    const getQueue = await this.thorchainCache.thornode.getQueue()
    const outboundValue = new CryptoAmount(baseAmount(getQueue.scheduled_outbound_value), AssetRuneNative)
    const thorChainblocktime = this.chainAttributes[THORChain].avgBlockTimeInSecs // blocks required to confirm tx
    // If asset is equal to Rune set runeValue as outbound amount else set it to the asset's value in rune
    const runeValue = await this.thorchainCache.convert(outboundAmount, AssetRuneNative)
    // Check rune value amount
    if (runeValue.lt(minTxOutVolumeThreshold)) {
      return thorChainblocktime
    }
    // Rune value in the outbound queue
    if (outboundValue == undefined) {
      throw new Error(`Could not return Scheduled Outbound Value`)
    }
    // Add OutboundAmount in rune to the oubound queue
    const outboundAmountTotal = runeValue.plus(outboundValue)
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
      asset: fees.asset,
      // swapFee: await this.convert(fees.swapFee, asset),
      outboundFee: await this.convert(fees.outboundFee, asset),
      affiliateFee: await this.convert(fees.affiliateFee, asset),
      // totatBps: fees.totatBps,
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
      inbound.asset.chain == BNBChain ||
      inbound.asset.chain == GAIAChain ||
      inbound.asset.synth
    ) {
      return this.chainAttributes[THORChain].avgBlockTimeInSecs
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
    const networkValues = await this.thorchainCache.thornode.getNetworkValues()
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
      case 'BTC':
      case `BCH`:
      case `LTC`:
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
      case 'AVAX':
        // 0 AVAX
        dustValues = {
          asset: new CryptoAmount(assetToBase(assetAmount(0)), asset),
          rune: new CryptoAmount(assetToBase(assetAmount(0)), AssetRuneNative),
        }
        return dustValues
      case 'BSC':
        // 0 BSC
        dustValues = {
          asset: new CryptoAmount(assetToBase(assetAmount(0)), asset),
          rune: new CryptoAmount(assetToBase(assetAmount(0)), AssetRuneNative),
        }
        return dustValues
      case 'MAYA':
        // 0 MAYA
        dustValues = {
          asset: new CryptoAmount(assetToBase(assetAmount(0)), asset),
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
    let errors: string[] = []
    // check for errors before sending quote
    errors = await this.getAddSaversEstimateErrors(addAmount)
    // request param amount should always be in 1e8 which is why we pass in adjusted decimals if chain decimals != 8
    const newAddAmount =
      addAmount.baseAmount.decimal != 8 ? getBaseAmountWithDiffDecimals(addAmount, 8) : addAmount.baseAmount.amount()
    // Fetch quote
    const depositQuote = await this.thorchainCache.thornode.getSaversDepositQuote(
      assetToString(addAmount.asset),
      newAddAmount.toNumber(),
    )

    // error handling
    const response: { error?: string } = JSON.parse(JSON.stringify(depositQuote))
    if (response.error) errors.push(`Thornode request quote failed: ${response.error}`)
    //The recommended minimum inbound amount for this transaction type & inbound asset.
    // Sending less than this amount could result in failed refunds
    if (
      depositQuote.recommended_min_amount_in &&
      addAmount.baseAmount.amount().toNumber() < +depositQuote.recommended_min_amount_in
    )
      errors.push(
        `Error amount in: ${addAmount.baseAmount.amount().toNumber()} is less than reccommended Min Amount: ${
          depositQuote.recommended_min_amount_in
        }`,
      )
    // Return errors if there is any
    if (errors.length > 0) {
      return {
        assetAmount: addAmount,
        estimatedDepositValue: new CryptoAmount(assetToBase(assetAmount(0)), addAmount.asset),
        fee: {
          affiliate: new CryptoAmount(assetToBase(assetAmount(0)), addAmount.asset),
          asset: addAmount.asset,
          outbound: new CryptoAmount(assetToBase(assetAmount(0)), addAmount.asset),
        },
        expiry: new Date(0),
        toAddress: '',
        memo: '',
        saverCapFilledPercent: -1,
        estimatedWaitTime: -1,
        slipBasisPoints: -1,
        recommendedMinAmountIn: depositQuote.recommended_min_amount_in,
        canAddSaver: false,
        errors,
      }
    }
    // Calculate transaction expiry time of the vault address
    const currentDatetime = new Date()
    const minutesToAdd = 15
    const expiryDatetime = new Date(currentDatetime.getTime() + minutesToAdd * 60000)
    // Calculate seconds
    const estimatedWait = depositQuote.inbound_confirmation_seconds
      ? depositQuote.inbound_confirmation_seconds
      : await this.confCounting(addAmount)
    const pool = (await this.thorchainCache.getPoolForAsset(addAmount.asset)).pool
    // Organise fees
    const saverFees: SaverFees = {
      affiliate: new CryptoAmount(baseAmount(depositQuote.fees.affiliate), addAmount.asset),
      asset: assetFromStringEx(depositQuote.fees.asset),
      outbound: new CryptoAmount(baseAmount(depositQuote.fees.outbound), addAmount.asset),
    }
    // define savers filled capacity
    const saverCapFilledPercent = (+pool.synthSupply / +pool.assetDepth) * 100
    // return object
    const estimateAddSaver: EstimateAddSaver = {
      assetAmount: new CryptoAmount(baseAmount(depositQuote.expected_amount_out), addAmount.asset),
      estimatedDepositValue: new CryptoAmount(baseAmount(depositQuote.expected_amount_deposit), addAmount.asset),
      fee: saverFees,
      expiry: expiryDatetime,
      toAddress: depositQuote.inbound_address,
      memo: depositQuote.memo,
      estimatedWaitTime: estimatedWait,
      canAddSaver: errors.length === 0,
      slipBasisPoints: depositQuote.slippage_bps,
      saverCapFilledPercent,
      recommendedMinAmountIn: depositQuote.recommended_min_amount_in,
      errors,
    }
    return estimateAddSaver
  }
  /**
   *
   * @param withdrawParams - height?, asset, address, withdrawalBasisPoints
   * @returns - savers withdrawal quote with extras
   */
  public async estimateWithdrawSaver(withdrawParams: SaversWithdraw): Promise<EstimateWithdrawSaver> {
    const errors: string[] = []
    // return error if Asset in is incorrect
    if (isAssetRuneNative(withdrawParams.asset) || withdrawParams.asset.synth)
      errors.push(`Native Rune and synth assets are not supported only L1's`)
    const inboundDetails = await this.thorchainCache.getInboundDetails()
    // Check to see if there is a position before calling withdraw quote
    const checkPositon = await this.getSaverPosition(withdrawParams)
    if (checkPositon.errors.length > 0) {
      for (let i = 0; i < checkPositon.errors.length; i++) {
        errors.push(checkPositon.errors[i])
      }
      return {
        expectedAssetAmount: new CryptoAmount(
          assetToBase(assetAmount(checkPositon.redeemableValue.assetAmount.amount())),
          withdrawParams.asset,
        ),
        fee: {
          affiliate: new CryptoAmount(assetToBase(assetAmount(0)), withdrawParams.asset),
          asset: withdrawParams.asset,
          outbound: new CryptoAmount(
            assetToBase(
              assetAmount(
                calcOutboundFee(withdrawParams.asset, inboundDetails[withdrawParams.asset.chain]).assetAmount.amount(),
              ),
            ),
            withdrawParams.asset,
          ),
        },
        expiry: new Date(0),
        toAddress: '',
        memo: '',
        estimatedWaitTime: -1,
        slipBasisPoints: -1,
        dustAmount: new CryptoAmount(baseAmount(0), withdrawParams.asset),
        errors,
      }
    }
    // Request withdraw quote
    const withdrawQuote = await this.thorchainCache.thornode.getSaversWithdrawQuote(withdrawParams)
    // error handling
    const response: { error?: string } = JSON.parse(JSON.stringify(withdrawQuote))
    if (response.error) errors.push(`Thornode request quote failed: ${response.error}`)
    if (errors.length > 0) {
      return {
        expectedAssetAmount: new CryptoAmount(assetToBase(assetAmount(0)), withdrawParams.asset),
        fee: {
          affiliate: new CryptoAmount(assetToBase(assetAmount(0)), withdrawParams.asset),
          asset: withdrawParams.asset,
          outbound: new CryptoAmount(assetToBase(assetAmount(0)), withdrawParams.asset),
        },
        expiry: new Date(0),
        toAddress: '',
        memo: '',
        estimatedWaitTime: -1,
        slipBasisPoints: -1,
        dustAmount: new CryptoAmount(baseAmount(0), withdrawParams.asset),
        errors,
      }
    }

    // Calculate transaction expiry time of the vault address
    const currentDatetime = new Date()
    const minutesToAdd = 15
    const expiryDatetime = new Date(currentDatetime.getTime() + minutesToAdd * 60000)

    const estimatedWait = +withdrawQuote.outbound_delay_seconds
    const withdrawAsset = assetFromStringEx(withdrawQuote.fees.asset)
    const estimateWithdrawSaver: EstimateWithdrawSaver = {
      expectedAssetAmount: new CryptoAmount(baseAmount(withdrawQuote.expected_amount_out), withdrawParams.asset),
      fee: {
        affiliate: new CryptoAmount(baseAmount(withdrawQuote.fees.affiliate), withdrawAsset),
        asset: withdrawAsset,
        outbound: new CryptoAmount(baseAmount(withdrawQuote.fees.outbound), withdrawAsset),
      },
      expiry: expiryDatetime,
      toAddress: withdrawQuote.inbound_address,
      memo: withdrawQuote.memo,
      estimatedWaitTime: estimatedWait,
      slipBasisPoints: withdrawQuote.slippage_bps,
      dustAmount: new CryptoAmount(baseAmount(withdrawQuote.dust_amount), withdrawParams.asset),
      errors,
    }
    return estimateWithdrawSaver
  }

  /**
   *
   * @param params - getSaver object > asset, addresss, height?
   * @returns - Savers position object
   */
  public async getSaverPosition(params: getSaver): Promise<SaversPosition> {
    const errors: string[] = []
    const inboundDetails = await this.thorchainCache.getInboundDetails()
    const blockData = (await this.thorchainCache.thornode.getLastBlock()).find(
      (item: LastBlock) => item.chain === params.asset.chain,
    )
    const savers = (await this.thorchainCache.thornode.getSavers(`${params.asset.chain}.${params.asset.ticker}`)).find(
      (item) => item.asset_address === params.address,
    )

    const pool = (await this.thorchainCache.getPoolForAsset(params.asset)).pool
    if (!savers) errors.push(`Could not find position for ${params.address}`)
    if (!savers?.last_add_height) errors.push(`Could not find position for ${params.address}`)
    if (!blockData?.thorchain) errors.push(`Could not get thorchain block height`)
    const outboundFee = calcOutboundFee(params.asset, inboundDetails[params.asset.chain])
    const convertToBaseEight = getBaseAmountWithDiffDecimals(outboundFee, 8)
    // For comparison use 1e8 since asset_redeem_value is returned in 1e8
    if (Number(savers?.asset_redeem_value) < convertToBaseEight.toNumber())
      errors.push(`Unlikely to withdraw balance as outbound fee is greater than redeemable amount`)
    const ownerUnits = Number(savers?.units)
    const lastAdded = Number(savers?.last_add_height)
    const saverUnits = Number(pool.saversUnits)
    const assetDepth = Number(pool.saversDepth)
    const redeemableValue = (ownerUnits / saverUnits) * assetDepth
    const depositAmount = new CryptoAmount(baseAmount(savers?.asset_deposit_value), params.asset)
    const redeemableAssetAmount = new CryptoAmount(baseAmount(redeemableValue), params.asset)
    const saversAge = (Number(blockData?.thorchain) - lastAdded) / ((365 * 86400) / 6)
    const saverGrowth = redeemableAssetAmount.minus(depositAmount).div(depositAmount).times(100)
    const saversPos: SaversPosition = {
      depositValue: depositAmount,
      redeemableValue: redeemableAssetAmount,
      lastAddHeight: Number(savers?.last_add_height),
      percentageGrowth: saverGrowth.assetAmount.amount().toNumber(),
      ageInYears: saversAge,
      ageInDays: saversAge * 365,
      errors,
    }
    return saversPos
  }

  private async getAddSaversEstimateErrors(addAmount: CryptoAmount): Promise<string[]> {
    const errors = []
    const pools = await this.thorchainCache.getPools()
    const saversPools = Object.values(pools).filter((i) => i.pool.saversDepth !== '0')
    const inboundDetails = await this.thorchainCache.getInboundDetails()
    const saverPool = saversPools.find((i) => assetToString(i.asset) === assetToString(addAmount.asset))
    if (!saverPool) errors.push(` ${assetToString(addAmount.asset)} does not have a saver's pool`)
    if (inboundDetails[addAmount.asset.chain].haltedChain) errors.push(`${addAmount.asset.chain} is halted, cannot add`)
    const pool = (await this.thorchainCache.getPoolForAsset(addAmount.asset)).pool
    if (pool.status.toLowerCase() !== 'available')
      errors.push(`Pool is not available for this asset ${assetToString(addAmount.asset)}`)
    const inboundFee = calcNetworkFee(addAmount.asset, inboundDetails[addAmount.asset.chain])
    if (addAmount.lte(inboundFee)) errors.push(`Add amount does not cover fees`)
    return errors
  }

  /**
   *
   * @param loanOpenParams - params needed for the end Point
   * @returns
   */
  public async getLoanQuoteOpen({
    asset,
    amount,
    targetAsset,
    destination,
    minOut,
    affiliateBps,
    affiliate,
    height,
  }: LoanOpenParams): Promise<LoanOpenQuote> {
    const errors: string[] = []
    const loanOpenResp = await this.thorchainCache.thornode.getLoanQuoteOpen(
      `${asset.chain}.${asset.ticker}`,
      amount.baseAmount.amount().toNumber(),
      `${targetAsset.chain}.${targetAsset.ticker}`,
      destination,
      minOut,
      affiliateBps,
      affiliate,
      height,
    )
    const response: { error?: string } = JSON.parse(JSON.stringify(loanOpenResp))
    if (response.error) errors.push(`Thornode request quote failed: ${response.error}`)
    if (
      loanOpenResp.recommended_min_amount_in &&
      amount.baseAmount.amount().toNumber() < +loanOpenResp.recommended_min_amount_in
    )
      errors.push(
        `Error amount in: ${amount.baseAmount.amount().toNumber()} is less than reccommended Min Amount: ${
          loanOpenResp.recommended_min_amount_in
        }`,
      )
    if (errors.length > 0) {
      return {
        inboundAddress: '',
        expectedWaitTime: {
          outboundDelayBlocks: undefined,
          outbondDelaySeconds: undefined,
        },
        fees: {
          asset: '',
          liquidity: undefined,
          outbound: undefined,
          total_bps: undefined,
        },
        slippageBps: undefined,
        router: undefined,
        expiry: 0,
        warning: '',
        notes: '',
        dustThreshold: undefined,
        recommendedMinAmountIn: loanOpenResp.recommended_min_amount_in,
        memo: undefined,
        expectedAmountOut: '',
        expectedCollateralizationRatio: '',
        expectedCollateralUp: '',
        expectedDebtUp: '',
        errors: errors,
      }
    }
    const loanOpenQuote: LoanOpenQuote = {
      inboundAddress: loanOpenResp.inbound_address,
      expectedWaitTime: {
        outboundDelayBlocks: loanOpenResp.outbound_delay_blocks,
        outbondDelaySeconds: loanOpenResp.outbound_delay_seconds,
      },
      fees: {
        asset: loanOpenResp.fees.asset,
        liquidity: loanOpenResp.fees.liquidity,
        outbound: loanOpenResp.fees.outbound,
        total_bps: loanOpenResp.fees.total_bps,
      },
      slippageBps: loanOpenResp.slippage_bps,
      router: loanOpenResp.router,
      expiry: loanOpenResp.expiry,
      warning: loanOpenResp.warning,
      notes: loanOpenResp.notes,
      dustThreshold: loanOpenResp.dust_threshold,
      recommendedMinAmountIn: loanOpenResp.recommended_min_amount_in,
      memo: loanOpenResp.memo,
      expectedAmountOut: loanOpenResp.expected_amount_out,
      expectedCollateralizationRatio: loanOpenResp.expected_collateralization_ratio,
      expectedCollateralUp: loanOpenResp.expected_collateral_up,
      expectedDebtUp: loanOpenResp.expected_collateral_up,
      errors: errors,
    }
    return loanOpenQuote
  }

  /**
   *
   * @param loanOpenParams - params needed for the end Point
   * @returns
   */
  public async getLoanQuoteClose({
    asset,
    amount,
    loanAsset,
    loanOwner,
    minOut,
    height,
  }: LoanCloseParams): Promise<LoanCloseQuote> {
    const errors: string[] = []
    const loanCloseResp = await this.thorchainCache.thornode.getLoanQuoteClose(
      `${asset.chain}.${asset.ticker}`,
      amount.baseAmount.amount().toNumber(),
      `${loanAsset.chain}.${loanAsset.ticker}`,
      loanOwner,
      minOut,
      height,
    )
    const response: { error?: string } = JSON.parse(JSON.stringify(loanCloseResp))
    if (response.error) errors.push(`Thornode request quote failed: ${response.error}`)
    if (errors.length > 0) {
      return {
        inboundAddress: '',
        expectedWaitTime: {
          outboundDelayBlocks: undefined,
          outbondDelaySeconds: undefined,
        },
        fees: {
          asset: '',
          liquidity: undefined,
          outbound: undefined,
          total_bps: undefined,
        },
        slippageBps: undefined,
        router: undefined,
        expiry: 0,
        warning: '',
        notes: '',
        dustThreshold: undefined,
        recommendedMinAmountIn: loanCloseResp.recommended_min_amount_in,
        memo: undefined,
        expectedAmountOut: '',
        expectedCollateralDown: '',
        expectedDebtDown: '',
        errors: errors,
      }
    }
    const loanCloseQuote: LoanCloseQuote = {
      inboundAddress: loanCloseResp.inbound_address,
      expectedWaitTime: {
        outboundDelayBlocks: loanCloseResp.outbound_delay_blocks,
        outbondDelaySeconds: loanCloseResp.outbound_delay_seconds,
      },
      fees: {
        asset: loanCloseResp.fees.asset,
        liquidity: loanCloseResp.fees.liquidity,
        outbound: loanCloseResp.fees.outbound,
        total_bps: loanCloseResp.fees.total_bps,
      },
      slippageBps: loanCloseResp.slippage_bps,
      router: loanCloseResp.router,
      expiry: loanCloseResp.expiry,
      warning: loanCloseResp.warning,
      notes: loanCloseResp.notes,
      dustThreshold: loanCloseResp.dust_threshold,
      recommendedMinAmountIn: loanCloseResp.recommended_min_amount_in,
      memo: loanCloseResp.memo,
      expectedAmountOut: loanCloseResp.expected_amount_out,
      expectedCollateralDown: loanCloseResp.expected_collateral_down,
      expectedDebtDown: loanCloseResp.expected_debt_down,
      errors: errors,
    }

    return loanCloseQuote
  }
}
