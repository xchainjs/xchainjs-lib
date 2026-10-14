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
  GAIAChain,
  THORCHAIN_DECIMAL,
  THORChain,
  getCryptoAmountWithNotation,
  isAssetRuneNative,
} from './utils'
import { getLiquidityProtectionData, getLiquidityUnits, getPoolShare, getSlipOnLiquidity } from './utils/liquidity'
import { calcNetworkFee, calcOutboundFee, getBaseAmountWithDiffDecimals, getChainAsset } from './utils/utils'

const defaultCache = new ThorchainCache()

export class ThorchainQuery {
  readonly thorchainCache: ThorchainCache
  private chainAttributes: Record<Chain, ChainAttributes>

  constructor(thorchainCache = defaultCache, chainAttributes = DefaultChainAttributes) {
    this.thorchainCache = thorchainCache
    this.chainAttributes = chainAttributes
  }

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
    affiliates,
    height,
  }: QuoteSwapParams): Promise<TxDetails> {
    const errors: string[] = []

    const error = await this.validateAmount(amount)
    if (error) errors.push(error.message)

    const fromAssetString = assetToString(fromAsset)
    const toAssetString = assetToString(destinationAsset)
    const inputAmount = getBaseAmountWithDiffDecimals(amount, 8)

    // If the caller passed a multi-affiliate array, collapse it into the slash-delimited
    // form the protocol's /quote/swap endpoint accepts. The endpoint requires per-affiliate bps
    // (it does not auto-expand a single shared bps), so both fields are joined in parallel.
    const hasAffiliates = Boolean(affiliates?.length)
    const quoteAffiliateAddress = hasAffiliates ? affiliates!.map((a) => a.address).join('/') : affiliateAddress
    const quoteAffiliateBps = hasAffiliates ? affiliates!.map((a) => a.bps).join('/') : affiliateBps

    const swapQuote = await this.thorchainCache.thornode.getSwapQuote(
      fromAssetString,
      toAssetString,
      inputAmount.toNumber(),
      destinationAddress,
      streamingInterval,
      streamingQuantity,
      toleranceBps,
      liquidityToleranceBps,
      quoteAffiliateBps,
      quoteAffiliateAddress,
      height,
    )

    let response

    if (typeof swapQuote === 'string') {
      response = { error: swapQuote }
    } else {
      response = swapQuote
    }
    const responseError: { error?: string } = JSON.parse(JSON.stringify(response))
    if (responseError.error) errors.push(`Thornode request quote: ${responseError.error}`)
    if (errors.length > 0) {
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
    // sending less than this recommended minimum can fail the refund
    const feeAsset = assetFromStringEx(swapQuote.fees.asset) as Asset | TokenAsset | SynthAsset
    const feeAssetDecimals = await this.thorchainCache.midgardQuery.getDecimalForAsset(feeAsset)
    const destinationAssetDecimals = await this.thorchainCache.midgardQuery.getDecimalForAsset(destinationAsset)
    if (swapQuote.recommended_min_amount_in && inputAmount.toNumber() < Number(swapQuote.recommended_min_amount_in))
      errors.push(
        `Error amount in: ${inputAmount.toNumber()} is less than reccommended Min Amount: ${
          swapQuote.recommended_min_amount_in
        }`,
      )
    if (swapQuote.memo === undefined) errors.push(`Error parsing swap quote: Memo is ${swapQuote.memo}`)

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

  public async validateAmount(cryptoAmount: CryptoAmount<CompatibleAsset>): Promise<Error | void> {
    const assetDecimals = await this.thorchainCache.midgardQuery.getDecimalForAsset(cryptoAmount.asset)
    if (cryptoAmount.baseAmount.decimal !== assetDecimals)
      return new Error(
        `Invalid number of decimals: ${assetToString(cryptoAmount.asset)} must have ${assetDecimals} decimals`,
      )
  }

  /** @see https://gitlab.com/thorchain/thornode/-/blob/develop/x/thorchain/manager_txout_current.go#L548 */
  async outboundDelay(outboundAmount: CryptoAmount<Asset | TokenAsset>): Promise<number> {
    const networkValues = await this.thorchainCache.getNetworkValues()
    const minTxOutVolumeThreshold = new AssetCryptoAmount(
      baseAmount(networkValues['MINTXOUTVOLUMETHRESHOLD']),
      AssetRuneNative,
    )
    const maxTxOutOffset = networkValues['MAXTXOUTOFFSET']
    let txOutDelayRate = new AssetCryptoAmount(baseAmount(networkValues['TXOUTDELAYRATE']), AssetRuneNative).assetAmount
      .amount()
      .toNumber()
    const getQueue = await this.thorchainCache.thornode.getQueue()
    const outboundValue = new AssetCryptoAmount(baseAmount(getQueue.scheduled_outbound_value), AssetRuneNative)
    const thorChainblocktime = this.chainAttributes[THORChain].avgBlockTimeInSecs
    const runeValue = await this.thorchainCache.convert(outboundAmount, AssetRuneNative)
    if (runeValue.lt(minTxOutVolumeThreshold)) {
      return thorChainblocktime
    }
    if (outboundValue == undefined) {
      throw new Error(`Could not return Scheduled Outbound Value`)
    }
    const outboundAmountTotal = runeValue.plus(outboundValue)
    const volumeThreshold = outboundAmountTotal.div(minTxOutVolumeThreshold)
    txOutDelayRate = txOutDelayRate - volumeThreshold.assetAmount.amount().toNumber() <= 1 ? 1 : txOutDelayRate
    let minBlocks = runeValue.assetAmount.amount().toNumber() / txOutDelayRate
    minBlocks = minBlocks > maxTxOutOffset ? maxTxOutOffset : minBlocks
    return minBlocks * thorChainblocktime
  }

  // TotalFees are always in RUNE
  async getFeesIn(fees: TotalFees, asset: CompatibleAsset): Promise<TotalFees> {
    return {
      asset: fees.asset, // Shouldn't be asset?
      // swapFee: await this.convert(fees.swapFee, asset),
      outboundFee: await this.convert(fees.outboundFee, asset),
      affiliateFee: await this.convert(fees.affiliateFee, asset),
      liquidityFee: await this.convert(fees.liquidityFee, asset),
      // totatBps: fees.totatBps,
    }
  }

  async convert<T extends Asset | TokenAsset | SynthAsset | TradeAsset | SecuredAsset>(
    input: CryptoAmount<Asset | TokenAsset | SynthAsset | TradeAsset | SecuredAsset>,
    outAsset: T,
  ): Promise<CryptoAmount<T>> {
    return await this.thorchainCache.convert(input, outAsset)
  }
  // Midgard data only; conf count is then times 6 seconds. @see https://docs.thorchain.org/chain-clients/overview
  async confCounting(inbound: CryptoAmount): Promise<number> {
    // instant finality assets or synths
    if (isAssetRuneNative(inbound.asset) || inbound.asset.chain == GAIAChain || isSynthAsset(inbound.asset)) {
      return this.chainAttributes[THORChain].avgBlockTimeInSecs
    }
    const chainGasAsset = getChainAsset(inbound.asset.chain)
    const amountInGasAsset = await this.thorchainCache.convert(inbound, chainGasAsset)
    const amountInGasAssetInAsset = amountInGasAsset.assetAmount
    const confConfig = this.chainAttributes[inbound.asset.chain]
    const requiredConfs = Math.ceil(amountInGasAssetInAsset.amount().div(confConfig.blockReward).toNumber())
    return requiredConfs * confConfig.avgBlockTimeInSecs
  }

  public async estimateAddLP(params: AddliquidityPosition): Promise<EstimateAddLP> {
    const errors: string[] = []
    if (isSynthAsset(params.asset.asset) || isSynthAsset(params.rune.asset)) {
      errors.push('you cannot add liquidity with a synth')
    }
    if (!isAssetRuneNative(params.rune.asset)) errors.push('params.rune must be THOR.RUNE')
    const assetPool = await this.thorchainCache.getPoolForAsset(params.asset.asset)
    const lpUnits = getLiquidityUnits({ asset: params.asset, rune: params.rune }, assetPool)
    const inboundDetails = await this.thorchainCache.getInboundDetails()
    const unitData: UnitData = {
      liquidityUnits: lpUnits,
      totalUnits: new BigNumber(assetPool.thornodeDetails.LP_units),
    }
    const poolShare = getPoolShare(unitData, assetPool)
    const assetWaitTimeSeconds = await this.confCounting(params.asset)
    const runeWaitTimeSeconds = await this.confCounting(params.rune)
    const waitTimeSeconds = assetWaitTimeSeconds > runeWaitTimeSeconds ? assetWaitTimeSeconds : runeWaitTimeSeconds
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
    const totalFees = (await this.convert(assetInboundFee, AssetRuneNative)).plus(runeInboundFee)
    const slip = getSlipOnLiquidity({ asset: params.asset, rune: params.rune }, assetPool)
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

  public async checkLiquidityPosition(
    asset: Asset | TokenAsset,
    assetOrRuneAddress?: string,
  ): Promise<LiquidityPosition> {
    const poolAsset = await this.thorchainCache.getPoolForAsset(asset)
    if (!poolAsset) throw Error(`Could not find pool for ${assetToString(asset)}`)
    if (!assetOrRuneAddress) throw Error(`No address provided ${assetOrRuneAddress}`)
    const liquidityProvider = await this.thorchainCache.thornode.getLiquidityProvider(
      poolAsset.assetString,
      assetOrRuneAddress,
    )
    if (!liquidityProvider) throw Error(`Could not find LP for ${assetOrRuneAddress}`)
    const blockData = (await this.thorchainCache.thornode.getLastBlock()).find((item) => item.chain === asset.chain)
    if (!blockData) throw Error(`Could not get block data`)
    const unitData: UnitData = {
      totalUnits: new BigNumber(poolAsset.thornodeDetails.LP_units),
      liquidityUnits: new BigNumber(liquidityProvider.units),
    }
    const networkValues = await this.thorchainCache.thornode.getNetworkValues()
    const block: Block = {
      current: blockData.thorchain,
      lastAdded: liquidityProvider.last_add_height,
      fullProtection: networkValues['FULLIMPLOSSPROTECTIONBLOCKS'],
    }

    const assetDecimals = await this.thorchainCache.midgardQuery.getDecimalForAsset(asset)
    const currentLP: PostionDepositValue = {
      asset: baseAmount(liquidityProvider.asset_deposit_value, assetDecimals),
      rune: baseAmount(liquidityProvider.rune_deposit_value),
    }
    const poolShare = getPoolShare(unitData, poolAsset)
    // LUVI = sqrt(assetDepth * runeDepth) / poolUnits; growth is redeem minus deposit
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

  // Do not send assetNativeRune. There is no pool for it.
  public async getPoolRatios(asset: Asset | TokenAsset): Promise<PoolRatios> {
    const assetPool = await this.thorchainCache.getPoolForAsset(asset)
    const poolRatio: PoolRatios = {
      assetToRune: assetPool.assetToRuneRatio,
      runeToAsset: assetPool.runeToAssetRatio,
    }
    return poolRatio
  }

  public async estimateWithdrawLP(params: WithdrawLiquidityPosition): Promise<EstimateWithdrawLP> {
    // Caution Dust Limits: BTC,BCH,LTC chains 10k sats; DOGE 1m Sats; ETH 0 wei; THOR 0 RUNE.
    const assetOrRuneAddress = params.assetAddress ? params.assetAddress : params.runeAddress
    const memberDetail = await this.checkLiquidityPosition(params.asset, assetOrRuneAddress)
    const dustValues = await this.getDustValues(getChainAsset(params.asset.chain))
    const assetPool = await this.thorchainCache.getPoolForAsset(params.asset)
    const poolShare = getPoolShare(
      {
        liquidityUnits: new BigNumber(memberDetail.position.units),
        totalUnits: new BigNumber(assetPool.thornodeDetails.LP_units),
      },
      assetPool,
    )
    const slip = getSlipOnLiquidity(
      {
        asset: poolShare.assetShare,
        rune: poolShare.runeShare,
      },
      assetPool,
    )
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
      assetPool: assetPool.thornodeDetails.asset,
    }
    return estimateLP
  }
  // Can this become a queried constant? added to inbound_addresses or something
  private async getDustValues(asset: Asset): Promise<DustValues> {
    const assetDecimals = await this.thorchainCache.midgardQuery.getDecimalForAsset(asset)
    switch (asset.chain) {
      case 'BTC':
      case `BCH`:
      case `LTC`:
      case 'ZEC':
        // Dust value: 10k sats / zats (THORNode common UTXO dust)
        return {
          asset: new AssetCryptoAmount(assetToBase(assetAmount(0.0001, assetDecimals)), asset),
          rune: new AssetCryptoAmount(assetToBase(assetAmount(0)), AssetRuneNative),
        }
      case 'ETH':
        return {
          asset: new AssetCryptoAmount(assetToBase(assetAmount(0, assetDecimals)), asset),
          rune: new AssetCryptoAmount(assetToBase(assetAmount(0)), AssetRuneNative),
        }
      case 'THOR':
        return {
          asset: new AssetCryptoAmount(assetToBase(assetAmount(0, assetDecimals)), asset),
          rune: new AssetCryptoAmount(assetToBase(assetAmount(0)), AssetRuneNative),
        }
      case 'GAIA':
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
        return {
          asset: new AssetCryptoAmount(assetToBase(assetAmount(0, assetDecimals)), asset),
          rune: new AssetCryptoAmount(assetToBase(assetAmount(0)), AssetRuneNative),
        }
      case 'BSC':
        return {
          asset: new AssetCryptoAmount(assetToBase(assetAmount(0, assetDecimals)), asset),
          rune: new AssetCryptoAmount(assetToBase(assetAmount(0)), AssetRuneNative),
        }
      default:
        throw Error('Unknown chain')
    }
  }

  /** @deprecated Saver quote endpoints were removed from THORNode API in v3.15.0 */
  public async estimateAddSaver(_addAmount: CryptoAmount<Asset | TokenAsset>): Promise<EstimateAddSaver> {
    throw new Error(
      'Saver deposit quotes are no longer available. THORNode removed the /quote/saver/deposit endpoint in API v3.15.0.',
    )
  }

  /** @deprecated Saver quote endpoints were removed from THORNode API in v3.15.0 */
  public async estimateWithdrawSaver(_withdrawParams: SaversWithdraw): Promise<EstimateWithdrawSaver> {
    throw new Error(
      'Saver withdraw quotes are no longer available. THORNode removed the /quote/saver/withdraw endpoint in API v3.15.0.',
    )
  }

  public async getSaverPosition(params: getSaver): Promise<SaversPosition> {
    const errors: string[] = []
    const inboundDetails = await this.thorchainCache.getInboundDetails()
    const assetDecimals = await this.thorchainCache.midgardQuery.getDecimalForAsset(params.asset)
    const blockData = (await this.thorchainCache.thornode.getLastBlock()).find(
      (item: LastBlock) => item.chain === params.asset.chain,
    )
    const savers = (await this.thorchainCache.thornode.getSavers(`${params.asset.chain}.${params.asset.symbol}`)).find(
      (item) => item.asset_address.toLowerCase() === params.address.toLowerCase(),
    )
    const pool = (await this.thorchainCache.getPoolForAsset(params.asset)).thornodeDetails
    if (!savers) errors.push(`Could not find position for ${params.address}`)
    if (!savers?.last_add_height) errors.push(`Could not find position for ${params.address}`)
    if (!blockData?.thorchain) errors.push(`Could not get thorchain block height`)
    const outboundFee = calcOutboundFee(params.asset, inboundDetails[params.asset.chain])
    const convertToBaseEight = getBaseAmountWithDiffDecimals(outboundFee, 8)
    if (Number(savers?.asset_redeem_value) < convertToBaseEight.toNumber())
      errors.push(`Unlikely to withdraw balance as outbound fee is greater than redeemable amount`)
    const ownerUnits = Number(savers?.units)
    const lastAdded = Number(savers?.last_add_height)
    const saverUnits = Number(pool.savers_units)
    const assetDepth = Number(pool.savers_depth)

    const redeemableValue = (ownerUnits / saverUnits) * assetDepth

    const depositAmount = getCryptoAmountWithNotation(
      new CryptoAmount(baseAmount(savers?.asset_deposit_value), params.asset),
      assetDecimals,
    )
    const redeemableAssetAmount = getCryptoAmountWithNotation(
      new CryptoAmount(baseAmount(redeemableValue), params.asset),
      assetDecimals,
    )

    const saversAge = (Number(blockData?.thorchain) - lastAdded) / ((365 * 86400) / 6)

    const saverGrowth = redeemableAssetAmount.minus(depositAmount).div(depositAmount).times(100)

    const saversPos: SaversPosition = {
      depositValue: depositAmount,
      redeemableValue: redeemableAssetAmount,
      lastAddHeight: Number(savers?.last_add_height),
      percentageGrowth: saverGrowth.assetAmount.amount().toNumber(),
      ageInYears: saversAge,
      ageInDays: saversAge * 365,
      asset: params.asset,
      errors,
    }

    return saversPos
  }

  /** @deprecated Loan endpoints were removed from THORNode API in v3.15.0 */
  public async getLoanQuoteOpen(_params: LoanOpenParams): Promise<LoanOpenQuote> {
    throw new Error(
      'Loan quotes are no longer available. THORNode removed the /quote/loan/open endpoint in API v3.15.0.',
    )
  }

  /** @deprecated Loan endpoints were removed from THORNode API in v3.15.0 */
  public async getLoanQuoteClose(_params: LoanCloseParams): Promise<LoanCloseQuote> {
    throw new Error(
      'Loan quotes are no longer available. THORNode removed the /quote/loan/close endpoint in API v3.15.0.',
    )
  }

  public async getThornameDetails(thorname: string, height?: number): Promise<ThornameDetails> {
    const errors: string[] = []

    try {
      const thornameResp = await this.thorchainCache.thornode.getThornameDetails(thorname, height)
      const response: { error?: string } = JSON.parse(JSON.stringify(thornameResp))
      if (response.error) errors.push(`Thornode request quote failed: ${response.error}`)
      if (errors.length > 0) {
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
      const thornameAliases: ThornameAlias[] = thornameResp.aliases.map((alias) => ({
        chain: alias.chain as Chain,
        address: alias.address as Address,
      }))
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

  public async estimateThorname(params: QuoteTHORNameParams): Promise<QuoteTHORName> {
    const thornameDetails = await this.getThornameDetails(params.name)

    if (thornameDetails.owner !== '' && !params.isUpdate) {
      throw Error('Thorname already registered')
    }
    const blockData = await this.thorchainCache.thornode.getLastBlock()
    const currentThorchainHeight = blockData[0].thorchain
    const currentHeightForExpirity = params.isUpdate
      ? (thornameDetails?.expireBlockHeight as number)
      : currentThorchainHeight

    let numberOfBlocksToAddToExpirity = params.isUpdate ? 0 : 5259600 // One year by default

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

  public async getInboundDetails(): Promise<Record<string, InboundDetail>> {
    return this.thorchainCache.getInboundDetails()
  }

  public async getChainInboundDetails(chain: string): Promise<InboundDetail> {
    const inboundDetails = await this.getInboundDetails()
    if (!inboundDetails[chain]) throw Error(`No inbound details known for ${chain} chain`)
    return inboundDetails[chain]
  }

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

  public async getTradeAssetUnits({ asset, height }: TradeAssetUnitsParams): Promise<TradeAssetUnits> {
    const { units, depth } = await this.thorchainCache.thornode.getTradeAssetUnits(assetToString(asset), height)
    const decimals = await this.thorchainCache.midgardQuery.getDecimalForAsset(asset)
    return {
      asset,
      units: new CryptoAmount(baseAmount(units, decimals), asset),
      depth: new CryptoAmount(baseAmount(depth, decimals), asset),
    }
  }

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
