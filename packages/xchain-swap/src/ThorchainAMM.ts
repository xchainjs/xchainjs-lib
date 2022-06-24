import { AssetLUNA } from '@xchainjs/xchain-terra/lib'
import { isAssetRuneNative } from '@xchainjs/xchain-thorchain/lib'
import {
  Asset,
  AssetAmount,
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
  assetToBase,
  baseAmount,
  baseToAsset,
  eqAsset,
} from '@xchainjs/xchain-util'
import { BigNumber } from 'bignumber.js'

import { LiquidityPool } from './LiquidityPool'
import {
  EstimateSwapParams,
  InboundDetail,
  PoolCache,
  SwapEstimate,
  SwapOutput,
  SwapSubmitted,
  TotalFees,
} from './types'
import { Midgard } from './utils/midgard'
import { getDoubleSwap, getSingleSwap } from './utils/swap'
const BN_1 = new BigNumber(1)

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
    }
    if (estimate.slipPercentage.gte(params.slipLimit || 1))
      errors.push(
        `expected slip: ${estimate.slipPercentage.toFixed()} is greater than your slip limit:${params.slipLimit?.toFixed()} `,
      )
    // Check if the inputAmount value is enough to cover all the fees.
    if (sourcePool?.isAvailable() && destinationPool?.isAvailable()) {
      const inboundFeeInRune = sourcePool?.getValueInRUNE(params.sourceAsset, estimate.totalFees.inboundFee)
      const outboundFeeInRune = destinationPool.getValueInRUNE(params.destinationAsset, estimate.totalFees.outboundFee)
      const swapFeeInRune = sourcePool.getValueInRUNE(params.sourceAsset, estimate.totalFees.swapFee)
      const affiliateFeeInRune = sourcePool?.getValueInRUNE(params.sourceAsset, estimate.totalFees.affiliateFee)
      const totalSwapFeesInRune = inboundFeeInRune.plus(outboundFeeInRune).plus(swapFeeInRune).plus(affiliateFeeInRune)
      if (totalSwapFeesInRune >= params.inputAmount)
        errors.push(`Input amount ${params.inputAmount} is less than or equal to total swap fees`)
    }
    return errors
  }
  private calcSwapEstimate(
    params: EstimateSwapParams,
    sourceInboundDetails: InboundDetail,
    sourcePool: LiquidityPool | undefined,
    destinationPool: LiquidityPool | undefined,
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

    // remove any affiliateFee. netInput * affiliateFee (%age) of the destination asset type
    const affiliateFee = inputNetAmount.times(params.affiliateFeePercent || 0)
    // remove the affiliate fee from the input.
    inputNetAmount = inputNetAmount.minus(affiliateFee)
    // now we calculate swapfee based on inputNetAmount
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

    const swapEstimate = this.calcSwapEstimate(params, sourceInboundDetails, sourcePool, destinationPool)
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
      // ---------------- Work out total Wait Time for Swap ---------------------- /
      if (swapEstimate.canSwap) {
        const confCountTime = await this.confCounting(destinationPool, swapEstimate.netOutput)
        // if (!confCountTime) {
        //   throw Error(`Could not get conf count for ${params.destinationAsset.ticker}`)
        // }
        const outboundDelay = await this.outboundDelay(destinationPool, params.destinationAsset, swapEstimate.netOutput)
        // if (!outboundDelay) {
        //   throw Error(`Could not get conf count for ${params.destinationAsset.ticker}`)
        // }

        // Find the biggest delay for the outbound Tx
        let waitTime = (confCountTime > outboundDelay ? confCountTime : outboundDelay)

        // Add the Tx in Time
        // const inboundDelay = await this.confCounting(params.sourceAsset, params.inputAmount)
        // if (!inboundDelay) {
        //   throw Error(`Could not get conf count for ${params.sourceAsset}`)
        // }
        swapEstimate.waitTime = waitTime
      }
    }
    return swapEstimate
  }
  /**
   * Conducts a swap with the given inputs
   *
   * @param wallet
   * @param params
   * @param destinationAddress
   * @param affiliateAddress
   * @param interfaceID
   * @returns {SwapSubmitted} - Tx Hash, URL of BlockExplorer and expected wait time.
   */
  public async doSwap(
    //  wallet: Wallet,
    params: EstimateSwapParams,
    destinationAddress: string,
    affiliateAddress: string,
    interfaceID = 999,
  ): Promise<SwapSubmitted> {

    this.isValidSwap(params)
    const swapEstimate = await this.estimateSwap(params) // Used to return fees

    // Work out LIM from the slip percentage
    let limPercentage = BN_1
    if (params.slipLimit) {
      limPercentage = BN_1.minus(params.slipLimit || 1)
      // need to get output value here.
    } // else allowed slip is 100%

    const limInputAmount: BaseAmount = params.inputAmount.times(limPercentage)
    const limAssetAmount = await this.convertAssetToAsset(
      params.sourceAsset,
      baseToAsset(limInputAmount),
      params.destinationAsset,
    )
    if (!limAssetAmount) {
      throw new Error(`Could not convert ${params.sourceAsset} to ${params.destinationAsset}`)
    }
    let limstring = ``

    limstring = limAssetAmount.amount().toFixed()

    // create LIM with interface ID
    const lim = limstring.substring(0, limstring.length - 3).concat(interfaceID.toString())
    // create the full memo
    const memo = `=:${params.destinationAsset.chain}.${
      params.destinationAsset.symbol
    }:${destinationAddress}:${lim}:${affiliateAddress}:${swapEstimate.totalFees.affiliateFee.amount().toFixed()}`
    // if (params.destinationAsset == AssetBTC && memo.length > 80) {
    //   // if memo length is too long for BTC, need to trim it
    //   memo = `:${params.destinationAsset.chain}.${params.destinationAsset.symbol}:${destinationAddress}`
    // }
    console.log(`DoSwap: memo is: ${memo.toString()}`)

    const msgDepositSubmitted: SwapSubmitted = {
      hash: ``,
      url: ``, // ? don't need this. just need txhash
    }
    return msgDepositSubmitted

    // return wallet.executeSwap({
    //   fromBaseAmount: params.inputAmount,
    //   from: params.sourceAsset,
    //   to: params.destinationAsset,
    //   memo: memo,
    // })
  }

  /**
   * Works out how long an outbound Tx will be held by THORChain before sending.
   *
   * Needs to be tested
   *
   * @param asset asset being sent.
   * @param outboundAmount the amount of that asset
   * @returns required delay in seconds
   * @see https://gitlab.com/thorchain/thornode/-/blob/develop/x/thorchain/manager_txout_current.go#L548
   */
  public async outboundDelay(liquidtyPool: LiquidityPool, asset: Asset, outboundAmount: BaseAmount): Promise<number> {

    const minTxOutVolumeThreshold = await this.midgard.getNetworkValueByName("MinTxOutVolumeThreshold")
    const maxTxOutOffset =  await this.midgard.getNetworkValueByName("MaxTxOutOffset")
    const getScheduledOutboundValue = await this.midgard.getScheduledOutboundValue()
    const thorChainblocktime = 6 // blocks required to confirm tx

    let txOutDelayRate =  await this.midgard.getNetworkValueByName("TXOUTDELAYRATE")  // set to 100 rune
    let runeValue: BaseAmount

    // If asset is equal to Rune set runeValue as outbound amount else set it to the asset's value in rune
    runeValue = (eqAsset(AssetRuneNative, asset)) ? outboundAmount : liquidtyPool.getValueInRUNE(asset, outboundAmount)
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
    txOutDelayRate = ((txOutDelayRate - volumeThreshold.toNumber()) < 1 ? 1 : txOutDelayRate)
    // calculate the minimum number of blocks in the future the txn has to be
    let minBlocks = runeValue.div(txOutDelayRate).amount().toNumber()
    minBlocks = ( minBlocks > maxTxOutOffset ? maxTxOutOffset : minBlocks)
    return minBlocks * thorChainblocktime
  }

  /**
   * Finds the required confCount required for an inbound or outbound Tx to THORChain
   *
   * Finds the gas asset of the given asset (e.g. BUSD is on BNB), finds the value of asset in Gas Asset then finds the required confirmation count.
   * ConfCount is then times by 6 seconds.
   *
   * @param liquidityPool - asset of the outbound amount.
   * @param netOutput - netOuput of asset being swapped (any asset).
   * @returns time in seconds before a Tx is confirmed by THORChain
   */
  private async confCounting(liquidityPool: LiquidityPool, netOutput: BaseAmount): Promise<number> {

    let amountInGasAsset: BaseAmount

    const btcBlockTime = 600 // 600 seconds =  10 mins
    const btcBlockReward = 6.25
    const amountInRUNE = liquidityPool.getValueInRUNE(liquidityPool.asset, netOutput)

    const chainGasAsset = this.getChainAsset(liquidityPool.asset.chain)

    if (eqAsset(chainGasAsset, liquidityPool.asset)) {

      amountInGasAsset = netOutput
    } else {
      const gasChainPool = await this.getPoolForAsset(chainGasAsset)
      if (!gasChainPool) {
        throw new Error(`Could not find Pool for asset: ${chainGasAsset}`)
      }
      const assetPrice = gasChainPool.inverseAssetPrice
      amountInGasAsset = assetToBase(assetPrice.times(amountInRUNE.amount()))
    }

    const amountInGasAssetInAsset: AssetAmount = baseToAsset(amountInGasAsset)
    const requiredConfs = Math.ceil(amountInGasAssetInAsset.amount().div(btcBlockReward).toNumber())

    return requiredConfs * btcBlockTime
  }

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
  async getPoolForAsset(asset: Asset): Promise<LiquidityPool | undefined> {
    const pools = await this.getPools()
    return pools[asset.ticker]
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
   * Takes an Asset and converts it to the value of the other asset using pool ratio's
   *
   * @param sourceAsset Input Asset type
   * @param inputAssetAmount Input Asset amount
   * @param destinationAsset Output Asset type
   * @returns destinationAssetAmount - amount in destination asset after conversion
   */
  public async convertAssetToAsset(sourceAsset: Asset, inputAssetAmount: AssetAmount, destinationAsset: Asset ): Promise<AssetAmount> {

    let destinationAssetAmount: AssetAmount

    // Convert RUNE to Outbound Asset, limAmount is in RUNE. assetPrice then * by RUNE amount.
    // lim RUNE ammount * (AssetPool: Asset Depth / RUNE Depth)
    const sourceAssetPool = await this.getPoolForAsset(sourceAsset)
    const destinationAssetPool = await this.getPoolForAsset(destinationAsset)

    if (eqAsset(sourceAsset, AssetRuneNative) && destinationAssetPool) {
      const inversedRuneOverAsset = destinationAssetPool.inverseAssetPrice
      destinationAssetAmount = inputAssetAmount.times(inversedRuneOverAsset)
    }
    else if (eqAsset(destinationAsset, AssetRuneNative) && sourceAssetPool) {
      destinationAssetAmount = baseToAsset(sourceAssetPool.getValueInRUNE(sourceAsset, assetToBase(inputAssetAmount)))
    }
    else if (sourceAssetPool && destinationAssetPool) {
      const assetToAssetRatio = sourceAssetPool.getPriceIn(destinationAssetPool)
      destinationAssetAmount = inputAssetAmount.times(assetToAssetRatio.amount())
    } else {
      throw Error ('Source or destination pool is undefined')
    }
    return destinationAssetAmount
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

  // public async addLiquidity(sourceAssets: Asset[], inputAmount: BaseAmount[]): Promise<MsgDepositSubmitted> {
  //   let memo

  //   if (sourceAssets.length != inputAmount.length) {
  //     new Error('Invalid Params, sourceAssets count does not match inputAmount count')
  //   }
  //   // Asym into Asset
  //   if (sourceAssets.length == 1 && inputAmount.length == 1) {
  //     const pool: LiquidityPool = this.getPoolForAsset(sourceAssets[0])
  //     memo = `+:${sourceAssets[0].chain}}`
  //   }

  //   for (const asset of sourceAssets) {
  //     const pool = this.getPoolForAsset(asset)
  //   }

  //   return MsgDepositSubmitted({
  //     hash: 0,
  //     url: '',
  //   })
  // }
}
