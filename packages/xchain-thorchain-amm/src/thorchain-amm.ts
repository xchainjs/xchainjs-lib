import { Client as AvaxClient, defaultAvaxParams } from '@xchainjs/xchain-avax'
import { Client as BaseClient, defaultBaseParams } from '@xchainjs/xchain-base'
import { Client as XRPClient, defaultXRPParams } from '@xchainjs/xchain-ripple'
import { Client as BtcClient, defaultBTCParams as defaultBtcParams } from '@xchainjs/xchain-bitcoin'
import { Client as BchClient, defaultBchParams } from '@xchainjs/xchain-bitcoincash'
import { Client as BscClient, defaultBscParams } from '@xchainjs/xchain-bsc'
import { Client as SOLClient, defaultSolanaParams } from '@xchainjs/xchain-solana'
import { Network } from '@xchainjs/xchain-client'
import { Client as GaiaClient } from '@xchainjs/xchain-cosmos'
import { Client as DogeClient, defaultDogeParams } from '@xchainjs/xchain-doge'
import { Client as EthClient, defaultEthParams } from '@xchainjs/xchain-ethereum'
import { MAX_APPROVAL } from '@xchainjs/xchain-evm'
import { Client as LtcClient, defaultLtcParams } from '@xchainjs/xchain-litecoin'
import { Client as TronClient, defaultTRONParams } from '@xchainjs/xchain-tron'
import { Client as ZecClient, defaultZECParams } from '@xchainjs/xchain-zcash'
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
  EstimateWithdrawLP,
  InboundDetail,
  LoanCloseParams,
  LoanCloseQuote,
  LoanOpenParams,
  LoanOpenQuote,
  QuoteSwapParams,
  RegisterTHORName,
  ThorchainQuery,
  TxDetails,
  UpdateTHORName,
  WithdrawLiquidityPosition,
} from '@xchainjs/xchain-thorchain-query'
import {
  AssetCryptoAmount,
  CryptoAmount,
  assetToString,
  baseAmount,
  eqAsset,
  isSecuredAsset,
  isSynthAsset,
  isTradeAsset,
} from '@xchainjs/xchain-util'
import { Wallet } from '@xchainjs/xchain-wallet'

import { ThorchainAction } from './thorchain-action'
import {
  AddLiquidity,
  AddToTradeAccount,
  AddToTradeAccountParams,
  ApproveParams,
  DepositToRunePoolParams,
  EstimateDepositToRunePool,
  EstimateWithdrawFromRunePool,
  IsApprovedParams,
  QuoteTHORName,
  TxSubmitted,
  WithdrawFromRunePoolParams,
  WithdrawFromTradeAccount,
  WithdrawFromTradeAccountParams,
  WithdrawLiquidity,
} from './types'
import { isProtocolERC20Asset, isTokenCryptoAmount, validateAddress } from './utils'

export class ThorchainAMM {
  private thorchainQuery: ThorchainQuery
  private wallet: Wallet

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
      THOR: new ThorClient({ ...defaultThorParams, network: Network.Mainnet }),
      BASE: new BaseClient({ ...defaultBaseParams, network: Network.Mainnet }),
      XRP: new XRPClient({ ...defaultXRPParams, network: Network.Mainnet }),
      SOL: new SOLClient({ ...defaultSolanaParams, network: Network.Mainnet }),
      TRON: new TronClient({ ...defaultTRONParams, network: Network.Mainnet }),
      ZEC: new ZecClient({ ...defaultZECParams, network: Network.Mainnet }),
    }),
  ) {
    this.thorchainQuery = thorchainQuery
    this.wallet = wallet
  }

  public async estimateSwap({
    fromAddress,
    fromAsset,
    amount,
    destinationAsset,
    destinationAddress,
    affiliateAddress,
    affiliateBps,
    affiliates,
    toleranceBps,
    liquidityToleranceBps,
    streamingInterval,
    streamingQuantity,
  }: QuoteSwapParams): Promise<TxDetails> {
    const errors: string[] = await this.validateSwap({
      fromAddress,
      fromAsset,
      amount,
      destinationAsset,
      destinationAddress,
      affiliateAddress,
      affiliateBps,
      affiliates,
      streamingInterval,
      streamingQuantity,
    })
    const estimate = await this.thorchainQuery.quoteSwap({
      fromAsset,
      amount,
      destinationAsset,
      destinationAddress,
      affiliateAddress,
      affiliateBps,
      affiliates,
      toleranceBps,
      liquidityToleranceBps,
      streamingInterval,
      streamingQuantity,
    })
    estimate.txEstimate.errors.push(...errors)
    estimate.txEstimate.canSwap = estimate.txEstimate.errors.length === 0
    return estimate
  }

  public async validateSwap({
    fromAsset,
    fromAddress,
    destinationAsset,
    destinationAddress,
    amount,
    affiliateAddress,
    affiliateBps,
    affiliates,
    streamingInterval,
    streamingQuantity,
  }: QuoteSwapParams): Promise<string[]> {
    const errors: string[] = []

    if (
      destinationAddress &&
      !validateAddress(
        this.thorchainQuery.thorchainCache.midgardQuery.midgardCache.midgard.network,
        isSynthAsset(destinationAsset) || isTradeAsset(destinationAsset) || isSecuredAsset(destinationAsset)
          ? THORChain
          : destinationAsset.chain,
        destinationAddress,
      )
    ) {
      errors.push(`destinationAddress ${destinationAddress} is not a valid address`)
    }

    if (!isTradeAsset(fromAsset) && !eqAsset(fromAsset, AssetRuneNative) && isTradeAsset(destinationAsset)) {
      errors.push(
        'Can not make swap from non trade asset or non Rune asset to trade asset. Use addToTrade (TRADE+) operation',
      )
    }

    if (isTradeAsset(fromAsset) && !isTradeAsset(destinationAsset) && !eqAsset(destinationAsset, AssetRuneNative)) {
      errors.push(
        'Can not make swap from trade asset to non trade asset or non Rune asset. Use withdrawFromTrade (TRADE-) operation',
      )
    }

    // Reject mixing the singular form with the multi-affiliate array — the protocol's quote
    // endpoint reads them from the same query params, so passing both produces ambiguous wire output.
    if (affiliates && (affiliateAddress || affiliateBps !== undefined)) {
      errors.push('affiliates is mutually exclusive with affiliateAddress / affiliateBps; pass one form, not both')
    }

    if (affiliates) {
      if (affiliates.length === 0) {
        errors.push('affiliates array is empty; omit the field or include at least one entry')
      }
      // THORChain consensus caps the affiliate count at 5 per swap (MultipleAffiliatesMaxCount).
      if (affiliates.length > 5) {
        errors.push(`affiliates count ${affiliates.length} exceeds THORChain maximum of 5`)
      }
      for (const a of affiliates) {
        const valid = await this.isThorAffiliateAddress(a.address)
        if (!valid) errors.push(`affiliate address ${a.address} is not a valid THOR address or THORName`)
        if (a.bps < 0 || a.bps > 1000) {
          errors.push(`affiliate bps ${a.bps} for ${a.address} out of range [0 - 1000]`)
        }
      }
    } else if (affiliateAddress) {
      const valid = await this.isThorAffiliateAddress(affiliateAddress)
      if (!valid) errors.push(`affiliateAddress ${affiliateAddress} is not a valid THOR address`)
    }

    // THORChain caps single-affiliate bps at 1000 (10%); previous limit of 10000 was wider than the protocol accepts.
    if (affiliateBps !== undefined && (affiliateBps < 0 || affiliateBps > 1000)) {
      errors.push(`affiliateBps ${affiliateBps} out of range [0 - 1000]`)
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

  // THOR bech32 address or registered THORName
  private async isThorAffiliateAddress(identifier: string): Promise<boolean> {
    const network = this.thorchainQuery.thorchainCache.midgardQuery.midgardCache.midgard.network
    if (validateAddress(network, THORChain, identifier)) return true
    try {
      const thorname = await this.thorchainQuery.thorchainCache.midgardQuery.midgardCache.midgard.getTHORNameDetails(
        identifier,
      )
      return !!thorname
    } catch {
      return false
    }
  }

  public async doSwap(params: QuoteSwapParams): Promise<TxSubmitted> {
    const txDetails = await this.estimateSwap(params)
    if (!txDetails.txEstimate.canSwap) {
      throw Error(txDetails.txEstimate.errors.join('\n'))
    }
    return ThorchainAction.makeAction({
      wallet: this.wallet,
      assetAmount: params.amount,
      memo: txDetails.memo,
      recipient: txDetails.toAddress,
    })
  }

  public async approveRouterToSpend({ asset, amount }: ApproveParams): Promise<TxSubmitted> {
    const inboundDetails = await this.thorchainQuery.getChainInboundDetails(asset.chain)
    if (!inboundDetails.router) throw Error(`Unknown router address for ${asset.chain}`)
    const hash = await this.wallet.approve(
      asset,
      amount?.baseAmount ||
        baseAmount(
          MAX_APPROVAL.toString(),
          await this.thorchainQuery.thorchainCache.midgardQuery.getDecimalForAsset(asset),
        ),
      inboundDetails.router,
    )
    return {
      hash,
      url: await this.wallet.getExplorerTxUrl(asset.chain, hash),
    }
  }

  public async isRouterApprovedToSpend({ asset, amount, address }: IsApprovedParams): Promise<string[]> {
    const errors: string[] = []
    if (!isProtocolERC20Asset(asset)) {
      errors.push('Asset should be ERC20')
      return errors
    }

    const inboundDetails = await this.thorchainQuery.getChainInboundDetails(asset.chain)
    if (!inboundDetails.router) throw Error(`Unknown router address for ${asset.chain}`)

    const isApprovedResult = await this.wallet.isApproved(asset, amount.baseAmount, address, inboundDetails.router)

    if (!isApprovedResult) errors.push('Thorchain router has not been approved to spend this amount')

    return errors
  }

  public async estimateAddLiquidity(params: AddliquidityPosition): Promise<EstimateAddLP> {
    return await this.thorchainQuery.estimateAddLP(params)
  }

  public async estimateWithdrawLiquidity(params: WithdrawLiquidityPosition): Promise<EstimateWithdrawLP> {
    return await this.thorchainQuery.estimateWithdrawLP(params)
  }

  // If there is no existing liquidity position, it is created automatically.
  public async addLiquidityPosition(params: AddliquidityPosition): Promise<TxSubmitted[]> {
    const checkLPAdd = await this.thorchainQuery.estimateAddLP(params)
    if (!checkLPAdd.canAdd) throw Error(`${checkLPAdd.errors.join(', ')}`)

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
      txSubmitted.push(
        await ThorchainAction.makeAction({
          wallet: this.wallet,
          memo: `+:${checkLPAdd.assetPool}`,
          assetAmount: addLiquidity.rune,
        }),
      )
      return txSubmitted
    }
  }

  public async withdrawLiquidityPosition(params: WithdrawLiquidityPosition): Promise<TxSubmitted[]> {
    // A memo below the chain dust threshold is ignored, so the carrier is at least that amount.
    const withdrawParams = await this.thorchainQuery.estimateWithdrawLP(params)
    const assetCarrier = withdrawParams.inbound.minToSend.asset.gt(withdrawParams.inbound.fees.asset)
      ? withdrawParams.inbound.minToSend.asset
      : withdrawParams.inbound.fees.asset

    const withdrawLiquidity: WithdrawLiquidity = {
      assetFee: assetCarrier,
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

  public async getLoanQuoteOpen(loanOpenParams: LoanOpenParams): Promise<LoanOpenQuote> {
    return await this.thorchainQuery.getLoanQuoteOpen(loanOpenParams)
  }

  public async getLoanQuoteClose(loanCloseParams: LoanCloseParams): Promise<LoanCloseQuote> {
    return await this.thorchainQuery.getLoanQuoteClose(loanCloseParams)
  }

  public async addLoan(loanOpenParams: LoanOpenParams): Promise<TxSubmitted> {
    const loanOpen: LoanOpenQuote = await this.thorchainQuery.getLoanQuoteOpen(loanOpenParams)
    if (loanOpen.errors.length > 0) throw Error(loanOpen.errors.join(', '))

    return ThorchainAction.makeAction({
      wallet: this.wallet,
      memo: `${loanOpen.memo}`,
      recipient: `${loanOpen.inboundAddress}`,
      assetAmount: loanOpenParams.amount,
    })
  }

  public async withdrawLoan(loanCloseParams: LoanCloseParams): Promise<TxSubmitted> {
    const withdrawLoan = await this.thorchainQuery.getLoanQuoteClose(loanCloseParams)
    if (withdrawLoan.errors.length > 0) throw Error(withdrawLoan.errors.join(', '))

    return ThorchainAction.makeAction({
      wallet: this.wallet,
      memo: `${withdrawLoan.memo}`,
      recipient: `${withdrawLoan.inboundAddress}`,
      assetAmount: loanCloseParams.amount,
    })
  }

  public async getThornamesByAddress(address: string) {
    return this.thorchainQuery.thorchainCache.midgardQuery.midgardCache.midgard.getTHORNameReverseLookup(address)
  }

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

  public async registerTHORName(params: RegisterTHORName): Promise<TxSubmitted> {
    const quote = await this.estimateTHORNameRegistration(params)

    if (!quote.allowed) throw Error(`Can not register THORName. ${quote.errors.join(' ')}`)

    return ThorchainAction.makeAction({
      wallet: this.wallet,
      assetAmount: quote.value,
      memo: quote.memo,
    })
  }

  public async updateTHORName(params: UpdateTHORName): Promise<TxSubmitted> {
    const quote = await this.estimateTHORNameUpdate(params)

    if (!quote.allowed) throw Error(`Can not update THORName. ${quote.errors.join(' ')}`)

    return ThorchainAction.makeAction({
      wallet: this.wallet,
      assetAmount: quote.value,
      memo: quote.memo,
    })
  }

  public async estimateAddToTradeAccount({ amount, address }: AddToTradeAccountParams): Promise<AddToTradeAccount> {
    const errors: string[] = []

    if (
      !validateAddress(this.thorchainQuery.thorchainCache.midgardQuery.midgardCache.midgard.network, THORChain, address)
    ) {
      errors.push('Invalid trade account address')
    }

    let inboundDetails: InboundDetail | undefined
    try {
      inboundDetails = await this.thorchainQuery.getChainInboundDetails(amount.asset.chain)
    } catch {
      errors.push(`Can not get inbound address for ${amount.asset.chain}`)
    }

    if (errors.length) {
      return {
        allowed: false,
        errors,
        value: new CryptoAmount(baseAmount(0, amount.assetAmount.decimal), amount.asset),
        memo: '',
        toAddress: '',
      }
    }

    return {
      toAddress: inboundDetails ? inboundDetails.address : '',
      memo: `TRADE+:${address}`,
      value: amount,
      allowed: true,
      errors,
    }
  }

  public async addToTradeAccount({ amount, address }: AddToTradeAccountParams): Promise<TxSubmitted> {
    const quote = await this.estimateAddToTradeAccount({ amount, address })

    if (!quote.allowed) throw Error(`Can not add to trade account. ${quote.errors.join(' ')}`)

    return ThorchainAction.makeAction({
      wallet: this.wallet,
      assetAmount: quote.value,
      memo: quote.memo,
      recipient: quote.toAddress,
    })
  }

  public async estimateWithdrawFromTradeAccount({
    amount,
    address,
  }: WithdrawFromTradeAccountParams): Promise<WithdrawFromTradeAccount> {
    const errors: string[] = []

    if (
      !validateAddress(
        this.thorchainQuery.thorchainCache.midgardQuery.midgardCache.midgard.network,
        amount.asset.chain,
        address,
      )
    ) {
      errors.push('Invalid address to send the withdraw')
    }

    if (errors.length) {
      return {
        allowed: false,
        errors,
        value: new CryptoAmount(baseAmount(0, amount.assetAmount.decimal), amount.asset),
        memo: '',
      }
    }

    return {
      memo: `TRADE-:${address}`,
      value: amount,
      allowed: true,
      errors,
    }
  }

  public async withdrawFromTradeAccount({ amount, address }: WithdrawFromTradeAccountParams): Promise<TxSubmitted> {
    const quote = await this.estimateWithdrawFromTradeAccount({ amount, address })

    if (!quote.allowed) throw Error(`Can not withdraw from trade account. ${quote.errors.join(' ')}`)

    return ThorchainAction.makeAction({
      wallet: this.wallet,
      assetAmount: quote.value,
      memo: quote.memo,
    })
  }
  public async estimateDepositToRunePool({ amount }: DepositToRunePoolParams): Promise<EstimateDepositToRunePool> {
    const constants = await this.thorchainQuery.thorchainCache.thornode.getTcConstants()
    return {
      allowed: true,
      maturityBlocks: Number(constants['RUNEPoolDepositMaturityBlocks']),
      amount,
      errors: [],
      memo: 'POOL+',
    }
  }

  public async depositToRunePool(params: DepositToRunePoolParams): Promise<TxSubmitted> {
    const quote = await this.estimateDepositToRunePool(params)

    if (!quote.allowed) throw Error(`Can not deposit to Rune pool. ${quote.errors.join(' ')}`)

    return ThorchainAction.makeAction({
      wallet: this.wallet,
      assetAmount: quote.amount,
      memo: quote.memo,
    })
  }

  public async estimateWithdrawFromRunePool({
    withdrawBps,
    affiliate,
    feeBps,
  }: WithdrawFromRunePoolParams): Promise<EstimateWithdrawFromRunePool> {
    const errors: string[] = []

    if (withdrawBps <= 0 || withdrawBps > 10000) {
      errors.push('withdrawBps out of range. Range 0-10000')
    }

    if (affiliate) {
      if (
        !validateAddress(
          this.thorchainQuery.thorchainCache.midgardQuery.midgardCache.midgard.network,
          THORChain,
          affiliate,
        ) &&
        !(await this.isTHORName(affiliate))
      ) {
        errors.push('Invalid affiliate. Affiliate must be a THORName or THOR address')
      }
      if (!feeBps || feeBps <= 0 || feeBps > 1000) {
        errors.push('feeBps out of range. Range 0-1000')
      }
    }

    if (errors.length) {
      return {
        amount: new AssetCryptoAmount(baseAmount(0), AssetRuneNative),
        memo: '',
        allowed: false,
        errors,
      }
    }

    return {
      amount: new AssetCryptoAmount(baseAmount(0), AssetRuneNative),
      memo: `POOL-:${withdrawBps}:${affiliate || ''}:${affiliate ? feeBps : ''}`,
      allowed: true,
      errors,
    }
  }

  public async withdrawFromRunePool(params: WithdrawFromRunePoolParams): Promise<TxSubmitted> {
    const quote = await this.estimateWithdrawFromRunePool(params)

    if (!quote.allowed) throw Error(`Can not withdraw from Rune pool. ${quote.errors.join(' ')}`)

    return ThorchainAction.makeAction({
      wallet: this.wallet,
      assetAmount: quote.amount,
      memo: quote.memo,
    })
  }

  private async isTHORName(thorname: string): Promise<boolean> {
    const details = await this.thorchainQuery.getThornameDetails(thorname)
    return details.owner !== ''
  }
}
