import { Client as AvaxClient, defaultAvaxParams } from '@xchainjs/xchain-avax'
import { Client as BnbClient } from '@xchainjs/xchain-binance'
import { Client as BtcClient, defaultBTCParams as defaultBtcParams } from '@xchainjs/xchain-bitcoin'
import { Client as BchClient, defaultBchParams } from '@xchainjs/xchain-bitcoincash'
import { Client as BscClient, defaultBscParams } from '@xchainjs/xchain-bsc'
import { Network } from '@xchainjs/xchain-client'
import { Client as GaiaClient } from '@xchainjs/xchain-cosmos'
import { Client as DogeClient, defaultDogeParams } from '@xchainjs/xchain-doge'
import { Client as EthClient, defaultEthParams } from '@xchainjs/xchain-ethereum'
import { MAX_APPROVAL } from '@xchainjs/xchain-evm'
import { Client as LtcClient, defaultLtcParams } from '@xchainjs/xchain-litecoin'
import {
  AssetRuneNative,
  Client as ThorClient,
  RUNE_DECIMAL,
  THORChain,
  defaultClientConfig as defaultThorParams,
} from '@xchainjs/xchain-thorchain'
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
  RegisterTHORName,
  SaversPosition,
  SaversWithdraw,
  ThorchainQuery,
  TxDetails,
  UpdateTHORName,
  WithdrawLiquidityPosition,
  getSaver,
} from '@xchainjs/xchain-thorchain-query'
import {
  Asset,
  AssetCryptoAmount,
  CryptoAmount,
  TokenAsset,
  assetToString,
  baseAmount,
  isSynthAsset,
} from '@xchainjs/xchain-util'
import { Wallet } from '@xchainjs/xchain-wallet'

import { ThorchainAction } from './thorchain-action'
import { AddLiquidity, ApproveParams, IsApprovedParams, QuoteTHORName, TxSubmitted, WithdrawLiquidity } from './types'
import { isProtocolERC20Asset, isTokenCryptoAmount, validateAddress } from './utils'

/**
 * THORChain Class for interacting with THORChain.
 * Recommended main class to use for swapping with THORChain
 * Has access to Midgard and THORNode data
 */
export class ThorchainAMM {
  private thorchainQuery: ThorchainQuery
  private wallet: Wallet

  /**
   * Constructor to create a ThorchainAMM instance
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
   * * Provides an estimate for a swap based on the given swap details.
   * Checks the parameters for errors before attempting to retrieve the estimate.
   * Utilizes current pool data to calculate inbound and outbound fees, affiliate fees,
   * and the expected wait time for the swap (inbound and outbound).
   * @param params Parameters for the swap, including the amount to swap.

   * @returns The estimated swap details.
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
    streamingInterval,
    streamingQuantity,
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
      streamingInterval,
      streamingQuantity,
    })
    // Add any validation errors to the estimate
    estimate.txEstimate.errors.push(...errors)
    estimate.txEstimate.canSwap = estimate.txEstimate.errors.length === 0
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
    streamingInterval,
    streamingQuantity,
  }: QuoteSwapParams): Promise<string[]> {
    const errors: string[] = []

    if (
      destinationAddress &&
      !validateAddress(
        this.thorchainQuery.thorchainCache.midgardQuery.midgardCache.midgard.network,
        isSynthAsset(destinationAsset) ? THORChain : destinationAsset.chain,
        destinationAddress,
      )
    ) {
      errors.push(`destinationAddress ${destinationAddress} is not a valid address`)
    }

    if (affiliateAddress) {
      const isThorAddress = validateAddress(
        this.thorchainQuery.thorchainCache.midgardQuery.midgardCache.midgard.network,
        THORChain,
        affiliateAddress,
      )
      const isThorname =
        !!(await this.thorchainQuery.thorchainCache.midgardQuery.midgardCache.midgard.getTHORNameDetails(
          affiliateAddress,
        ))
      if (!(isThorAddress || isThorname))
        errors.push(`affiliateAddress ${affiliateAddress} is not a valid THOR address`)
    }

    if (affiliateBps && (affiliateBps < 0 || affiliateBps > 10000)) {
      errors.push(`affiliateBps ${affiliateBps} out of range [0 - 10000]`)
    }

    if (streamingInterval && streamingInterval < 0) {
      errors.push(`streamingInterval ${streamingInterval} can not be lower than zero`)
    }

    if (streamingQuantity && streamingQuantity < 0) {
      errors.push(`streamingQuantity ${streamingQuantity} can not be lower than zero`)
    }

    if (isProtocolERC20Asset(fromAsset) && fromAddress) {
      if (!isTokenCryptoAmount(amount)) {
        errors.push(`${assetToString(amount.asset)} is not Token asset amount`)
      } else {
        const approveErrors = await this.isRouterApprovedToSpend({
          asset: fromAsset,
          address: fromAddress,
          amount,
        })
        errors.push(...approveErrors)
      }
    }

    return errors
  }

  /**
   * Conducts a swap with the given inputs. This method should be called after estimateSwap() to ensure the swap is valid.
   *
   * @param wallet - The wallet to use for the swap.
   * @param params - The swap parameters.
   * @returns {SwapSubmitted} - The transaction hash, URL of BlockExplorer, and expected wait time.
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
    streamingInterval,
    streamingQuantity,
  }: QuoteSwapParams): Promise<TxSubmitted> {
    // Retrieve swap details from ThorchainQuery to ensure validity
    const txDetails = await this.thorchainQuery.quoteSwap({
      fromAsset,
      fromAddress,
      amount,
      destinationAsset,
      destinationAddress,
      affiliateAddress,
      affiliateBps,
      toleranceBps,
      streamingInterval,
      streamingQuantity,
    })
    if (!txDetails.txEstimate.canSwap) {
      throw Error(txDetails.txEstimate.errors.join('\n'))
    }
    // Execute the swap using Thorchain action
    return ThorchainAction.makeAction({
      wallet: this.wallet,
      assetAmount: amount,
      memo: txDetails.memo,
      recipient: txDetails.toAddress,
    })
  }

  /**
   * Approve the Thorchain router to spend a certain amount in the asset chain.
   * @param {ApproveParams} approveParams Parameters for approving the router to spend
   * @returns {Promise<TxSubmitted>} Transaction hash and URL
   */
  public async approveRouterToSpend({ asset, amount }: ApproveParams): Promise<TxSubmitted> {
    // Get inbound details for the asset chain
    const inboundDetails = await this.thorchainQuery.getChainInboundDetails(asset.chain)
    if (!inboundDetails.router) throw Error(`Unknown router address for ${asset.chain}`)
    // Perform approval
    const hash = await this.wallet.approve(
      asset,
      amount?.baseAmount ||
        baseAmount(
          MAX_APPROVAL.toString(),
          await this.thorchainQuery.thorchainCache.midgardQuery.getDecimalForAsset(asset),
        ),
      inboundDetails.router,
    )
    // Return transaction hash and URL
    return {
      hash,
      url: await this.wallet.getExplorerTxUrl(asset.chain, hash),
    }
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
   * Withdraws liquidity from a position.
   * @param params - The wallet to perform the transaction.
   * @return - The array of transaction submissions.
   */
  public async withdrawLiquidityPosition(params: WithdrawLiquidityPosition): Promise<TxSubmitted[]> {
    // Caution Dust Limits: BTC, BCH, LTC chains: 10k sats; DOGE: 1m Sats; ETH: 0 wei; THOR: 0 RUNE.
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
   * Estimates adding to a saver.
   * @param addAssetAmount The amount to add to the saver.
   * @returns The estimated addition to the saver object.
   */
  public async estimateAddSaver(addAssetAmount: CryptoAmount<Asset | TokenAsset>): Promise<EstimateAddSaver> {
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
  public async addSaver(addAssetAmount: CryptoAmount<Asset | TokenAsset>): Promise<TxSubmitted> {
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
   * Withdraws assets from a saver.
   * @param withdrawParams - The parameters for withdrawing from the saver.
   * @returns The submitted transaction.
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
   * @param loanOpenParams - The parameters for opening the loan.
   * @returns - The submitted transaction.
   */
  public async addLoan(loanOpenParams: LoanOpenParams): Promise<TxSubmitted> {
    const loanOpen: LoanOpenQuote = await this.thorchainQuery.getLoanQuoteOpen(loanOpenParams)
    if (loanOpen.errors.length > 0) throw Error(`${loanOpen.errors}`)

    return ThorchainAction.makeAction({
      wallet: this.wallet,
      memo: `${loanOpen.memo}`,
      recipient: `${loanOpen.inboundAddress}`,
      assetAmount: loanOpenParams.amount,
    })
  }

  /**
   * Withdraws assets from a loan.
   * @param loanCloseParams - The parameters for withdrawing from the loan.
   * @returns The submitted transaction.
   */
  public async withdrawLoan(loanCloseParams: LoanCloseParams): Promise<TxSubmitted> {
    const withdrawLoan = await this.thorchainQuery.getLoanQuoteClose(loanCloseParams)
    // Checks if there are any errors in the quote
    if (withdrawLoan.errors.length > 0) throw Error(`${withdrawLoan.errors}`)

    return ThorchainAction.makeAction({
      wallet: this.wallet,
      memo: `${withdrawLoan.memo}`,
      recipient: `${withdrawLoan.inboundAddress}`,
      assetAmount: loanCloseParams.amount,
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

  /**
   * Estimate the cost of a THORName registration
   * @param {RegisterTHORName} params Params to make the registration
   * @returns {QuoteTHORName} Memo to make the registration and the estimation of the operation
   */
  public async estimateTHORNameRegistration(params: RegisterTHORName): Promise<QuoteTHORName> {
    const errors: string[] = []

    if (
      !validateAddress(
        this.thorchainQuery.thorchainCache.midgardQuery.midgardCache.midgard.network,
        params.chain,
        params.chainAddress,
      )
    ) {
      errors.push(`Invalid address ${params.chainAddress} for ${params.chain} chain`)
    }

    if (
      !validateAddress(
        this.thorchainQuery.thorchainCache.midgardQuery.midgardCache.midgard.network,
        THORChain,
        params.owner,
      )
    ) {
      errors.push(`Invalid owner ${params.owner} due it is not a THORChain address`)
    }

    if (errors.length) {
      return {
        memo: '',
        errors,
        value: new AssetCryptoAmount(baseAmount(0, RUNE_DECIMAL), AssetRuneNative),
        allowed: false,
      }
    }

    try {
      const estimated = await this.thorchainQuery.estimateThorname({ ...params })

      return {
        ...estimated,
        allowed: true,
        errors: [],
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      return {
        memo: '',
        errors: ['message' in e ? e.message : `Unknown error: ${e}`],
        value: new AssetCryptoAmount(baseAmount(0, RUNE_DECIMAL), AssetRuneNative),
        allowed: false,
      }
    }
  }

  /**
   * Estimate the cost of an update of a THORName
   * @param {QuoteTHORNameParams} params Params to make the update
   * @returns {QuoteTHORName} Memo to make the update and the estimation of the operation
   */
  public async estimateTHORNameUpdate(params: UpdateTHORName): Promise<QuoteTHORName> {
    const errors: string[] = []

    if ((params.chain && !params.chainAddress) || (!params.chain && params.chainAddress)) {
      errors.push(`Alias not provided correctly`)
    }

    if (
      params.chain &&
      params.chainAddress &&
      !validateAddress(
        this.thorchainQuery.thorchainCache.midgardQuery.midgardCache.midgard.network,
        params.chain,
        params.chainAddress,
      )
    ) {
      errors.push(`Invalid alias ${params.chainAddress} for ${params.chain} chain`)
    }

    if (
      params.owner &&
      !validateAddress(
        this.thorchainQuery.thorchainCache.midgardQuery.midgardCache.midgard.network,
        THORChain,
        params.owner,
      )
    ) {
      errors.push(`Invalid owner ${params.owner} due it is not a THORChain address`)
    }

    if (errors.length) {
      return {
        memo: '',
        errors,
        value: new AssetCryptoAmount(baseAmount(0, RUNE_DECIMAL), AssetRuneNative),
        allowed: false,
      }
    }

    try {
      const estimated = await this.thorchainQuery.estimateThorname({ ...params, isUpdate: true })

      return {
        ...estimated,
        allowed: true,
        errors: [],
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      return {
        memo: '',
        errors: ['message' in e ? e.message : `Unknown error: ${e}`],
        value: new CryptoAmount(baseAmount(0, RUNE_DECIMAL), AssetRuneNative),
        allowed: false,
      }
    }
  }

  /**
   * Register a THORName
   * @param {RegisterTHORName} params Params to make the registration
   * @returns {TxSubmitted} Transaction made to register the THORName
   */
  public async registerTHORName(params: RegisterTHORName): Promise<TxSubmitted> {
    const quote = await this.estimateTHORNameRegistration(params)

    if (!quote.allowed) throw Error(`Can not register THORName. ${quote.errors.join(' ')}`)

    return ThorchainAction.makeAction({
      wallet: this.wallet,
      assetAmount: quote.value,
      memo: quote.memo,
    })
  }

  /**
   * Update a THORName
   * @param {UpdateTHORName} params Params to make the update
   * @returns {TxSubmitted} Transaction made to update the THORName
   */
  public async updateTHORName(params: UpdateTHORName): Promise<TxSubmitted> {
    const quote = await this.estimateTHORNameUpdate(params)

    if (!quote.allowed) throw Error(`Can not update THORName. ${quote.errors.join(' ')}`)

    return ThorchainAction.makeAction({
      wallet: this.wallet,
      assetAmount: quote.value,
      memo: quote.memo,
    })
  }
}
