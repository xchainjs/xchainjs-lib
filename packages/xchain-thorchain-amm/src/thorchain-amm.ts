import {
  AddliquidityPosition,
  CryptoAmount,
  EstimateAddLP,
  EstimateSwapParams,
  EstimateWithdrawLP,
  SaversWithdraw,
  ThorchainQuery,
  TxDetails,
  WithdrawLiquidityPosition,
} from '@xchainjs/xchain-thorchain-query'

import { TxSubmitted } from './types'
import { Wallet } from './wallet'

const defaultQuery = new ThorchainQuery()

export type AmmEstimateSwapParams = EstimateSwapParams & {
  wallet: Wallet
  walletIndex: number
}
/**
 * THORChain Class for interacting with THORChain.
 * Recommended main class to use for swapping with THORChain
 * Has access to Midgard and THORNode data
 */
export class ThorchainAMM {
  private thorchainQuery: ThorchainQuery

  /**
   * Contructor to create a ThorchainAMM
   *
   * @param thorchainQuery - an instance of the ThorchainQuery
   * @returns ThorchainAMM
   */
  constructor(thorchainQuery = defaultQuery) {
    this.thorchainQuery = thorchainQuery
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
    interfaceID = `555`,
    affiliateFeeBasisPoints = 0,
    slipLimit,
    wallet,
    walletIndex,
  }: AmmEstimateSwapParams): Promise<TxDetails> {
    let errors: string[] = []
    if (wallet) {
      const params = {
        input,
        destinationAsset,
        destinationAddress,
        memo: '',
        waitTimeSeconds: 100,
        walletIndex,
      }
      errors = await wallet.validateSwap(params)
    }
    const estimate = await this.thorchainQuery.estimateSwap({
      input,
      destinationAsset,
      destinationAddress,
      affiliateAddress,
      interfaceID,
      affiliateFeeBasisPoints,
      slipLimit,
    })
    estimate.txEstimate.errors.push(...errors)
    estimate.txEstimate.canSwap = errors.length == 0
    return estimate
  }

  /**
   * Conducts a swap with the given inputs. Should be called after estimateSwap() to ensure the swap is valid
   *
   * @param wallet - wallet to use
   * @param params - swap params
   * @returns {SwapSubmitted} - Tx Hash, URL of BlockExplorer and expected wait time.
   */
  public async doSwap(wallet: Wallet, params: AmmEstimateSwapParams): Promise<TxSubmitted> {
    // Thorchain-query call satisfies the data needed for executeSwap to be called.
    const txDetails = await this.thorchainQuery.estimateSwap(params)
    if (!txDetails.txEstimate.canSwap) {
      throw Error(txDetails.txEstimate.errors.join('\n'))
    }
    return await wallet.executeSwap({
      input: params.input,
      destinationAsset: params.destinationAsset,
      destinationAddress: params.destinationAddress,
      memo: txDetails.memo,
      waitTimeSeconds: txDetails.txEstimate.waitTimeSeconds,
      walletIndex: params.walletIndex,
      feeOption: params.feeOption,
    })
  }

  /**
   * Wraps estimate from thorchain query
   * @param params - estimate add liquidity
   * @returns - Estimate add lp object
   */
  public async estimateAddLiquidity(params: AddliquidityPosition): Promise<EstimateAddLP> {
    return await this.thorchainQuery.estimateAddLP(params)
  }

  /**
   * Wraps estimate withdraw from thorchain query
   * @param params - estimate withdraw liquidity
   * @returns - Estimate withdraw lp object
   */
  public async estimateWithdrawLiquidity(params: WithdrawLiquidityPosition): Promise<EstimateWithdrawLP> {
    return await this.thorchainQuery.estimateWithdrawLP(params)
  }

  /**
   *
   * @param wallet - wallet class
   * @param params - liquidity parameters
   * @returns
   */
  public async addLiquidityPosition(wallet: Wallet, params: AddliquidityPosition): Promise<TxSubmitted[]> {
    // Check amounts are greater than fees and use return estimated wait
    const checkLPAdd = await this.thorchainQuery.estimateAddLP(params)
    if (!checkLPAdd.canAdd) throw Error(`${checkLPAdd.errors}`)
    return await wallet.addLiquidity({
      asset: params.asset,
      rune: params.rune,
      waitTimeSeconds: checkLPAdd.estimatedWaitSeconds,
      assetPool: checkLPAdd.assetPool,
    })
  }
  /**
   *
   * @param params - liquidity parameters
   * @param wallet - wallet needed to perform tx
   * @return
   */
  public async withdrawLiquidityPosition(wallet: Wallet, params: WithdrawLiquidityPosition): Promise<TxSubmitted[]> {
    // Caution Dust Limits: BTC,BCH,LTC chains 10k sats; DOGE 1m Sats; ETH 0 wei; THOR 0 RUNE.
    const withdrawParams = await this.thorchainQuery.estimateWithdrawLP(params)
    return await wallet.withdrawLiquidity({
      assetFee: withdrawParams.inbound.fees.asset,
      runeFee: withdrawParams.inbound.fees.rune,
      waitTimeSeconds: withdrawParams.estimatedWaitSeconds,
      percentage: params.percentage,
      assetPool: withdrawParams.assetPool,
      assetAddress: withdrawParams.assetAddress,
      runeAddress: withdrawParams.runeAddress,
    })
  }

  /**
   *
   * @param wallet - wallet needed to execute tx
   * @param addAssetAmount - asset amount being added to savers
   * @returns - submitted tx
   */
  public async addSaver(wallet: Wallet, addAssetAmount: CryptoAmount): Promise<TxSubmitted> {
    const addEstimate = await this.thorchainQuery.estimateAddSaver(addAssetAmount)
    if (!addEstimate.canAddSaver) throw Error(`Cannot add to savers`)
    return await wallet.addSavers(
      addEstimate.assetAmount,
      addEstimate.memo,
      addEstimate.toAddress,
      addEstimate.estimatedWaitTime,
    )
  }

  /**
   *
   * @param wallet - wallet to execute the transaction
   * @param withdrawParams - params needed for withdraw
   * @returns
   */
  public async withdrawSaver(wallet: Wallet, withdrawParams: SaversWithdraw): Promise<TxSubmitted> {
    const withdrawEstimate = await this.thorchainQuery.estimateWithdrawSaver(withdrawParams)
    return await wallet.withdrawSavers(
      withdrawEstimate.dustAmount,
      withdrawEstimate.memo,
      withdrawEstimate.toAddress,
      withdrawEstimate.estimatedWaitTime,
    )
  }
}
