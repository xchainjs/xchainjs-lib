import { Int } from '@terra-money/terra.js'
import { Network } from '@xchainjs/xchain-client'
import { Configuration, MidgardApi } from '@xchainjs/xchain-midgard'
import { isAssetRuneNative } from '@xchainjs/xchain-thorchain/lib'
import { Asset, AssetBTC, AssetETH, BaseAmount, Chain, assetToString, baseAmount, eqAsset } from '@xchainjs/xchain-util'
import BigNumber from 'bignumber.js'

import { LiquidityPool } from './LiquidityPool'
import { EstimateSwapParams, PoolCache, SwapEstimate, SwapOutput, ThorchainAMMConfig, TotalFees } from './types'
import { getInboundDetails } from './utils/midgard'
import { getDoubleSwap, getSingleSwap } from './utils/swap'

const defaultThorchainAMMConfig: Record<Network, ThorchainAMMConfig> = {
  mainnet: {
    expirePoolCacheMillis: 6000,
    midgardBaseUrl: 'https://midgard.thorchain.info/',
  },
  stagenet: {
    expirePoolCacheMillis: 6000,
    midgardBaseUrl: 'https://stagenet-midgard.ninerealms.com/',
  },
  testnet: {
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
    this.refereshPoolCache()
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
    let affiliateFeeAmount: BaseAmount
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
    affiliateFeeAmount = inputNetAmount.times(params.affiliateFee)
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
      if (liquidityPool.isAvailable == false) {
        throw new Error(`Liquidity Pool not active`)
      }
      swapOutput = getSingleSwap(params.inputAmount, liquidityPool.poolDate, false)

      if (swapOutput.slip >= params.slipLimit) throw new Error(`Slip to High!`) // just an example
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
      if (liquidityPool.isAvailable == false) {
        throw new Error(`Liquidity Pool not active`)
      }
      swapOutput = getSingleSwap(params.inputAmount, liquidityPool.poolDate, true)

      if (swapOutput.slip >= params.slipLimit) throw new Error(`Slip to High!`) // just an example
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
      swapOutput = getDoubleSwap(params.inputAmount, liquidityPool1.poolDate, liquidityPool2.poolData)
      if (swapOutput.slip >= params.slipLimit) throw new Error(`Slip to High!`) // just an example
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

  async getPoolCache(): Promise<PoolCache | undefined> {
    const millisSinceLastRefeshed = Date.now() - (this.poolCache?.lastRefreshed || 0)
    if (millisSinceLastRefeshed > this.config.expirePoolCacheMillis) {
      await this.refereshPoolCache()
    }
    return this.poolCache
  }

  private async refereshPoolCache(): Promise<void> {
    try {
      const pools = (await this.midgardApi.getPools()).data
      if (pools) {
        const lps = pools.map((pool) => new LiquidityPool(pool))
        this.poolCache = {
          lastRefreshed: Date.now(),
          pools: lps,
        }
        console.log('updated pool cache')
      }
    } catch (error) {
      console.error(error)
    }
  }
}
