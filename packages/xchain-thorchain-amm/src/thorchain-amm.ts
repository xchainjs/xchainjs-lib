import { Client as AvaxClient, defaultAvaxParams } from '@xchainjs/xchain-avax'
import { Client as BnbClient } from '@xchainjs/xchain-binance'
import { Client as BtcClient, defaultBTCParams as defaultBtcParams } from '@xchainjs/xchain-bitcoin'
import { Client as BchClient, defaultBchParams } from '@xchainjs/xchain-bitcoincash'
import { Client as BscClient, defaultBscParams } from '@xchainjs/xchain-bsc'
import { Network } from '@xchainjs/xchain-client'
import { Client as GaiaClient } from '@xchainjs/xchain-cosmos'
import { Client as DogeClient, defaultDogeParams } from '@xchainjs/xchain-doge'
import { Client as EthClient, defaultEthParams } from '@xchainjs/xchain-ethereum'
import { Client as LtcClient, defaultLtcParams } from '@xchainjs/xchain-litecoin'
import { Client as ThorClient, THORChain, defaultClientConfig as defaultThorParams } from '@xchainjs/xchain-thorchain'
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
import { Wallet } from '@xchainjs/xchain-wallet'

import { ThorchainAction } from './thorchain-action'
import { AddLiquidity, IsApprovedParams, TxSubmitted, WithdrawLiquidity } from './types'
import { isProtocolERC20Asset } from './utils'

/**
 * THORChain Class for interacting with THORChain.
 * Recommended main class to use for swapping with THORChain
 * Has access to Midgard and THORNode data
 */
export class ThorchainAMM {
  private thorchainQuery: ThorchainQuery
  private wallet: Wallet

  /**
   * Constructor to create a ThorchainAMM
   *
   * @param thorchainQuery - an instance of the ThorchainQuery
   * @returns ThorchainAMM
   */
  constructor(
    thorchainQuery = new ThorchainQuery(),
    wallet = new Wallet({
      BTC: new BtcClient({ ...defaultBtcParams, network: Network.Mainnet }),
      BCH: new BchClient({ ...defaultBchParams, network: Network.Mainnet }),
      LTC: new LtcClient({ ...defaultLtcParams, network: Network.Mainnet }),
      DOGE: new DogeClient({ ...defaultDogeParams, network: Network.Mainnet }),
      ETH: new EthClient({ ...defaultEthParams, network: Network.Mainnet }),
      AVAX: new AvaxClient({ ...defaultAvaxParams, network: Network.Mainnet }),
      BSC: new BscClient({ ...defaultBscParams, network: Network.Mainnet }),
      GAIA: new GaiaClient({ network: Network.Mainnet }),
      BNB: new BnbClient({ network: Network.Mainnet }),
      THOR: new ThorClient({ ...defaultThorParams, network: Network.Mainnet }),
    }),
  ) {
    this.thorchainQuery = thorchainQuery
    this.wallet = wallet
  }

  /**
   * Provides a swap estimate for the given swap detail. Will check the params for errors before trying to get the estimate.
   * Uses current pool data, works out inbound and outboud fee, affiliate fees and works out the expected wait time for the swap (in and out)
   *
   * @param params - amount to swap

   * @returns The SwapEstimate
   */
  public async estimateSwap({
    fromAddress,
    fromAsset,
    amount,
    destinationAsset,
    destinationAddress,
    affiliateAddress = '',
    affiliateBps = 0,
    toleranceBps,
  }: QuoteSwapParams): Promise<TxDetails> {
    const errors: string[] = await this.validateSwap({
      fromAddress,
      fromAsset,
      amount,
      destinationAsset,
      destinationAddress,
    })
    const estimate = await this.thorchainQuery.quoteSwap({
      fromAsset,
      amount,
      destinationAsset,
      destinationAddress,
      affiliateAddress,
      affiliateBps,
      toleranceBps,
    })
    estimate.txEstimate.errors.push(...errors)
    estimate.txEstimate.canSwap = errors.length == 0
    return estimate
  }

  /**
   * Validate swap params
   * @param {QuoteSwapParams} quoteSwapParams Swap params
   * @returns {string[]} the reasons the swap can not be done. If it is empty there are no reason to avoid the swap
   */
  public async validateSwap({
    fromAsset,
    fromAddress,
    destinationAsset,
    destinationAddress,
    amount,
    affiliateAddress,
    affiliateBps,
  }: QuoteSwapParams): Promise<string[]> {
    const errors: string[] = []

    if (destinationAddress && !this.wallet.validateAddress(destinationAsset.chain, destinationAddress)) {
      errors.push(`destinationAddress ${destinationAddress} is not a valid address`)
    }

    if (affiliateAddress) {
      const isThorAddress = this.wallet.validateAddress(THORChain, affiliateAddress)
      const isThorname = !!(await this.thorchainQuery.getThornameDetails(affiliateAddress))
      if (!(isThorAddress || isThorname))
        errors.push(`affiliateAddress ${affiliateAddress} is not a valid MAYA address`)
    }

    if (affiliateBps && (affiliateBps < 0 || affiliateBps > 10000)) {
      errors.push(`affiliateBps ${affiliateBps} out of range [0 - 10000]`)
    }

    if (isProtocolERC20Asset(fromAsset) && fromAddress) {
      const approveErrors = await this.isRouterApprovedToSpend({
        asset: fromAsset,
        address: fromAddress,
        amount,
      })
      errors.push(...approveErrors)
    }

    return errors
  }

  /**
   * Conducts a swap with the given inputs. Should be called after estimateSwap() to ensure the swap is valid
   *
   * @param wallet - wallet to use
   * @param params - swap params
   * @returns {SwapSubmitted} - Tx Hash, URL of BlockExplorer and expected wait time.
   */
  public async doSwap({
    fromAsset,
    fromAddress,
    amount,
    destinationAsset,
    destinationAddress,
    affiliateAddress,
    affiliateBps,
    toleranceBps,
  }: QuoteSwapParams): Promise<TxSubmitted> {
    // Thorchain-query call satisfies the data needed for executeSwap to be called.
    const txDetails = await this.thorchainQuery.quoteSwap({
      fromAsset,
      fromAddress,
      amount,
      destinationAsset,
      destinationAddress,
      affiliateAddress,
      affiliateBps,
      toleranceBps,
    })
    if (!txDetails.txEstimate.canSwap) {
      throw Error(txDetails.txEstimate.errors.join('\n'))
    }

    return ThorchainAction.makeAction({
      wallet: this.wallet,
      assetAmount: amount,
      memo: txDetails.memo,
      recipient: txDetails.toAddress,
    })
  }

  /**
   * Validate if the asset router is allowed to spend the asset amount in name of the address
   * @param {IsApprovedParams} isApprovedParams contains the asset and the amount the router is supposed to spend
   * int name of address
   * @returns {string[]} the reasons the router of the asset is not allowed to spend the amount. If it is empty, the asset router is allowed to spend the amount
   */
  public async isRouterApprovedToSpend({ asset, amount, address }: IsApprovedParams): Promise<string[]> {
    const errors: string[] = []

    const inboundDetails = await this.thorchainQuery.getChainInboundDetails(asset.chain)
    if (!inboundDetails.router) throw Error(`Unknown router address for ${asset.chain}`)

    const isApprovedResult = await this.wallet.isApproved(asset, amount.baseAmount, address, inboundDetails.router)

    if (!isApprovedResult) errors.push('Thorchain router has not been approved to spend this amount')

    return errors
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
   * @param params - liquidity parameters
   * @returns
   */
  public async addLiquidityPosition(params: AddliquidityPosition): Promise<TxSubmitted[]> {
    // Check amounts are greater than fees and use return estimated wait
    const checkLPAdd = await this.thorchainQuery.estimateAddLP(params)
    if (!checkLPAdd.canAdd) throw Error(`${checkLPAdd.errors}`)

    const inboundAsgard = (await this.thorchainQuery.thorchainCache.getInboundDetails())[params.asset.asset.chain]
      .address

    const addressRune = await this.wallet.getAddress(THORChain)
    const addressAsset = await this.wallet.getAddress(params.asset.asset.chain)
    // const waitTimeSeconds = params.waitTimeSeconds
    const txSubmitted: TxSubmitted[] = []

    const addLiquidity: AddLiquidity = {
      asset: params.asset,
      rune: params.rune,
      waitTimeSeconds: checkLPAdd.estimatedWaitSeconds,
      assetPool: checkLPAdd.assetPool,
    }
    // symmetrical add
    if (params.asset.assetAmount.gt(0) && params.rune.assetAmount.gt(0)) {
      txSubmitted.push(
        await ThorchainAction.makeAction({
          wallet: this.wallet,
          memo: `+:${checkLPAdd.assetPool}:${addressRune}`,
          assetAmount: addLiquidity.asset,
          recipient: inboundAsgard,
        }),
      )
      txSubmitted.push(
        await ThorchainAction.makeAction({
          wallet: this.wallet,
          memo: `+:${checkLPAdd.assetPool}:${addressAsset}`,
          assetAmount: addLiquidity.rune,
        }),
      )
      return txSubmitted
    } else if (params.asset.assetAmount.gt(0) && params.rune.assetAmount.eq(0)) {
      // asymmetrical asset only
      txSubmitted.push(
        await ThorchainAction.makeAction({
          wallet: this.wallet,
          memo: `+:${checkLPAdd.assetPool}`,
          assetAmount: addLiquidity.asset,
          recipient: inboundAsgard,
        }),
      )
      return txSubmitted
    } else {
      // asymmetrical rune only
      txSubmitted.push(
        await ThorchainAction.makeAction({
          wallet: this.wallet,
          memo: `+:${checkLPAdd.assetPool}`,
          assetAmount: addLiquidity.asset,
        }),
      )
      return txSubmitted
    }
  }

  /**
   *
   * @param wallet - wallet needed to perform tx
   * @return
   */
  public async withdrawLiquidityPosition(params: WithdrawLiquidityPosition): Promise<TxSubmitted[]> {
    // Caution Dust Limits: BTC,BCH,LTC chains 10k sats; DOGE 1m Sats; ETH 0 wei; THOR 0 RUNE.
    const withdrawParams = await this.thorchainQuery.estimateWithdrawLP(params)

    const withdrawLiquidity: WithdrawLiquidity = {
      assetFee: withdrawParams.inbound.fees.asset,
      runeFee: withdrawParams.inbound.fees.rune,
      waitTimeSeconds: withdrawParams.estimatedWaitSeconds,
      percentage: params.percentage,
      assetPool: withdrawParams.assetPool,
      assetAddress: withdrawParams.assetAddress,
      runeAddress: withdrawParams.runeAddress,
    }

    const inboundAsgard = (await this.thorchainQuery.thorchainCache.getInboundDetails())[
      withdrawLiquidity.assetFee.asset.chain
    ].address

    // const waitTimeSeconds = params.waitTimeSeconds
    const basisPoints = (withdrawLiquidity.percentage * 100).toFixed() // convert to basis points
    const txSubmitted: TxSubmitted[] = []

    if (withdrawLiquidity.assetAddress && withdrawLiquidity.runeAddress) {
      txSubmitted.push(
        await ThorchainAction.makeAction({
          wallet: this.wallet,
          memo: `-:${withdrawLiquidity.assetPool}:${basisPoints}`,
          assetAmount: withdrawLiquidity.assetFee,
          recipient: inboundAsgard,
        }),
      )

      txSubmitted.push(
        await ThorchainAction.makeAction({
          wallet: this.wallet,
          memo: `-:${withdrawLiquidity.assetPool}:${basisPoints}`,
          assetAmount: withdrawLiquidity.runeFee,
        }),
      )

      return txSubmitted
    } else if (withdrawLiquidity.assetAddress && !withdrawLiquidity.runeAddress) {
      // asymmetrical asset only
      txSubmitted.push(
        await ThorchainAction.makeAction({
          wallet: this.wallet,
          memo: `-:${withdrawLiquidity.assetPool}:${basisPoints}`,
          assetAmount: withdrawLiquidity.assetFee,
          recipient: inboundAsgard,
        }),
      )

      txSubmitted.push(
        await ThorchainAction.makeAction({
          wallet: this.wallet,
          memo: `-:${withdrawLiquidity.assetPool}:${basisPoints}`,
          assetAmount: withdrawLiquidity.runeFee,
        }),
      )
      return txSubmitted
    } else {
      // asymmetrical rune only
      txSubmitted.push(
        await ThorchainAction.makeAction({
          wallet: this.wallet,
          memo: `-:${withdrawLiquidity.assetPool}:${basisPoints}`,
          assetAmount: withdrawLiquidity.runeFee,
        }),
      )
      return txSubmitted
    }
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
  public async addSaver(addAssetAmount: CryptoAmount): Promise<TxSubmitted> {
    const addEstimate = await this.thorchainQuery.estimateAddSaver(addAssetAmount)
    if (!addEstimate.canAddSaver) throw Error(`Cannot add to savers`)

    return ThorchainAction.makeAction({
      wallet: this.wallet,
      recipient: addEstimate.toAddress,
      assetAmount: addAssetAmount,
      memo: addEstimate.memo,
    })
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
   * @param wallet - wallet to execute the transaction
   * @param withdrawParams - params needed for withdraw
   * @returns
   */
  public async withdrawSaver(withdrawParams: SaversWithdraw): Promise<TxSubmitted> {
    const withdrawEstimate = await this.thorchainQuery.estimateWithdrawSaver(withdrawParams)
    if (withdrawEstimate.errors.length > 0) throw Error(`${withdrawEstimate.errors}`)

    return ThorchainAction.makeAction({
      wallet: this.wallet,
      recipient: withdrawEstimate.toAddress,
      assetAmount: withdrawEstimate.dustAmount,
      memo: withdrawEstimate.memo,
    })
  }

  /**
   *
   * @param wallet - wallet needed to execute transaction
   * @param loanOpenParams - params needed to open the loan
   * @returns - submitted tx
   */
  public async addLoan(loanOpenParams: LoanOpenParams): Promise<TxSubmitted> {
    const loanOpen: LoanOpenQuote = await this.thorchainQuery.getLoanQuoteOpen(loanOpenParams)
    if (loanOpen.errors.length > 0) throw Error(`${loanOpen.errors}`)

    return ThorchainAction.makeAction({
      wallet: this.wallet,
      memo: loanOpen.memo as string,
      recipient: loanOpen.inboundAddress as string,
      assetAmount: loanOpenParams.amount,
    })
  }

  /**
   *
   * @param wallet - wallet to execute the transaction
   * @param loanCloseParams - params needed for withdrawing the loan
   * @returns
   */
  public async withdrawLoan(loanCloseParams: LoanCloseParams): Promise<TxSubmitted> {
    const withdrawLoan = await this.thorchainQuery.getLoanQuoteClose(loanCloseParams)
    if (withdrawLoan.errors.length > 0) throw Error(`${withdrawLoan.errors}`)

    return ThorchainAction.makeAction({
      wallet: this.wallet,
      memo: withdrawLoan.memo as string,
      recipient: withdrawLoan.inboundAddress as string,
      assetAmount: loanCloseParams.amount,
    })
  }

  /**
   * Get all Thornames and its data associated owned by an address
   * @param address - address
   * @returns thornames data
   */
  public async getThornamesByAddress(address: string) {
    return this.thorchainQuery.thorchainCache.midgardQuery.midgardCache.midgard.getTHORNameReverseLookup(address)
  }
}
