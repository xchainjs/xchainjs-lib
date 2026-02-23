import { SwapMetadata, Transaction } from '@xchainjs/xchain-midgard'
import { LastBlock, TradeAccountResponse, TradeUnitResponse } from '@xchainjs/xchain-thornode'
import {
  Address,
  Asset,
  AssetCryptoAmount,
  Chain,
  CryptoAmount,
  SECURED_ASSET_DELIMITER,
  SYNTH_ASSET_DELIMITER,
  SecuredAsset,
  SynthAsset,
  TOKEN_ASSET_DELIMITER,
  TRADE_ASSET_DELIMITER,
  TokenAsset,
  TradeAsset,
  assetAmount,
  assetFromStringEx,
  assetToBase,
  assetToString,
  baseAmount,
  isSynthAsset,
} from '@xchainjs/xchain-util'
import BigNumber from 'bignumber.js'

import { DefaultChainAttributes } from './chain-defaults'
import { LiquidityPool } from './liquidity-pool'
import { ThorchainCache } from './thorchain-cache'
import {
  AddliquidityPosition,
  AddressTradeAccounts,
  AddressTradeAccountsParams,
  Block,
  ChainAttributes,
  CompatibleAsset,
  DustValues,
  EstimateAddLP,
  EstimateAddSaver,
  EstimateWithdrawLP,
  EstimateWithdrawSaver,
  InboundDetail,
  LiquidityPosition,
  LoanCloseParams,
  LoanCloseQuote,
  LoanOpenParams,
  LoanOpenQuote,
  PoolRatios,
  PostionDepositValue,
  QuoteSwapParams,
  QuoteTHORName,
  QuoteTHORNameParams,
  RunePool,
  RunePoolParams,
  RunePoolProvider,
  RunePoolProviderParams,
  RunePoolProvidersParams,
  SaversPosition,
  SaversWithdraw,
  SwapHistoryParams,
  SwapsHistory,
  ThornameAlias,
  ThornameDetails,
  TotalFees,
  TradeAssetAccounts,
  TradeAssetAccountsParams,
  TradeAssetUnits,
  TradeAssetUnitsParams,
  TradeAssetsUnitsParams,
  TransactionAction,
  TxDetails,
  UnitData,
  WithdrawLiquidityPosition,
  getSaver,
} from './types'
import {
  AssetRuneNative,
  BNBChain,
  GAIAChain,
  THORCHAIN_DECIMAL,
  THORChain,
  getCryptoAmountWithNotation,
  isAssetRuneNative,
} from './utils'
import { getLiquidityProtectionData, getLiquidityUnits, getPoolShare, getSlipOnLiquidity } from './utils/liquidity'
import { calcNetworkFee, calcOutboundFee, getBaseAmountWithDiffDecimals, getChainAsset } from './utils/utils'

const defaultCache = new ThorchainCache()

/**
 * ThorchainQuery Class for interacting with THORChain.
 * Recommended main class to use for swapping with THORChain
 * Has access to Midgard and THORNode data
 */
export class ThorchainQuery {
  readonly thorchainCache: ThorchainCache
  private chainAttributes: Record<Chain, ChainAttributes>

  /**
   * Constructor to create a ThorchainQuery
   *
   * @param thorchainCache - an instance of the ThorchainCache (could be pointing to stagenet,testnet,mainnet)
   * @param chainAttributes - attributes used to calculate waitTime & conf counting
   * @returns ThorchainAMM
   */
  constructor(thorchainCache = defaultCache, chainAttributes = DefaultChainAttributes) {
    this.thorchainCache = thorchainCache
    this.chainAttributes = chainAttributes
  }

  /** Quote a swap transaction.
   *
   * @param quoteSwapParams - Input parameters for the swap quote.
   * @returns Transaction details including memo, address, fees, etc.
   */
  public async quoteSwap({
    fromAsset,
    destinationAsset,
    amount,
    destinationAddress,
    streamingInterval,
    streamingQuantity,
    liquidityToleranceBps,
    toleranceBps,
    affiliateBps,
    affiliateAddress,
    height,
  }: QuoteSwapParams): Promise<TxDetails> {
    // Validates swap and pushes error if there is one
    const errors: string[] = []

    const error = await this.validateAmount(amount)
    if (error) errors.push(error.message)

    const fromAssetString = assetToString(fromAsset)
    const toAssetString = assetToString(destinationAsset)
    const inputAmount = getBaseAmountWithDiffDecimals(amount, 8)

    // Fetch quote
    const swapQuote = await this.thorchainCache.thornode.getSwapQuote(
      fromAssetString,
      toAssetString,
      inputAmount.toNumber(),
      destinationAddress,
      streamingInterval,
      streamingQuantity,
      toleranceBps,
      liquidityToleranceBps,
      affiliateBps,
      affiliateAddress,
      height,
    )

    let response

    // Check if swapQuote is a string, which we assume indicates an error message
    if (typeof swapQuote === 'string') {
      response = { error: swapQuote }
    } else {
      response = swapQuote
    }
    const responseError: { error?: string } = JSON.parse(JSON.stringify(response))
    if (responseError.error) errors.push(`Thornode request quote: ${responseError.error}`)
    if (errors.length > 0) {
      // If there are errors, construct and return a transaction details object with error information
      return {
        memo: ``,
        toAddress: ``,
        dustThreshold: new AssetCryptoAmount(baseAmount(0), AssetRuneNative),
        expiry: new Date(),
        txEstimate: {
          totalFees: {
            asset: destinationAsset,
            affiliateFee: new AssetCryptoAmount(baseAmount(0), AssetRuneNative),
            outboundFee: new AssetCryptoAmount(baseAmount(0), AssetRuneNative),
            liquidityFee: new AssetCryptoAmount(baseAmount(0), AssetRuneNative),
          },
          slipBasisPoints: 0,
          netOutput: new CryptoAmount(baseAmount(0), destinationAsset),
          outboundDelaySeconds: 0,
          inboundConfirmationSeconds: 0,
          canSwap: false,
          errors,
          netOutputStreaming: new AssetCryptoAmount(baseAmount(0), AssetRuneNative),
          maxStreamingQuantity: 0,
          outboundDelayBlocks: 0,
          streamingSlipBasisPoints: 0,
          streamingSwapBlocks: 0,
          streamingSwapSeconds: 0,
          totalSwapSeconds: 0,
          recommendedGasRate: '0',
          router: '',
          warning: '',
        },
      }
    }
    // The recommended minimum inbound amount for this transaction type & inbound asset.
    // Sending less than this amount could result in failed refunds
    const feeAsset = assetFromStringEx(swapQuote.fees.asset) as Asset | TokenAsset | SynthAsset
    const feeAssetDecimals = await this.thorchainCache.midgardQuery.getDecimalForAsset(feeAsset)
    const destinationAssetDecimals = await this.thorchainCache.midgardQuery.getDecimalForAsset(destinationAsset)
    if (swapQuote.recommended_min_amount_in && inputAmount.toNumber() < Number(swapQuote.recommended_min_amount_in))
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
      dustThreshold: getCryptoAmountWithNotation(
        new CryptoAmount(baseAmount(swapQuote.dust_threshold), fromAsset),
        amount.baseAmount.decimal,
      ),
      toAddress: swapQuote.inbound_address ? swapQuote.inbound_address : '',
      expiry: new Date(swapQuote.expiry * 1000),
      txEstimate: {
        totalFees: {
          asset: destinationAsset,
          affiliateFee: getCryptoAmountWithNotation(
            new CryptoAmount(baseAmount(swapQuote.fees.affiliate), feeAsset),
            feeAssetDecimals,
          ),
          outboundFee: getCryptoAmountWithNotation(
            new CryptoAmount(baseAmount(swapQuote.fees.outbound), feeAsset),
            feeAssetDecimals,
          ),
          liquidityFee: getCryptoAmountWithNotation(
            new CryptoAmount(baseAmount(swapQuote.fees.liquidity), feeAsset),
            feeAssetDecimals,
          ),
        },
        slipBasisPoints: swapQuote.fees.slippage_bps,
        netOutput: getCryptoAmountWithNotation(
          new CryptoAmount(baseAmount(swapQuote.expected_amount_out), destinationAsset),
          destinationAssetDecimals,
        ),
        netOutputStreaming: getCryptoAmountWithNotation(
          new CryptoAmount(baseAmount(swapQuote.expected_amount_out), destinationAsset),
          destinationAssetDecimals,
        ),
        outboundDelaySeconds: swapQuote.outbound_delay_seconds,
        inboundConfirmationSeconds: swapQuote.inbound_confirmation_seconds,
        recommendedMinAmountIn: swapQuote.recommended_min_amount_in,
        maxStreamingQuantity: swapQuote.max_streaming_quantity ? swapQuote.max_streaming_quantity : 0,
        outboundDelayBlocks: swapQuote.outbound_delay_blocks,
        streamingSlipBasisPoints: swapQuote.fees.slippage_bps,
        streamingSwapBlocks: swapQuote.streaming_swap_blocks ? swapQuote.streaming_swap_blocks : 0,
        streamingSwapSeconds: swapQuote.streaming_swap_seconds ? swapQuote.streaming_swap_seconds : 0,
        totalSwapSeconds: swapQuote.total_swap_seconds ? swapQuote.total_swap_seconds : 0,
        canSwap: !swapQuote.memo || errors.length > 0 ? false : true,
        recommendedGasRate: swapQuote.recommended_gas_rate ? swapQuote.recommended_gas_rate : '0',
        router: swapQuote.router ? swapQuote.router : '',
        errors,
        warning: swapQuote.warning,
      },
    }
    return txDetails
  }

  /**
   * Validate a cryptoAmount is well formed
   * @param {CryptoAmount} cryptoAmount - CryptoAmount to validate
   * @returns {void | Error} Error if the cryptoAmount is not well formed
   */
  public async validateAmount(cryptoAmount: CryptoAmount<CompatibleAsset>): Promise<Error | void> {
    // Get the number of decimals for the asset
    const assetDecimals = await this.thorchainCache.midgardQuery.getDecimalForAsset(cryptoAmount.asset)
    // Check if the base amount decimal is equal to the asset's decimal
    if (cryptoAmount.baseAmount.decimal !== assetDecimals)
      return new Error(
        `Invalid number of decimals: ${assetToString(cryptoAmount.asset)} must have ${assetDecimals} decimals`,
      )
  }

  /**
   * Works out how long an outbound Tx will be held by THORChain before sending.
   * @param outboundAmount: CryptoAmount  being sent.
   * @returns required delay in seconds
   * @see https://gitlab.com/thorchain/thornode/-/blob/develop/x/thorchain/manager_txout_current.go#L548
   */
  async outboundDelay(outboundAmount: CryptoAmount<Asset | TokenAsset>): Promise<number> {
    // Retrieve network values
    const networkValues = await this.thorchainCache.getNetworkValues()
    // Create CryptoAmounts for minimum transaction out volume threshold and maximum transaction out offset
    const minTxOutVolumeThreshold = new AssetCryptoAmount(
      baseAmount(networkValues['MINTXOUTVOLUMETHRESHOLD']),
      AssetRuneNative,
    )
    const maxTxOutOffset = networkValues['MAXTXOUTOFFSET']
    // Get the delay rate for outbound transactions
    let txOutDelayRate = new AssetCryptoAmount(baseAmount(networkValues['TXOUTDELAYRATE']), AssetRuneNative).assetAmount
      .amount()
      .toNumber()
    // Get the outbound queue
    const getQueue = await this.thorchainCache.thornode.getQueue()
    // Create a CryptoAmount for the scheduled outbound value
    const outboundValue = new AssetCryptoAmount(baseAmount(getQueue.scheduled_outbound_value), AssetRuneNative)
    // Get the average block time for THORChain
    const thorChainblocktime = this.chainAttributes[THORChain].avgBlockTimeInSecs // blocks required to confirm tx
    // Convert the outbound amount to its value in RUNE
    const runeValue = await this.thorchainCache.convert(outboundAmount, AssetRuneNative)
    // Check if the rune value is less than the minimum transaction out volume threshold
    if (runeValue.lt(minTxOutVolumeThreshold)) {
      return thorChainblocktime
    }
    // Check if the outbound value is undefined
    if (outboundValue == undefined) {
      throw new Error(`Could not return Scheduled Outbound Value`)
    }
    // Calculate the total outbound amount in rune
    const outboundAmountTotal = runeValue.plus(outboundValue)
    // Calculate the volume threshold
    const volumeThreshold = outboundAmountTotal.div(minTxOutVolumeThreshold)
    // Adjust the delay rate based on the volume threshold
    txOutDelayRate = txOutDelayRate - volumeThreshold.assetAmount.amount().toNumber() <= 1 ? 1 : txOutDelayRate
    // Calculate the minimum number of blocks required for the transaction to be confirmed
    let minBlocks = runeValue.assetAmount.amount().toNumber() / txOutDelayRate
    minBlocks = minBlocks > maxTxOutOffset ? maxTxOutOffset : minBlocks
    // Return the required delay in seconds
    return minBlocks * thorChainblocktime
  }

  /**
   * Convenience method to convert TotalFees to a different CryptoAmount
   * TotalFees are always calculated and returned in RUNE, this method can
   * be used to show the equivalent fees in another Asset Type
   * @param fees: TotalFees - the fees you want to convert
   * @param asset: Asset - the asset you want the fees converted to
   * @returns TotalFees in asset
   */
  async getFeesIn(fees: TotalFees, asset: CompatibleAsset): Promise<TotalFees> {
    // Return the fees converted to the specified asset
    return {
      asset: fees.asset, // Shouldn't be asset?
      // swapFee: await this.convert(fees.swapFee, asset),
      outboundFee: await this.convert(fees.outboundFee, asset),
      affiliateFee: await this.convert(fees.affiliateFee, asset),
      liquidityFee: await this.convert(fees.liquidityFee, asset),
      // totatBps: fees.totatBps,
    }
  }

  /**
   * Returns the exchange of a CryptoAmount to a different Asset
   * Ex. convert(input:100 BUSD, outAsset: BTC) -> 0.0001234 BTC
   * @param input - amount/asset to convert to outAsset
   * @param ouAsset - the Asset you want to convert to
   * @returns CryptoAmount of input
   */
  async convert<T extends Asset | TokenAsset | SynthAsset | TradeAsset | SecuredAsset>(
    input: CryptoAmount<Asset | TokenAsset | SynthAsset | TradeAsset | SecuredAsset>,
    outAsset: T,
  ): Promise<CryptoAmount<T>> {
    // Convert the input amount to the specified asset
    return await this.thorchainCache.convert(input, outAsset)
  }
  /**
   * Finds the required confCount required for an inbound or outbound Tx to THORChain. Estimate based on Midgard data only.
   * Finds the gas asset of the given asset (e.g. BUSD is on BNB), finds the value of asset in Gas Asset then finds the required confirmation count.
   * ConfCount is then times by 6 seconds.
   * @param inbound: CryptoAmount - amount/asset of the outbound amount.
   * @returns time in seconds before a Tx is confirmed by THORChain
   * @see https://docs.thorchain.org/chain-clients/overview
   */
  async confCounting(inbound: CryptoAmount): Promise<number> {
    // Check for instant finality assets or synths
    if (
      isAssetRuneNative(inbound.asset) ||
      inbound.asset.chain == BNBChain ||
      inbound.asset.chain == GAIAChain ||
      isSynthAsset(inbound.asset)
    ) {
      // Return the average block time for THORChain
      return this.chainAttributes[THORChain].avgBlockTimeInSecs
    }
    // Get the gas asset for the inbound asset's chain
    const chainGasAsset = getChainAsset(inbound.asset.chain)
    // Convert the inbound amount to the gas asset
    const amountInGasAsset = await this.thorchainCache.convert(inbound, chainGasAsset)
    // Get the number of confirmations required based on the asset's value in the gas asset
    const amountInGasAssetInAsset = amountInGasAsset.assetAmount
    const confConfig = this.chainAttributes[inbound.asset.chain]
    const requiredConfs = Math.ceil(amountInGasAssetInAsset.amount().div(confConfig.blockReward).toNumber())
    // Convert the number of confirmations to seconds
    return requiredConfs * confConfig.avgBlockTimeInSecs
  }

  /**
   * Estimates a liquidity position for given crypto amount value, both asymmetrical and symmetrical
   * @param params - parameters needed for an estimated liquidity position
   * @returns - object of type EstimateLP
   */
  public async estimateAddLP(params: AddliquidityPosition): Promise<EstimateAddLP> {
    const errors: string[] = []
    // Check if either of the assets are synths or if the rune is not THOR.RUNE
    if (isSynthAsset(params.asset.asset) || isSynthAsset(params.rune.asset)) {
      errors.push('you cannot add liquidity with a synth')
    }
    if (!isAssetRuneNative(params.rune.asset)) errors.push('params.rune must be THOR.RUNE')
    // Get the pool for the asset
    const assetPool = await this.thorchainCache.getPoolForAsset(params.asset.asset)
    // Calculate liquidity units
    const lpUnits = getLiquidityUnits({ asset: params.asset, rune: params.rune }, assetPool)
    // Get inbound details
    const inboundDetails = await this.thorchainCache.getInboundDetails()
    // Create unit data
    const unitData: UnitData = {
      liquidityUnits: lpUnits,
      totalUnits: new BigNumber(assetPool.thornodeDetails.LP_units),
    }
    // Calculate pool share
    const poolShare = getPoolShare(unitData, assetPool)
    // Calculate wait time
    const assetWaitTimeSeconds = await this.confCounting(params.asset)
    const runeWaitTimeSeconds = await this.confCounting(params.rune)
    const waitTimeSeconds = assetWaitTimeSeconds > runeWaitTimeSeconds ? assetWaitTimeSeconds : runeWaitTimeSeconds
    // Calculate inbound fees
    let assetInboundFee = new CryptoAmount(baseAmount(0), params.asset.asset)
    let runeInboundFee = new AssetCryptoAmount(baseAmount(0), AssetRuneNative)

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
    // Calculate total fees
    const totalFees = (await this.convert(assetInboundFee, AssetRuneNative)).plus(runeInboundFee)
    // Calculate slip
    const slip = getSlipOnLiquidity({ asset: params.asset, rune: params.rune }, assetPool)
    // Create estimate LP object
    const estimateLP: EstimateAddLP = {
      assetPool: assetPool.thornodeDetails.asset,
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
   * @param - Asset for LP
   * @param address - address used for LP
   * @returns - Object of type LiquidityPosition
   */
  public async checkLiquidityPosition(
    asset: Asset | TokenAsset,
    assetOrRuneAddress?: string,
  ): Promise<LiquidityPosition> {
    const poolAsset = await this.thorchainCache.getPoolForAsset(asset)
    if (!poolAsset) throw Error(`Could not find pool for ${assetToString(asset)}`)
    if (!assetOrRuneAddress) throw Error(`No address provided ${assetOrRuneAddress}`)
    // Get the current block number for that chain
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
      totalUnits: new BigNumber(poolAsset.thornodeDetails.LP_units),
      liquidityUnits: new BigNumber(liquidityProvider.units),
    }
    const networkValues = await this.thorchainCache.thornode.getNetworkValues()
    // Create block object
    const block: Block = {
      current: blockData.thorchain,
      lastAdded: liquidityProvider.last_add_height,
      fullProtection: networkValues['FULLIMPLOSSPROTECTIONBLOCKS'],
    }

    const assetDecimals = await this.thorchainCache.midgardQuery.getDecimalForAsset(asset)
    // Get the current LP
    const currentLP: PostionDepositValue = {
      asset: baseAmount(liquidityProvider.asset_deposit_value, assetDecimals),
      rune: baseAmount(liquidityProvider.rune_deposit_value),
    }
    // Calculate pool share
    const poolShare = getPoolShare(unitData, poolAsset)
    // Liquidity Unit Value Index = sprt(assetdepth * runeDepth) / Poolunits
    // Using this formula we can work out an individual position to find LUVI and then the growth rate
    // Calculate deposit and redeem Liquidity Unit Value Index (LUVI)
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
    // Calculate LP growth
    const lpGrowth = redeemLuvi - depositLuvi
    const currentLpGrowth = lpGrowth > 0 ? lpGrowth / depositLuvi : 0
    // Get impermanent loss protection data
    const impermanentLossProtection = getLiquidityProtectionData(currentLP, poolShare, block)
    // Create Liquidity Position object
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
  public async getPoolRatios(asset: Asset | TokenAsset): Promise<PoolRatios> {
    // Get pool data for the asset
    const assetPool = await this.thorchainCache.getPoolForAsset(asset)
    // Create pool ratios object
    const poolRatio: PoolRatios = {
      assetToRune: assetPool.assetToRuneRatio,
      runeToAsset: assetPool.runeToAssetRatio,
    }
    return poolRatio
  }

  /**
   * Estimates the result of withdrawing liquidity from a pool
   * @param params - parameters needed for estimating withdrawal of liquidity
   * @returns - object of type EstimateWithdrawLP
   */
  public async estimateWithdrawLP(params: WithdrawLiquidityPosition): Promise<EstimateWithdrawLP> {
    // Caution Dust Limits: BTC,BCH,LTC chains 10k sats; DOGE 1m Sats; ETH 0 wei; THOR 0 RUNE.
    const assetOrRuneAddress = params.assetAddress ? params.assetAddress : params.runeAddress
    // Check liquidity position for the provided asset
    const memberDetail = await this.checkLiquidityPosition(params.asset, assetOrRuneAddress)
    // Get dust values
    const dustValues = await this.getDustValues(getChainAsset(params.asset.chain)) // returns asset and rune dust values
    // Get asset pool
    const assetPool = await this.thorchainCache.getPoolForAsset(params.asset)
    // Calculate pool share
    const poolShare = getPoolShare(
      {
        liquidityUnits: new BigNumber(memberDetail.position.units),
        totalUnits: new BigNumber(assetPool.thornodeDetails.LP_units),
      },
      assetPool,
    )
    // Calculate slip on liquidity removal
    const slip = getSlipOnLiquidity(
      {
        asset: poolShare.assetShare,
        rune: poolShare.runeShare,
      },
      assetPool,
    )
    // Calculate wait time
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
    // Get inbound and outbound fees
    const allInboundDetails = await this.thorchainCache.getInboundDetails()
    const inboundDetails = allInboundDetails[params.asset.chain]
    const runeInbound = calcNetworkFee(AssetRuneNative, inboundDetails)
    const assetInbound = calcNetworkFee(params.asset, inboundDetails)
    const runeOutbound = calcOutboundFee(AssetRuneNative, inboundDetails)
    const assetOutbound = calcOutboundFee(params.asset, inboundDetails)
    // Create an EstimateWithdrawLP object
    const estimateLP: EstimateWithdrawLP = {
      assetAddress: memberDetail.position.asset_address, // Address for the asset
      runeAddress: memberDetail.position.rune_address, // Address for the rune
      slipPercent: slip.times(100), // Slip percentage
      inbound: {
        minToSend: {
          // Minimum amount to send
          rune: dustValues.rune, // Rune amount
          asset: dustValues.asset, // Asset amount
          total: (await this.convert(dustValues.asset, AssetRuneNative)).plus(dustValues.rune), // Total amount
        },
        fees: {
          // Inbound fees
          rune: runeInbound, // Rune fees
          asset: assetInbound, // Asset fees
          total: (await this.convert(assetInbound, AssetRuneNative)).plus(runeInbound), // Total fees
        },
      },
      outboundFee: {
        // Outbound fees
        asset: assetOutbound, // Asset fees
        rune: runeOutbound, // Rune fees
        total: (await this.convert(assetOutbound, AssetRuneNative)).plus(runeOutbound), // Total fees
      },
      assetAmount: poolShare.assetShare, // Asset amount
      runeAmount: poolShare.runeShare, // Rune amount
      lpGrowth: memberDetail.lpGrowth, // LP growth
      estimatedWaitSeconds: waitTimeSeconds, // Estimated wait time in seconds
      impermanentLossProtection: memberDetail.impermanentLossProtection, // Impermanent loss protection
      assetPool: assetPool.thornodeDetails.asset, // Asset pool
    }
    return estimateLP // Return the EstimateWithdrawLP object
  }
  /**
   * Can this become a queried constant? added to inbound_addresses or something
   * Retrieves dust values for the given asset
   * @param asset - The asset for which to retrieve dust values
   * @returns - Object containing dust values
   */
  private async getDustValues(asset: Asset): Promise<DustValues> {
    // Get the number of decimals for the asset
    const assetDecimals = await this.thorchainCache.midgardQuery.getDecimalForAsset(asset)
    // Determine the dust values based on the asset's chain
    switch (asset.chain) {
      case 'BTC':
      case `BCH`:
      case `LTC`:
        // Dust value: 10k sats
        return {
          asset: new AssetCryptoAmount(assetToBase(assetAmount(0.0001, assetDecimals)), asset),
          rune: new AssetCryptoAmount(assetToBase(assetAmount(0)), AssetRuneNative),
        }
      case 'ETH':
        // Dust value: 0 wei
        return {
          asset: new AssetCryptoAmount(assetToBase(assetAmount(0, assetDecimals)), asset),
          rune: new AssetCryptoAmount(assetToBase(assetAmount(0)), AssetRuneNative),
        }
      case 'THOR':
        // Dust value: 0 Rune
        return {
          asset: new AssetCryptoAmount(assetToBase(assetAmount(0, assetDecimals)), asset),
          rune: new AssetCryptoAmount(assetToBase(assetAmount(0)), AssetRuneNative),
        }
      case 'GAIA':
        // Dust value: 0 GAIA
        return {
          asset: new AssetCryptoAmount(assetToBase(assetAmount(0, assetDecimals)), asset),
          rune: new AssetCryptoAmount(assetToBase(assetAmount(0)), AssetRuneNative),
        }
      case 'DOGE':
        // Dust value: 1 million sats
        return {
          asset: new AssetCryptoAmount(assetToBase(assetAmount(0.01, assetDecimals)), asset),
          rune: new AssetCryptoAmount(assetToBase(assetAmount(0)), AssetRuneNative),
        }
      case 'AVAX':
        // Dust value: 0 AVAX
        return {
          asset: new AssetCryptoAmount(assetToBase(assetAmount(0, assetDecimals)), asset),
          rune: new AssetCryptoAmount(assetToBase(assetAmount(0)), AssetRuneNative),
        }
      case 'BSC':
        // Dust value: 0 BSC
        return {
          asset: new AssetCryptoAmount(assetToBase(assetAmount(0, assetDecimals)), asset),
          rune: new AssetCryptoAmount(assetToBase(assetAmount(0)), AssetRuneNative),
        }
      case 'MAYA':
        // Dust value: 0 MAYA
        return {
          asset: new AssetCryptoAmount(assetToBase(assetAmount(0, assetDecimals)), asset),
          rune: new AssetCryptoAmount(assetToBase(assetAmount(0)), AssetRuneNative),
        }
      default:
        throw Error('Unknown chain') // Throw error for unknown chain
    }
  }

  // Savers Queries
  /**
   * @deprecated Saver quote endpoints were removed from THORNode API in v3.15.0
   */
  public async estimateAddSaver(_addAmount: CryptoAmount<Asset | TokenAsset>): Promise<EstimateAddSaver> {
    throw new Error(
      'Saver deposit quotes are no longer available. THORNode removed the /quote/saver/deposit endpoint in API v3.15.0.',
    )
  }

  /**
   * @deprecated Saver quote endpoints were removed from THORNode API in v3.15.0
   */
  public async estimateWithdrawSaver(_withdrawParams: SaversWithdraw): Promise<EstimateWithdrawSaver> {
    throw new Error(
      'Saver withdraw quotes are no longer available. THORNode removed the /quote/saver/withdraw endpoint in API v3.15.0.',
    )
  }

  /**
   * Retrieve the position of a saver given the asset, address, and height.
   * @param params - Object containing the asset, address, and height.
   * @returns - Object representing the saver's position.
   */
  public async getSaverPosition(params: getSaver): Promise<SaversPosition> {
    // Initialize errors array
    const errors: string[] = []
    // Retrieve inbound details
    const inboundDetails = await this.thorchainCache.getInboundDetails()
    // Get the decimals for the asset
    const assetDecimals = await this.thorchainCache.midgardQuery.getDecimalForAsset(params.asset)
    // Retrieve block data for the specified asset chain
    const blockData = (await this.thorchainCache.thornode.getLastBlock()).find(
      (item: LastBlock) => item.chain === params.asset.chain,
    )
    // Retrieve the saver from the Thorchain node API
    const savers = (await this.thorchainCache.thornode.getSavers(`${params.asset.chain}.${params.asset.symbol}`)).find(
      (item) => item.asset_address.toLowerCase() === params.address.toLowerCase(),
    )
    // Retrieve pool details for the specified asset
    const pool = (await this.thorchainCache.getPoolForAsset(params.asset)).thornodeDetails
    // Push errors if necessary data is not found
    if (!savers) errors.push(`Could not find position for ${params.address}`)
    if (!savers?.last_add_height) errors.push(`Could not find position for ${params.address}`)
    if (!blockData?.thorchain) errors.push(`Could not get thorchain block height`)
    // Calculate the outbound fee
    const outboundFee = calcOutboundFee(params.asset, inboundDetails[params.asset.chain])
    const convertToBaseEight = getBaseAmountWithDiffDecimals(outboundFee, 8)
    // Push an error if the redeemable value is less than the outbound fee
    if (Number(savers?.asset_redeem_value) < convertToBaseEight.toNumber())
      errors.push(`Unlikely to withdraw balance as outbound fee is greater than redeemable amount`)
    // Calculate the redeemable value
    // Extract necessary data for calculation
    const ownerUnits = Number(savers?.units) // Number of units owned by the saver
    const lastAdded = Number(savers?.last_add_height) // Height at which the last addition was made to the pool
    const saverUnits = Number(pool.savers_units) // Total units in the pool
    const assetDepth = Number(pool.savers_depth) // Total asset depth in the pool

    // Calculate the redeemable value of the saver's position based on their ownership in the pool
    const redeemableValue = (ownerUnits / saverUnits) * assetDepth

    // Format the deposit amount and redeemable asset amount with appropriate notation and decimals
    const depositAmount = getCryptoAmountWithNotation(
      new CryptoAmount(baseAmount(savers?.asset_deposit_value), params.asset),
      assetDecimals,
    )
    const redeemableAssetAmount = getCryptoAmountWithNotation(
      new CryptoAmount(baseAmount(redeemableValue), params.asset),
      assetDecimals,
    )

    // Calculate the age of the saver's position in years and days
    const saversAge = (Number(blockData?.thorchain) - lastAdded) / ((365 * 86400) / 6)

    // Calculate the growth percentage of the saver's position
    const saverGrowth = redeemableAssetAmount.minus(depositAmount).div(depositAmount).times(100)

    // Create and populate a SaversPosition object with the calculated values
    const saversPos: SaversPosition = {
      depositValue: depositAmount, // Current deposit value of the saver
      redeemableValue: redeemableAssetAmount, // Redeemable value of the saver's position
      lastAddHeight: Number(savers?.last_add_height), // Height at which the last addition was made to the pool
      percentageGrowth: saverGrowth.assetAmount.amount().toNumber(), // Percentage growth of the saver's position
      ageInYears: saversAge, // Age of the saver's position in years
      ageInDays: saversAge * 365, // Age of the saver's position in days
      asset: params.asset, // Asset of the saver's position
      errors, // Array of any errors encountered during the calculation
    }

    // Return the SaversPosition object representing the saver's position
    return saversPos
  }

  /**
   * @deprecated Loan endpoints were removed from THORNode API in v3.15.0
   */
  public async getLoanQuoteOpen(_params: LoanOpenParams): Promise<LoanOpenQuote> {
    throw new Error(
      'Loan quotes are no longer available. THORNode removed the /quote/loan/open endpoint in API v3.15.0.',
    )
  }

  /**
   * @deprecated Loan endpoints were removed from THORNode API in v3.15.0
   */
  public async getLoanQuoteClose(_params: LoanCloseParams): Promise<LoanCloseQuote> {
    throw new Error(
      'Loan quotes are no longer available. THORNode removed the /quote/loan/close endpoint in API v3.15.0.',
    )
  }

  /**
   * Retrieve details for a THORName.
   * @param thorname - The THORName to get details for.
   * @param height - Optional parameter specifying the block height.
   * @returns A Promise resolving to ThornameDetails.
   */
  public async getThornameDetails(thorname: string, height?: number): Promise<ThornameDetails> {
    const errors: string[] = []

    try {
      // Retrieve THORName details from ThorNode API
      const thornameResp = await this.thorchainCache.thornode.getThornameDetails(thorname, height)
      const response: { error?: string } = JSON.parse(JSON.stringify(thornameResp))
      // Check for errors in response
      if (response.error) errors.push(`Thornode request quote failed: ${response.error}`)
      if (errors.length > 0) {
        // If errors exist, return an object with error details
        const errorResp: ThornameDetails = {
          name: '',
          expireBlockHeight: 0,
          owner: '',
          preferredAsset: '',
          affiliateCollectorRune: '',
          aliases: [],
          error: errors,
        }
        return errorResp
      }
      // Map aliases to ThornameAlias objects
      const thornameAliases: ThornameAlias[] = thornameResp.aliases.map((alias) => ({
        chain: alias.chain as Chain,
        address: alias.address as Address,
      }))
      // Construct ThornameDetails object
      const thornameDetails: ThornameDetails = {
        name: thornameResp.name || '',
        expireBlockHeight: thornameResp.expire_block_height || 0,
        owner: thornameResp.owner || '',
        preferredAsset: thornameResp.preferred_asset || '',
        affiliateCollectorRune: thornameResp.affiliate_collector_rune || '',
        aliases: thornameAliases || [],
      }
      return thornameDetails
    } catch (_e) {
      // If an error occurs during the process, return an object with error details
      const errorResp: ThornameDetails = {
        name: '',
        expireBlockHeight: 0,
        owner: '',
        preferredAsset: '',
        affiliateCollectorRune: '',
        aliases: [],
        error: errors,
      }
      return errorResp
    }
  }

  /**
   * Generate the memo and estimate the cost of registering or updating a THORName.
   * @param thorname - The name to register or update.
   * @param chain - The chain to update/register.
   * @param chainAddress - The address to add to chain alias.
   * @param owner - The owner address (rune address).
   * @param preferredAsset - The preferred asset.
   * @param expirity - The expiry of the domain in MILLISECONDS.
   * @param isUpdate - True only if the domain is already registered and you want to update its data.
   * @returns Memo and value of deposit.
   */
  public async estimateThorname(params: QuoteTHORNameParams): Promise<QuoteTHORName> {
    // Check if THORName already exists
    const thornameDetails = await this.getThornameDetails(params.name)

    if (thornameDetails.owner !== '' && !params.isUpdate) {
      throw Error('Thorname already registered')
    }
    // Retrieve block data
    const blockData = await this.thorchainCache.thornode.getLastBlock()
    const currentThorchainHeight = blockData[0].thorchain
    const currentHeightForExpirity = params.isUpdate
      ? (thornameDetails?.expireBlockHeight as number)
      : currentThorchainHeight

    // Default expiry
    let numberOfBlocksToAddToExpirity = params.isUpdate ? 0 : 5259600 // One year by default

    // Compute expiry height
    if (params.expiry) {
      const currentTimestamp = Math.floor(Date.now() / 1000)
      const expirityTimestamp = Math.floor(params.expiry.getTime() / 1000)
      const numberOfSecondsToExpire = expirityTimestamp - currentTimestamp
      const numberOfBlocks = Math.round(numberOfSecondsToExpire / 6)
      const newHeightExpirity = currentThorchainHeight + numberOfBlocks
      numberOfBlocksToAddToExpirity = thornameDetails?.expireBlockHeight
        ? newHeightExpirity - thornameDetails?.expireBlockHeight
        : numberOfBlocks
    }
    // Compute value
    const constantsDetails = await this.thorchainCache.thornode.getTcConstants()
    const oneTimeFee = params.isUpdate ? baseAmount(0) : baseAmount(constantsDetails['TNSRegisterFee'])
    const totalFeePerBlock = baseAmount(constantsDetails['TNSFeePerBlock']).times(
      numberOfBlocksToAddToExpirity > 0 ? numberOfBlocksToAddToExpirity : 0,
    )
    const txFee = baseAmount(constantsDetails['NativeTransactionFee'], THORCHAIN_DECIMAL)
    const totalCost = new CryptoAmount(oneTimeFee.plus(totalFeePerBlock).plus(txFee), AssetRuneNative)
    const thornameMemo = `~:${params.name}:${
      params.isUpdate ? params.chain || thornameDetails?.aliases[0].chain : params.chain
    }:${params.isUpdate ? params.chainAddress || thornameDetails?.aliases[0].address : params.chainAddress}:${
      params.owner ? params.owner : ''
    }:${params.preferredAsset ? assetToString(params.preferredAsset) : ''}:${
      params.isUpdate ? '' : currentHeightForExpirity + numberOfBlocksToAddToExpirity
    }`.replace(/^:+|:+$/g, '')
    return {
      memo: thornameMemo,
      value: totalCost,
    }
  }

  /**
   * Get inbound addresses details
   * @returns Inbound details
   */
  public async getInboundDetails(): Promise<Record<string, InboundDetail>> {
    return this.thorchainCache.getInboundDetails()
  }

  /**
   * Get chain inbound address details
   * @returns Inbound details
   */
  public async getChainInboundDetails(chain: string): Promise<InboundDetail> {
    const inboundDetails = await this.getInboundDetails()
    if (!inboundDetails[chain]) throw Error(`No inbound details known for ${chain} chain`)
    return inboundDetails[chain]
  }

  /**
   * Get addresses swap history
   * @param {SwapHistoryParams} params Swap history params
   * @param {Address[]} params.addresses - List of addresses
   * @returns {SwapsHistory} Swap history
   */
  public async getSwapHistory({ addresses }: SwapHistoryParams): Promise<SwapsHistory> {
    const actionsResume = await this.thorchainCache.midgardQuery.midgardCache.midgard.getActions({
      address: addresses.join(','),
      type: 'swap',
    })
    const pools = await this.thorchainCache.getPools()

    const getInboundCryptoAmount = (
      pools: Record<string, LiquidityPool>,
      asset: string,
      amount: string,
    ): CryptoAmount => {
      const decimals = asset in pools ? pools[asset].thornodeDetails.decimals || THORCHAIN_DECIMAL : THORCHAIN_DECIMAL
      return decimals === THORCHAIN_DECIMAL
        ? new CryptoAmount(baseAmount(amount), assetFromStringEx(asset))
        : getCryptoAmountWithNotation(new CryptoAmount(baseAmount(amount), assetFromStringEx(asset)), decimals)
    }

    return {
      count: actionsResume.count ? Number(actionsResume.count) : 0,
      swaps: actionsResume.actions.map((action) => {
        const inboundTx: TransactionAction = {
          hash: action.in[0].txID,
          address: action.in[0].address,
          amount: getInboundCryptoAmount(pools, action.in[0].coins[0].asset, action.in[0].coins[0].amount),
        }

        const fromAsset: CompatibleAsset = inboundTx.amount.asset
        const toAsset: CompatibleAsset = this.getAssetFromMemo((action.metadata.swap as SwapMetadata).memo, pools)

        if (action.status === 'pending') {
          return {
            date: new Date(Number(action.date) / 10 ** 6),
            status: 'pending',
            fromAsset,
            toAsset,
            inboundTx,
          }
        }

        const transaction: Transaction = action.out
          .filter((out) => out.coins[0].asset === assetToString(toAsset))
          .sort((out1, out2) => Number(out2.coins[0].amount) - Number(out1.coins[0].amount))[0]

        return {
          date: new Date(Number(action.date) / 10 ** 6),
          status: 'success',
          fromAsset,
          toAsset,
          inboundTx,
          outboundTx: {
            hash: transaction.txID,
            address: transaction.address,
            amount: getInboundCryptoAmount(pools, transaction.coins[0].asset, transaction.coins[0].amount),
          },
        }
      }),
    }
  }

  /*
   * Returns the total units and depth of a trade asset
   * @param {TradeAssetUnitsParams} params Get trade asset unit params
   * @returns {TradeAssetUnits} Returns the total units and depth of a trade asset
   */
  public async getTradeAssetUnits({ asset, height }: TradeAssetUnitsParams): Promise<TradeAssetUnits> {
    const { units, depth } = await this.thorchainCache.thornode.getTradeAssetUnits(assetToString(asset), height)
    const decimals = await this.thorchainCache.midgardQuery.getDecimalForAsset(asset)
    return {
      asset,
      units: new CryptoAmount(baseAmount(units, decimals), asset),
      depth: new CryptoAmount(baseAmount(depth, decimals), asset),
    }
  }

  /*
   * Returns the total units and depth for each trade asset
   * @param {TradeAssetsUnitsParams} params Get trade asset unit params
   * @returns {TradeAssetUnits[]} Returns the total units and depth for each trade asset
   */
  public async getTradeAssetsUnits(params?: TradeAssetsUnitsParams): Promise<TradeAssetUnits[]> {
    const tradeAssetsUnits = await this.thorchainCache.thornode.getTradeAssetsUnits(params?.height)
    const parseData = async ({ asset, units, depth }: TradeUnitResponse): Promise<TradeAssetUnits> => {
      const tradeAsset = assetFromStringEx(asset) as TradeAsset
      const decimals = await this.thorchainCache.midgardQuery.getDecimalForAsset(tradeAsset)
      return {
        asset: tradeAsset,
        units: new CryptoAmount(baseAmount(units, decimals), tradeAsset),
        depth: new CryptoAmount(baseAmount(depth, decimals), tradeAsset),
      }
    }
    return Promise.all(tradeAssetsUnits.map(parseData))
  }

  /**
   * Returns the units and depth of a trade account address
   * @param {TradeAssetsUnitsParams} params Get trade asset unit params
   * @returns {TradeAssetUnits[]} Returns the total units and depth for each trade asset
   */
  public async getAddressTradeAccounts({
    address,
    height,
  }: AddressTradeAccountsParams): Promise<AddressTradeAccounts[]> {
    const account = await this.thorchainCache.thornode.getTradeAssetAccount(address, height)

    const parseData = async (tradeAssetInfo: TradeAccountResponse): Promise<AddressTradeAccounts> => {
      const asset = assetFromStringEx(tradeAssetInfo.asset) as TradeAsset
      return {
        asset,
        address,
        balance: new CryptoAmount(baseAmount(tradeAssetInfo.units), asset),
        lastAddHeight: tradeAssetInfo.last_add_height ? +tradeAssetInfo.last_add_height : undefined,
        lastWithdrawHeight: tradeAssetInfo.last_withdraw_height ? +tradeAssetInfo.last_withdraw_height : undefined,
      }
    }

    return Promise.all(account.map(parseData))
  }

  /**
   * Returns all trade accounts for a trade asset
   * @param {TradeAssetAccountsParams} params Get Trade asset accounts params
   * @param {number} height Optional - Block height
   * @returns Returns all trade accounts for an asset
   */
  public async getTradeAssetAccounts({ asset, height }: TradeAssetAccountsParams): Promise<TradeAssetAccounts[]> {
    const accounts = await this.thorchainCache.thornode.getTradeAssetAccounts(assetToString(asset), height)
    const decimals = await this.thorchainCache.midgardQuery.getDecimalForAsset(asset)
    return accounts.map((account) => {
      return {
        address: account.owner,
        asset,
        balance: new CryptoAmount(baseAmount(account.units, decimals), asset),
        lastAddHeight: account.last_add_height ? +account.last_add_height : undefined,
        lastWithdrawHeight: account.last_withdraw_height ? +account.last_withdraw_height : undefined,
      }
    })
  }

  /**
   * Get Rune pool
   * @param {GetRunePoolParmas} params Get Rune pool params
   * @returns {RunePool} Rune pool information
   */
  public async getRunePool(params?: RunePoolParams): Promise<RunePool> {
    const pool = await this.thorchainCache.thornode.getRunePool(params?.height)
    return {
      pol: {
        runeDeposited: new AssetCryptoAmount(baseAmount(pool.pol.rune_deposited, THORCHAIN_DECIMAL), AssetRuneNative),
        runeWithdrawn: new AssetCryptoAmount(baseAmount(pool.pol.rune_withdrawn, THORCHAIN_DECIMAL), AssetRuneNative),
        value: new AssetCryptoAmount(baseAmount(pool.pol.value, THORCHAIN_DECIMAL), AssetRuneNative),
        pnl: new AssetCryptoAmount(baseAmount(pool.pol.pnl, THORCHAIN_DECIMAL), AssetRuneNative),
        currentRuneDeposited: new AssetCryptoAmount(
          baseAmount(pool.pol.current_deposit, THORCHAIN_DECIMAL),
          AssetRuneNative,
        ),
      },
      providers: {
        units: pool.providers.units,
        pendingUnits: pool.providers.pending_units,
        pendingRune: new AssetCryptoAmount(baseAmount(pool.providers.pending_rune, THORCHAIN_DECIMAL), AssetRuneNative),
        value: new AssetCryptoAmount(baseAmount(pool.providers.value, THORCHAIN_DECIMAL), AssetRuneNative),
        pnl: new AssetCryptoAmount(baseAmount(pool.providers.pnl, THORCHAIN_DECIMAL), AssetRuneNative),
        currentRuneDeposited: new AssetCryptoAmount(
          baseAmount(pool.providers.current_deposit, THORCHAIN_DECIMAL),
          AssetRuneNative,
        ),
      },
      reserve: {
        units: pool.reserve.units,
        value: new AssetCryptoAmount(baseAmount(pool.reserve.value, THORCHAIN_DECIMAL), AssetRuneNative),
        pnl: new AssetCryptoAmount(baseAmount(pool.reserve.pnl, THORCHAIN_DECIMAL), AssetRuneNative),
        currentRuneDeposited: new AssetCryptoAmount(
          baseAmount(pool.reserve.current_deposit, THORCHAIN_DECIMAL),
          AssetRuneNative,
        ),
      },
    }
  }

  /**
   * Get Rune pool provider position
   * @param {RunePoolProviderParams} params Get Rune pool provider position params
   * @returns {RunePoolProvider} Rune pool provider position
   */
  public async getRunePoolProvider({ address, height }: RunePoolProviderParams): Promise<RunePoolProvider> {
    const position = await this.thorchainCache.thornode.getRunePoolProvider(address, height)

    return {
      address: position.rune_address,
      units: position.units,
      value: new AssetCryptoAmount(baseAmount(position.value), AssetRuneNative),
      pnl: new AssetCryptoAmount(baseAmount(position.pnl), AssetRuneNative),
      depositAmount: new AssetCryptoAmount(baseAmount(position.deposit_amount), AssetRuneNative),
      withdrawAmount: new AssetCryptoAmount(baseAmount(position.withdraw_amount), AssetRuneNative),
      lastDepositHeight: position.last_deposit_height,
      lastWithdrawHeight: position.last_withdraw_height,
    }
  }

  /**
   * Get all Rune pool providers position
   * @param {RunePoolProvidersParams} params Get Rune pool provider position params
   * @returns {RunePoolProvider[]} All Rune pool providers position
   */
  public async getRunePoolProviders(params?: RunePoolProvidersParams): Promise<RunePoolProvider[]> {
    const positions = await this.thorchainCache.thornode.getRunePoolProviders(params?.height)

    return positions.map((position) => {
      return {
        address: position.rune_address,
        units: position.units,
        value: new AssetCryptoAmount(baseAmount(position.value), AssetRuneNative),
        pnl: new AssetCryptoAmount(baseAmount(position.pnl), AssetRuneNative),
        depositAmount: new AssetCryptoAmount(baseAmount(position.deposit_amount), AssetRuneNative),
        withdrawAmount: new AssetCryptoAmount(baseAmount(position.withdraw_amount), AssetRuneNative),
        lastDepositHeight: position.last_deposit_height,
        lastWithdrawHeight: position.last_withdraw_height,
      }
    })
  }

  private getAssetFromMemo(memo: string, pools: Record<string, LiquidityPool>): CompatibleAsset {
    const getAssetFromAliasIfNeeded = (alias: string, pools: Record<string, LiquidityPool>): string => {
      const nativeAlias = new Map<string, string>([
        ['r', 'THOR.RUNE'],
        ['rune', 'THOR.RUNE'],
        ['b', 'BTC.BTC'],
        ['e', 'ETH.ETH'],
        ['g', 'GAIA.ATOM'],
        ['d', 'DOGE.DOGE'],
        ['l', 'LTC.LTC'],
        ['c', 'BCH.BCH'],
        ['a', 'AVAX.AVAX'],
        ['s', 'BSC.BNB'],
        ['f', 'BASE.ETH'],
      ])

      const nativeAsset = nativeAlias.get(alias.toLowerCase())
      if (nativeAsset) return nativeAsset

      let delimiter: string = TOKEN_ASSET_DELIMITER

      if (alias.includes(TRADE_ASSET_DELIMITER)) {
        delimiter = TRADE_ASSET_DELIMITER
      } else if (alias.includes(SYNTH_ASSET_DELIMITER)) {
        delimiter = SYNTH_ASSET_DELIMITER
      } else if (alias.includes(SECURED_ASSET_DELIMITER)) {
        delimiter = SECURED_ASSET_DELIMITER
      }

      const splitedAlias = alias.split(delimiter)
      const poolId = Object.keys(pools).find((pool) => pool === `${splitedAlias[0]}.${splitedAlias[1].split('-')[0]}`)

      if (poolId) return pools[poolId].assetString.replace('.', delimiter)

      return alias
    }

    const attributes = memo.split(':')
    if (!attributes[0]) throw Error(`Invalid memo: ${memo}`)

    switch (attributes[0]) {
      case 'SWAP':
      case '=':
        if (!attributes[1]) throw Error('Asset not defined')
        return assetFromStringEx(getAssetFromAliasIfNeeded(attributes[1], pools)) as CompatibleAsset
      default:
        throw Error(`Get asset from memo unsupported for ${attributes[0]} operation`)
    }
  }
}
