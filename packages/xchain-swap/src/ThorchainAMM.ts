import { Int } from '@terra-money/terra.js'
import { Network } from '@xchainjs/xchain-client'
import { Configuration, MidgardApi } from '@xchainjs/xchain-midgard'
import { isAssetRuneNative } from '@xchainjs/xchain-thorchain/lib'
import {
  Asset,
  AssetBTC,
  AssetETH,
  AssetRuneNative,
  BaseAmount,
  Chain,
  assetToString,
  baseAmount,
  eqAsset,
} from '@xchainjs/xchain-util'
import BigNumber from 'bignumber.js'

import { LiquidityPool } from './LiquidityPool'
import { EstimateSwapParams, PoolCache, SwapEstimate, SwapOutput, ThorchainAMMConfig, TotalFees } from './types'
import { getInboundDetails } from './utils/midgard'
import { getDoubleSwap, getSingleSwap } from './utils/swap'

const defaultThorchainAMMConfig: Record<Network, ThorchainAMMConfig> = {
  mainnet: {
    waitMillisBetweenFetchFailures: 3000,
    expirePoolCacheMillis: 6000,
    midgardBaseUrl: 'https://midgard.thorchain.info/',
  },
  stagenet: {
    waitMillisBetweenFetchFailures: 3000,
    expirePoolCacheMillis: 6000,
    midgardBaseUrl: 'https://stagenet-midgard.ninerealms.com/',
  },
  testnet: {
    waitMillisBetweenFetchFailures: 3000,
    expirePoolCacheMillis: 6000,
    midgardBaseUrl: 'https://testnet.midgard.thorchain.info/',
  },
}

export class ThorchainAMM {
  private midgardApi: MidgardApi
  private poolCache: PoolCache | undefined
  private network: Network
  private config: ThorchainAMMConfig

  constructor(network: Network) {
    this.network = network
    this.config = defaultThorchainAMMConfig[this.network]
    this.midgardApi = new MidgardApi(new Configuration({ basePath: this.config.midgardBaseUrl }))
    //initialize the cache
    this.refereshPoolCache()
  }
  private async validateSwapEstimate(params: EstimateSwapParams) {
    const pools = await this.getPools()
    const sourceAssetString = assetToString(params.sourceAsset)
    const sourcePool = pools[sourceAssetString]
    const destinationAssetString = assetToString(params.destinationAsset)
    const destinationPool = pools[destinationAssetString]

    if (eqAsset(params.sourceAsset, params.destinationAsset))
      throw Error(`sourceAsset and destinationAsset cannot be the same`)

    if (params.inputAmount.lte(0)) throw Error('inputAmount must be greater than 0')

    if (params.affiliateFeePercent && (params.affiliateFeePercent < 0 || params.affiliateFeePercent > 0.1))
      throw Error(`affiliateFee must be between 0 and 1000`)

    if (!eqAsset(params.sourceAsset, AssetRuneNative) && !sourcePool.isAvailable())
      throw Error(`sourceAsset ${sourceAssetString} does not have a liquidity pool`)

    if (!eqAsset(params.destinationAsset, AssetRuneNative) && !destinationPool.isAvailable())
      throw Error(`destinationAsset ${destinationAssetString} does not have a liquidity pool`)

    // TODO implement the following
    //  If valueofRUNE(inbound fee + outbound fee) > valueOfRUNE(inboundAsset)
    //   return "insufficent inbound asset amount "

    //   If (sourceAsset.chainType != RUNE)
    //      sourceInboundDetails = getInboundDetails(Mainnet, destinationAsset.chainType).isHalted
    //          If (inboundDetails.isHalted)
    //           return "source chain halted"

    //  If (destinationAsset.chainType != RUNE)
    //      destinationInboundDetails = getInboundDetails(Mainnet, sourceAsset.chainType).isHalted
    //          if (destinationInboundDetails.isHalted)
    //              return "Desitnation chain halted"

    //  Return "Success"
  }
  /**
   *
   * @param params - amount to swap

   * @returns The SwapEstimate
   */
  async estimateSwap(params: EstimateSwapParams): Promise<SwapEstimate> {
    console.log(params)
    let inboundFee: BaseAmount
    let outboundFee: BaseAmount
    let isHalted = false
    let affiliateFeeAmount: BaseAmount = baseAmount(0)
    let isDoubleSwap: boolean
    let swapOutput: SwapOutput

    if (params.sourceAsset.chain === Chain.THORChain) {
      //flat rune fee
      inboundFee = baseAmount(2000000)
      outboundFee = inboundFee.times(3)
    } else {
      //   check if the chain for that asset is halted and gets the fees
      const sourceAssetInboundDetails = await getInboundDetails(params.sourceAsset.chain)
      isHalted = sourceAssetInboundDetails.haltedChain || sourceAssetInboundDetails.haltedTrading
      inboundFee = this.calcInboundFee(params.sourceAsset, sourceAssetInboundDetails.gas_rate)
      // if the sourceAsset is BNB, then check the Binance Chain. Will need a asset to chain map or something.
      // if the source or desingation asset is halted, return an error.
      if (isHalted == true) {
        throw new Error(`Halted chain for ${assetToString(params.sourceAsset)}`)
      }
      outboundFee = inboundFee.times(3)
    }
    // // ---------- Remove Fees from inbound before doing the swap -----------
    //   take the inbound fee away from the inbound amount
    let inputNetAmount = params.inputAmount.minus(inboundFee) // are of the same type so this works.

    //   // remove any affiliateFee. netInput * affiliateFee (%age) of the desitnaiton asset type
    affiliateFeeAmount = inputNetAmount.times(params.affiliateFeePercent || 0)
    // remove the affiliate fee from the input.
    inputNetAmount = inputNetAmount.minus(affiliateFeeAmount)
    // now netInputAmount should be inputAmount.minus(inboundFee + affiliateFeeAmount)

    //   /// ------- Doing the swap ------------------------
    this.refereshPoolCache()
    let liquidityPool: LiquidityPool

    if (isAssetRuneNative(params.sourceAsset) == true) {
      // cannot be double swap and destination HAS to be asset.
      // const poolName = params.destinationAsset.chain + "." + params.sourceAsset.ticker // e.g. BTC.BTC
      liquidityPool = this.poolCache?.pools.find((obj) => {
        //  how to find a pool with a given asset?
        return obj.asset === params.destinationAsset // get the pool by name?
      })
      if (liquidityPool.isAvailable() == false) {
        throw new Error(`Liquidity Pool not active`)
      }
      swapOutput = getSingleSwap(params.inputAmount, liquidityPool, false)

      if (swapOutput.slip >= params.slipLimit) throw new Error(`Slip too High!`) // just an example
    }
    // is it a double swap? if source and destination != rune then its a double swap.
    isDoubleSwap = false
    if (isAssetRuneNative(params.sourceAsset) == false && isAssetRuneNative(params.destinationAsset) == false) {
      isDoubleSwap = true
    }
    if (isDoubleSwap == false) {
      // It is a single swap and must be asset to RUNE swap. Repeat the above but change the direction of the swap.
      liquidityPool = this.poolCache?.pools.find((obj) => {
        //  how to find a pool with a given asset?
        return obj.asset === params.sourceAsset // get the pool by name?
      })
      if (liquidityPool.isAvailable() == false) {
        throw new Error(`Liquidity Pool not active`)
      }
      swapOutput = getSingleSwap(params.inputAmount, liquidityPool, true)

      if (swapOutput.slip >= params.slipLimit) throw new Error(`Slip too High!`) // just an example
    } else {
      // process a double swap
      // Get source asset pool
      const liquidityPool1 = this.poolCache?.pools.find((obj) => {
        //  how to find a pool with a given asset?
        return obj.asset === params.sourceAsset // get the pool by name?
      })
      if (liquidityPool1.isAvailable == false) {
        throw new Error(`Liquidity Pool not active`)
      }
      // Get desitnation asset pool
      const liquidityPool2 = this.poolCache?.pools.find((obj) => {
        //  how to find a pool with a given asset?
        return obj.asset === params.destinationAsset // get the pool by name?
      })
      if (liquidityPool2.isAvailable == false) {
        throw new Error(`Liquidity Pool not active`)
      }
      swapOutput = getDoubleSwap(params.inputAmount, liquidityPool1, liquidityPool2)
      if (swapOutput.slip >= params.slipLimit) throw new Error(`Slip too High!`) // just an example
    }
    // ---------------- Remove Outbound Fee ---------------------- / /////
    let netOutput: BaseAmount
    netOutput = swapOutput.output.minus(outboundFee) // swap outbout and outbound fee should be in the same type also

    const totalFees: TotalFees = {
      inboundFee: inboundFee,
      swapFee: swapOutput.swapFee,
      outboundFee: outboundFee,
      affiliateFee: affiliateFeeAmount,
    }
    const SwapEstimate = {
      totalFees: totalFees,
      slipPercentage: swapOutput.slip,
      netOutput: netOutput,
      isHalted: isHalted,
    }
    return SwapEstimate
  }

  public doSwap(
    params: EstimateSwapParams,
    destinationAddress: string,
    affiliateAddress: string,
    interfaceID: Int,
  ): string {
    let limPercentage = new BigNumber(1)
    let lim = new BigNumber(1)
    let memo: string
    let inboundFee
    let outboundFee
    let isHalted

    if (params.sourceAsset.chain === Chain.THORChain) {
      //flat rune fee
      inboundFee = baseAmount(2000000)
      outboundFee = inboundFee.times(3)
    } else {
      //   check if the chain for that asset is halted and gets the fees
      const sourceAssetInboundDetails = await getInboundDetails(params.sourceAsset.chain)
      isHalted = sourceAssetInboundDetails.haltedChain || sourceAssetInboundDetails.haltedTrading
      inboundFee = this.calcInboundFee(params.sourceAsset, sourceAssetInboundDetails.gas_rate)
      // if the sourceAsset is BNB, then check the Binance Chain. Will need a asset to chain map or something.
      // if the source or desingation asset is halted, return an error.
      if (isHalted == true) {
        throw new Error(`Halted chain for ${assetToString(params.sourceAsset)}`)
      }
      outboundFee = inboundFee.times(3)
    }

    limPercentage = lim.minus(params.slipLimit)
    lim = params.inputAmount.times(limPercentage) // need to get output value of this.
    // need to trip lim and add interfaceID

    //   // remove any affiliateFee. netInput * affiliateFee (%age) of the desitnaiton asset type
    const affiliateFeeAmount = inputNetAmount.times(params.affiliateFee)

    memo = `:${params.destinationAsset.chain.toString}.${params.destinationAsset.symbol}:${destinationAddress}:${lim}:${affiliateAddress}:${affiliateFeeAmount}`

    if (params.destinationAsset == AssetBTC && memo.length > 80) {
      // if memo length is too long for BTC, need to trim it
      memo = `:${params.destinationAsset.chain.toString}.${params.destinationAsset.symbol}:${destinationAddress}`
    }

    // send transaction from the wallet using the transfer function. Will need to set it to the asgard vault.
    // TODO estimates wait time.
    const TxId: string = params.sourceAsset.Transfer()
    return TxId
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
    }
    throw new Error(`could not calculate inbound fee for ${sourceAsset.chain}`)
  }

  async getPools(attempts?: number): Promise<Record<string, LiquidityPool>> {
    const millisSinceLastRefeshed = Date.now() - (this.poolCache?.lastRefreshed || 0)
    if (millisSinceLastRefeshed > this.config.expirePoolCacheMillis) {
      try {
        await this.refereshPoolCache()
      } catch (error) {
        if (attempts && attempts < 5) {
          // try up to 5 times
          setTimeout(this.getPools.bind(this), this.config.waitMillisBetweenFetchFailures, [attempts++])
        }
      }
    }
    if (this.poolCache) {
      return this.poolCache?.pools
    } else {
      throw Error(`Could not refresh Pools after ${attempts} attempts`)
    }
  }

  /**
   * do not call refereshPoolCache() directly, call getPools() instead
   * which will refresh the cache if it's expired
   */
  private async refereshPoolCache(): Promise<void> {
    const pools = (await this.midgardApi.getPools()).data
    const poolMap: Record<string, LiquidityPool> = {}
    if (pools) {
      for (const pool of pools) {
        poolMap[pool.asset] = new LiquidityPool(pool)
      }
      this.poolCache = {
        lastRefreshed: Date.now(),
        pools: poolMap,
      }
      console.log('updated pool cache')
    }
  }
}
