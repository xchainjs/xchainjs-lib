import { AssetLUNA } from '@xchainjs/xchain-terra/lib'
import { isAssetRuneNative } from '@xchainjs/xchain-thorchain/lib'
import {
  Asset,
  AssetBCH,
  AssetBNB,
  AssetBTC,
  // assetFromString,
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
  assetToString,
  baseAmount,
  baseToAsset,
  eqAsset,
} from '@xchainjs/xchain-util'
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

    if (sourcePool?.isAvailable() && destinationPool?.isAvailable()) {
      const inboundFeeInRune = sourcePool?.getValueInRUNE(params.sourceAsset, estimate.totalFees.inboundFee)
      const outboundFeeInRune = destinationPool.getValueInRUNE(params.destinationAsset, estimate.totalFees.outboundFee)
      const swapFeeInRune = sourcePool.getValueInRUNE(params.sourceAsset, estimate.totalFees.swapFee)
      const totalSwapFeesInRune = inboundFeeInRune.plus(outboundFeeInRune).plus(swapFeeInRune)
      if (totalSwapFeesInRune > params.inputAmount)
        errors.push(`Input amount ${params.inputAmount} is less that total swap fees`)
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

    // remove any affiliateFee. netInput * affiliateFee (%age) of the desitnaiton asset type
    const affiliateFee = inputNetAmount.times(params.affiliateFeePercent || 0)
    // remove the affiliate fee from the input.
    inputNetAmount = inputNetAmount.minus(affiliateFee)
    //now we calculate swapfee based on inputNetAmount
    const swapOutput = this.calcSwapOutput(inputNetAmount, sourcePool, destinationPool)

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
      waitTime: 0,
      canSwap: false, //assume false for now, the getSwapEstimateErrors() step will flip this flag if required
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
    throw Error('cannot calcSwapOutput')
  }
  /**
   *
   * @param params - amount to swap

   * @returns The SwapEstimate
   */
  async estimateSwap(params: EstimateSwapParams): Promise<SwapEstimate> {
    //first make sure the swap has no input errors
    this.isValidSwap(params)

    const [sourceInboundDetails, destinationInboundDetails] = await this.midgard.getInboundDetails([
      params.sourceAsset.chain,
      params.destinationAsset.chain,
    ])
    const sourcePool = await this.getPoolForAsset(params.sourceAsset)
    const destinationPool = (await this.getPoolForAsset(params.destinationAsset)) as LiquidityPool

    // throw errors is either pools is not found, excpet if the chain is thor, which does not have a pool
    if (params.sourceAsset.chain !== Chain.THORChain && !sourcePool)
      throw Error(`No liquidity pool exists for: ${assetToString(params.sourceAsset)}`)
    if (params.sourceAsset.chain !== Chain.THORChain && !destinationPool)
      throw Error(`No liquidity pool exists for: ${assetToString(params.destinationAsset)}`)

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
    // ---------------- Work out total Wait Time for Swap ---------------------- /
    if (swapEstimate.canSwap) {
      const confCountTime = (await this.confCounting(params.destinationAsset, swapEstimate.netOutput)) as number
      const outboundDelay = (await this.outboundDelay(
        destinationPool,
        params.destinationAsset,
        swapEstimate.netOutput,
      )) as number

      let waitTime: number
      // Find the biggest delay for the outbound Tx
      if (confCountTime > outboundDelay) {
        waitTime = confCountTime
      } else {
        waitTime = outboundDelay
      }
      // Add the Tx in Time
      swapEstimate.waitTime = (waitTime + (await this.confCounting(params.sourceAsset, params.inputAmount))) as number
      console.log(`WaitTime is: ${swapEstimate.waitTime.toString}`)
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

  /**
   * Works out how long an outbound Tx will be held by THORChain before sending.
   *
   * Needs to be tested
   *
   * @param asset
   * @param outBoundAmount
   * @returns
   */

  public async outboundDelay(liquidtyPool: LiquidityPool, asset: Asset, outboundAmount: BaseAmount): Promise<number> {
    //Get the Mimir values
    // want to do something like this in THORChainAMM Class

    // TO Do:
    // Require Midgard Class update to do
    //this.midgard.getConstantValueByName(string)
    //this.midgard.getMimirValueByName(string)

    const minTxOutVolumeThreshold = new BigNumber(1000) // RUNE
    const maxTxOutOffset = 720 //max blocks an outbound can be delayed
    let txOutDelayRate: BigNumber = new BigNumber(25) // current delay rate
    const thorChainblocktime = 6

    const runeValue: BaseAmount = liquidtyPool.getValueInRUNE(asset, outboundAmount)
    if (runeValue.lt(minTxOutVolumeThreshold)) {
      return thorChainblocktime
    }
    //https://midgard.thorswap.net/v2/thorchain/queue) "scheduled_outbound_value" // Rune value in the outbound queue
    const getScheduledOutboundValue = await this.midgard.getScheduledOutboundValue()
    // Add outboundAmount in RUNE to the oubound queue
    const sumValue = runeValue.plus(getScheduledOutboundValue)

    // reduce delay rate relative to the total scheduled value. In high volume
    // scenarios, this causes the network to send outbound transactions slower,
    // giving the community & NOs time to analyze and react. In an attack
    // scenario, the attacker is likely going to move as much value as possible
    // (as we've seen in the past). The act of doing this will slow down their
    // own transaction(s), reducing the attack's effectiveness.
    // txOutDelayRate -= sumValue / minTxOutVolumeThreshold
    txOutDelayRate = txOutDelayRate.minus(sumValue.amount()).dividedBy(minTxOutVolumeThreshold)

    // calculate the minimum number of blocks in the future the txn has to be
    let minBlocks = runeValue.div(txOutDelayRate).amount()

    if (minBlocks.isGreaterThan(maxTxOutOffset)) {
      minBlocks = new BigNumber(maxTxOutOffset)
    } else {
      minBlocks = minBlocks.times(new BigNumber(thorChainblocktime))
    }
    return minBlocks.toNumber()
  }

  /**
   * Finds the required confCount required for an inbound or outbound Tx to THORChain
   *
   * Finds the gas asset of the given asset (e.g. BUSD is on BNB), finds the value of asset in Gas Asset then finds the required conformation count.
   * ConfCount is then times by 6 seconds.
   *
   * @param Assset - asset of the outbound amount.
   * @param amount - the amount of asset (any asset).
   * @returns time in seconds before a Tx is confirmed by THORChain
   */
  async confCounting(asset: Asset, amount: BaseAmount): Promise<number> {
    let amountInGasAsset
    // If it is Native RUNE
    if (eqAsset(AssetRuneNative, asset)) {
      amountInGasAsset = baseToAsset(amount)
    } else {
      // get the pool for the asset being sent
      const amountPool = (await this.getPoolForAsset(asset)) as LiquidityPool

      // Find the amount in RUNE
      const amountInRUNE = amountPool.getValueInRUNE(asset, amount) as BaseAmount

      // find the gasAsset for the asset and convert the amountInRUNE into amountInGasAsset
      const chainGasAsset = this.getChainAsset(asset.chain) as Asset
      const gasChainPool = (await this.getPoolForAsset(chainGasAsset)) as LiquidityPool
      amountInGasAsset = gasChainPool.currentPriceInAsset.times(baseToAsset(amountInRUNE).amount())
    }

    // TO Do:
    // ============== Const that need to be added for this to work.  Made up values to get it to work
    // const blockReward = asset.chain.blockReward // need a constant here or in Chain Client
    // const blockTime = asset.chain.blockTime // need a constant here or in Chain Client

    const btcBlockTime = new BigNumber(600) // 600 seconds =  10 mins
    const btcBlockReward = new BigNumber(6.25)
    //=========================================================================================

    // requiredConfs = ceil (inputAmount in Asset / BlockReward for the chain)
    const requiredConfs = new BigNumber(amountInGasAsset.div(btcBlockReward).amount(), BigNumber.ROUND_CEIL)

    // returns (requiredConfs * chainBlockTime)
    return requiredConfs.times(btcBlockTime).toNumber()
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
   * return the chain for a given Asset This method should live somewhere else.
   * @param chain
   * @returns the gas asset type for the given chain
   */
  getChainAsset = (chain: Chain): Asset => {
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
        throw Error('Unknown chains')
    }
  }
}
