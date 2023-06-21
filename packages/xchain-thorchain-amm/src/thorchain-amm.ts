import {
  AddliquidityPosition,
  CryptoAmount,
  EstimateAddLP,
  EstimateAddSaver,
  EstimateWithdrawLP,
  EstimateWithdrawSaver,
  LoanCloseParams,
  LoanCloseQuote,
  LoanOpenParams,
  LoanOpenQuote,
  QuoteSwapParams,
  SaversPosition,
  SaversWithdraw,
  ThorchainQuery,
  TxDetails,
  WithdrawLiquidityPosition,
  getSaver,
} from '@xchainjs/xchain-thorchain-query'

import { TxSubmitted } from './types'
import { Wallet } from './wallet'

const defaultQuery = new ThorchainQuery()

export type AmmEstimateSwapParams = QuoteSwapParams & {
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
    fromAsset,
    amount,
    fromAddress,
    destinationAsset,
    destinationAddress,
    affiliateAddress = '',
    interfaceID = `555`,
    affiliateBps = 0,
    toleranceBps,
    wallet,
    walletIndex,
  }: AmmEstimateSwapParams): Promise<TxDetails> {
    let errors: string[] = []
    if (wallet) {
      const params = {
        input: amount,
        destinationAsset,
        destinationAddress,
        memo: '',
        waitTimeSeconds: 100,
        walletIndex,
      }
      errors = await wallet.validateSwap(params)
    }
    const estimate = await this.thorchainQuery.quoteSwap({
      fromAsset,
      amount,
      fromAddress,
      destinationAsset,
      destinationAddress,
      affiliateAddress,
      interfaceID,
      affiliateBps,
      toleranceBps,
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
    const txDetails = await this.thorchainQuery.quoteSwap(params)
    if (!txDetails.txEstimate.canSwap) {
      throw Error(txDetails.txEstimate.errors.join('\n'))
    }
    return await wallet.executeSwap({
      input: params.amount,
      destinationAsset: params.destinationAsset,
      destinationAddress: params.destinationAddress,
      memo: txDetails.memo,
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
   * @param addAssetAmount
   * @returns
   */
  public async estimateAddSaver(addAssetAmount: CryptoAmount): Promise<EstimateAddSaver> {
    return await this.thorchainQuery.estimateAddSaver(addAssetAmount)
  }
  /**
   *
   * @param withdrawParams
   * @returns
   */
  public async estimateWithdrawSaver(withdrawParams: SaversWithdraw): Promise<EstimateWithdrawSaver> {
    return await this.thorchainQuery.estimateWithdrawSaver(withdrawParams)
  }
  /**
   *
   * @param getsaver
   * @returns
   */
  public async getSaverPosition(getsaver: getSaver): Promise<SaversPosition> {
    return await this.thorchainQuery.getSaverPosition(getsaver)
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
    return await wallet.addSavers(addAssetAmount, addEstimate.memo, addEstimate.toAddress)
  }

  /**
   *
   * @param wallet - wallet to execute the transaction
   * @param withdrawParams - params needed for withdraw
   * @returns
   */
  public async withdrawSaver(wallet: Wallet, withdrawParams: SaversWithdraw): Promise<TxSubmitted> {
    const withdrawEstimate = await this.thorchainQuery.estimateWithdrawSaver(withdrawParams)
    if (withdrawEstimate.errors.length > 0) throw Error(`${withdrawEstimate.errors}`)
    return await wallet.withdrawSavers(withdrawEstimate.dustAmount, withdrawEstimate.memo, withdrawEstimate.toAddress)
  }

  /**
   *
   * @param loanOpenParams
   * @returns
   */
  public async getLoanQuoteOpen(loanOpenParams: LoanOpenParams): Promise<LoanOpenQuote> {
    return await this.thorchainQuery.getLoanQuoteOpen(loanOpenParams)
  }

  /**
   *
   * @param loanCloseParams
   * @returns
   */
  public async getLoanQuoteClose(loanCloseParams: LoanCloseParams): Promise<LoanCloseQuote> {
    return await this.thorchainQuery.getLoanQuoteClose(loanCloseParams)
  }

  /**
   *
   * @param wallet - wallet needed to execute transaction
   * @param loanOpenParams - params needed to open the loan
   * @returns - submitted tx
   */
  public async addLoan(wallet: Wallet, loanOpenParams: LoanOpenParams): Promise<TxSubmitted> {
    const loanOpen = await this.thorchainQuery.getLoanQuoteOpen(loanOpenParams)
    if (loanOpen.errors.length > 0) throw Error(`${loanOpen.errors}`)
    return await wallet.loanOpen({
      memo: `${loanOpen.memo}`,
      amount: loanOpenParams.amount,
      toAddress: `${loanOpen.inboundAddress}`,
    })
  }
  /**
   *
   * @param wallet - wallet to execute the transaction
   * @param loanCloseParams - params needed for withdrawing the loan
   * @returns
   */
  public async withdrawLoan(wallet: Wallet, loanCloseParams: LoanCloseParams): Promise<TxSubmitted> {
    const withdrawLoan = await this.thorchainQuery.getLoanQuoteClose(loanCloseParams)
    if (withdrawLoan.errors.length > 0) throw Error(`${withdrawLoan.errors}`)
    return await wallet.loanClose({
      memo: `${withdrawLoan.memo}`,
      amount: loanCloseParams.amount,
      toAddress: `${withdrawLoan.inboundAddress}`,
    })
  }
}
