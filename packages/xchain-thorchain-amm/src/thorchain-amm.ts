import {
  AddliquidityPosition,
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
import { CryptoAmount } from '@xchainjs/xchain-util'

import { TxSubmitted } from './types'
import { Wallet } from './wallet'

// Create a default ThorchainQuery instance
const defaultQuery = new ThorchainQuery()
// Define additional parameters for estimating swaps with AMM
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
   * Contructor to create a ThorchainAMM instance
   *
   * @param thorchainQuery - an instance of the ThorchainQuery
   * @returns ThorchainAMM
   */
  constructor(thorchainQuery = defaultQuery) {
    this.thorchainQuery = thorchainQuery
  }

  /**
   * * Provides an estimate for a swap based on the given swap details.
   * Checks the parameters for errors before attempting to retrieve the estimate.
   * Utilizes current pool data to calculate inbound and outbound fees, affiliate fees,
   * and the expected wait time for the swap (inbound and outbound).
   * @param params Parameters for the swap, including the amount to swap.

   * @returns The estimated swap details.
   */
  public async estimateSwap({
    fromAsset,
    amount,
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
    // If a wallet is provided, validate the swap parameters
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
    // Get the swap estimate from the ThorchainQuery instance
    const estimate = await this.thorchainQuery.quoteSwap({
      fromAsset,
      amount,
      destinationAsset,
      destinationAddress,
      affiliateAddress,
      interfaceID,
      affiliateBps,
      toleranceBps,
    })
    // Add any validation errors to the estimate
    estimate.txEstimate.errors.push(...errors)
    estimate.txEstimate.canSwap = errors.length == 0
    return estimate
  }

  /**
   * Conducts a swap with the given inputs. This method should be called after estimateSwap() to ensure the swap is valid.
   *
   * @param wallet - The wallet to use for the swap.
   * @param params - The swap parameters.
   * @returns {SwapSubmitted} - The transaction hash, URL of BlockExplorer, and expected wait time.
   */
  public async doSwap(wallet: Wallet, params: AmmEstimateSwapParams): Promise<TxSubmitted> {
    // Retrieve swap details from ThorchainQuery to ensure validity
    const txDetails = await this.thorchainQuery.quoteSwap(params)
    if (!txDetails.txEstimate.canSwap) {
      throw Error(txDetails.txEstimate.errors.join('\n'))
    }
    // Execute the swap using the provided wallet
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
   * Wraps the estimate from ThorchainQuery for adding liquidity.
   * @param params - The parameters for estimating adding liquidity.
   * @returns - The estimated liquidity addition object.
   */
  public async estimateAddLiquidity(params: AddliquidityPosition): Promise<EstimateAddLP> {
    return await this.thorchainQuery.estimateAddLP(params)
  }

  /**
   * Wraps the estimate from ThorchainQuery for withdrawing liquidity.
   * @param params - The parameters for estimating withdrawing liquidity.
   * @returns - The estimated liquidity withdrawal object.
   */
  public async estimateWithdrawLiquidity(params: WithdrawLiquidityPosition): Promise<EstimateWithdrawLP> {
    return await this.thorchainQuery.estimateWithdrawLP(params)
  }

  /**
   * If there is no existing liquidity position, it is created automatically.
   * @param wallet - Wallet class
   * @param params - Liquidity parameter
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
   * Withdraws liquidity from a position.
   * @param params - The wallet to perform the transaction.
   * @param wallet - The parameters for withdrawing liquidity.
   * @return - The array of transaction submissions.
   */
  public async withdrawLiquidityPosition(wallet: Wallet, params: WithdrawLiquidityPosition): Promise<TxSubmitted[]> {
    // Caution Dust Limits: BTC, BCH, LTC chains: 10k sats; DOGE: 1m Sats; ETH: 0 wei; THOR: 0 RUNE.
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
   * Estimates adding to a saver.
   * @param addAssetAmount The amount to add to the saver.
   * @returns The estimated addition to the saver object.
   */
  public async estimateAddSaver(addAssetAmount: CryptoAmount): Promise<EstimateAddSaver> {
    return await this.thorchainQuery.estimateAddSaver(addAssetAmount)
  }
  /**
   * Estimates withdrawing from a saver.
   * @param withdrawParams The parameters for withdrawing from the saver.
   * @returns The estimated withdrawal from the saver object.
   */
  public async estimateWithdrawSaver(withdrawParams: SaversWithdraw): Promise<EstimateWithdrawSaver> {
    return await this.thorchainQuery.estimateWithdrawSaver(withdrawParams)
  }
  /**
   * Retrieves the position of a saver.
   * @param getsaver The parameters to retrieve the saver position.
   * @returns The saver position object.
   */
  public async getSaverPosition(getsaver: getSaver): Promise<SaversPosition> {
    return await this.thorchainQuery.getSaverPosition(getsaver)
  }

  /**
   * Adds assets to a saver.
   * @param wallet - wallet needed to execute tx
   * @param addAssetAmount - The amount to add to the saver.
   * @returns - The submitted transaction.
   */
  public async addSaver(wallet: Wallet, addAssetAmount: CryptoAmount): Promise<TxSubmitted> {
    const addEstimate = await this.thorchainQuery.estimateAddSaver(addAssetAmount)
    if (!addEstimate.canAddSaver) throw Error(`Cannot add to savers`)
    return await wallet.addSavers(addAssetAmount, addEstimate.memo, addEstimate.toAddress)
  }

  /**
   * Withdraws assets from a saver.
   * @param wallet - The wallet to perform the transaction.
   * @param withdrawParams - The parameters for withdrawing from the saver.
   * @returns The submitted transaction.
   */
  public async withdrawSaver(wallet: Wallet, withdrawParams: SaversWithdraw): Promise<TxSubmitted> {
    const withdrawEstimate = await this.thorchainQuery.estimateWithdrawSaver(withdrawParams)
    if (withdrawEstimate.errors.length > 0) throw Error(`${withdrawEstimate.errors}`)
    return await wallet.withdrawSavers(withdrawEstimate.dustAmount, withdrawEstimate.memo, withdrawEstimate.toAddress)
  }

  /**
   * Retrieves a quote for opening a loan.
   * @param loanOpenParams The parameters for opening the loan.
   * @returns The quote for opening the loan.
   */
  public async getLoanQuoteOpen(loanOpenParams: LoanOpenParams): Promise<LoanOpenQuote> {
    return await this.thorchainQuery.getLoanQuoteOpen(loanOpenParams)
  }

  /**
   * Retrieves a quote for closing a loan.
   * @param loanCloseParams The parameters for closing the loan.
   * @returns The quote for closing the loan.
   */
  public async getLoanQuoteClose(loanCloseParams: LoanCloseParams): Promise<LoanCloseQuote> {
    return await this.thorchainQuery.getLoanQuoteClose(loanCloseParams)
  }

  /**
   * Opens a loan.
   * @param wallet - The wallet to perform the transaction.
   * @param loanOpenParams - The parameters for opening the loan.
   * @returns - The submitted transaction.
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
   * Withdraws assets from a loan.
   * @param wallet - The wallet to perform the transaction.
   * @param loanCloseParams - The parameters for withdrawing from the loan.
   * @returns The submitted transaction.
   */
  public async withdrawLoan(wallet: Wallet, loanCloseParams: LoanCloseParams): Promise<TxSubmitted> {
    // Retrieves the quote for closing the loan
    const withdrawLoan = await this.thorchainQuery.getLoanQuoteClose(loanCloseParams)
    // Checks if there are any errors in the quote
    if (withdrawLoan.errors.length > 0) throw Error(`${withdrawLoan.errors}`)
    // Executes the loan close transaction
    return await wallet.loanClose({
      memo: `${withdrawLoan.memo}`,
      amount: loanCloseParams.amount,
      toAddress: `${withdrawLoan.inboundAddress}`,
    })
  }

  /**
   * Retrieves all Thornames and their associated data owned by an address.
   * @param address - The address to retrieve Thornames for.
   * @returns The Thornames data.
   */
  public async getThornamesByAddress(address: string) {
    return this.thorchainQuery.thorchainCache.midgardQuery.midgardCache.midgard.getTHORNameReverseLookup(address)
  }
}
