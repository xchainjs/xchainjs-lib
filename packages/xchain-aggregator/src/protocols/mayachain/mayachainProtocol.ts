import { AssetCacao, MAYAChain } from '@xchainjs/xchain-mayachain'
import { ApproveParams, IsApprovedParams, MayachainAMM } from '@xchainjs/xchain-mayachain-amm'
import { MayachainQuery } from '@xchainjs/xchain-mayachain-query'
import {
  AnyAsset,
  Chain,
  CryptoAmount,
  assetFromStringEx,
  eqAsset,
  isSynthAsset,
  isTradeAsset,
} from '@xchainjs/xchain-util'
import { Wallet } from '@xchainjs/xchain-wallet'

import {
  EarnPosition,
  EarnProduct,
  IProtocol,
  ProtocolConfig,
  QuoteAddToEarn,
  QuoteSwap,
  QuoteSwapParams,
  SwapHistory,
  SwapHistoryParams,
  TxSubmitted,
} from '../../types'

import { CompatibleAsset } from './types'

export class MayachainProtocol implements IProtocol {
  public readonly name = 'Mayachain'
  private mayachainQuery: MayachainQuery
  private mayachainAmm: MayachainAMM
  private configuration: ProtocolConfig | undefined
  private wallet?: Wallet

  constructor(configuration?: ProtocolConfig) {
    this.mayachainQuery = new MayachainQuery()
    this.mayachainAmm = new MayachainAMM(this.mayachainQuery, configuration?.wallet)
    this.configuration = configuration
    this.wallet = configuration?.wallet
  }

  /**
   * Aprove tx for ERC-20
   * @param {ApproveParams} approveParams params to approve tx
   * @returns {TxSubmitted} Transaction hash and URL of the swap
   */
  async approveRouterToSpend(params: ApproveParams): Promise<TxSubmitted> {
    const { asset, amount } = params
    const txSubmitted = await this.mayachainAmm.approveRouterToSpend({ asset, amount })
    await this.wallet?.awaitTxConfirmed(asset.chain, txSubmitted.hash)
    return txSubmitted
  }

  /**
   * Check if tx is approved for ERC-20
   * @param {IsApprovedParams} isApprovedParams params to check if tx is approved
   * @returns {string[]} array of errors
   */
  async shouldBeApproved(params: IsApprovedParams): Promise<boolean> {
    const { asset, amount, address } = params
    const errors = await this.mayachainAmm.isRouterApprovedToSpend({ asset, amount, address })
    return errors.some((error) => error === 'Maya router has not been approved to spend this amount')
  }

  /**
   * Check if an asset is supported in the protocol
   * @param {Asset} asset Asset to check if it is supported
   * @returns {boolean} True if the asset is supported, otherwise false
   */
  public async isAssetSupported(asset: AnyAsset): Promise<boolean> {
    if (isTradeAsset(asset)) return false
    if (eqAsset(asset, AssetCacao) || isSynthAsset(asset)) return true
    const pools = await this.mayachainQuery.getPools()
    return (
      pools.findIndex((pool) => pool.status === 'available' && eqAsset(asset, assetFromStringEx(pool.asset))) !== -1
    )
  }

  /**
   * Retrieve the supported chains by the protocol
   * @returns {Chain[]} the supported chains by the protocol
   */
  public async getSupportedChains(): Promise<Chain[]> {
    const inboundDetails = await this.mayachainQuery.getInboundDetails()
    return [MAYAChain, ...Object.values(inboundDetails).map((inboundAddress) => inboundAddress.chain)]
  }

  /**
   * Estimate swap by validating the swap parameters.
   *
   * @param {QuoteSwapParams} quoteSwapParams Swap parameters.
   * @returns {QuoteSwap} Quote swap result. If swap cannot be done, it returns an empty QuoteSwap with reasons.
   */
  public async estimateSwap(params: QuoteSwapParams): Promise<QuoteSwap> {
    const estimatedSwap = await this.mayachainAmm.estimateSwap({
      ...params,
      fromAsset: params.fromAsset as CompatibleAsset,
      destinationAsset: params.destinationAsset as CompatibleAsset,
      amount: params.amount as CryptoAmount<CompatibleAsset>,
      affiliateBps: this.configuration?.affiliateBps,
      affiliateAddress: this.configuration?.affiliateAddress,
    })
    return {
      protocol: this.name,
      toAddress: estimatedSwap.toAddress,
      memo: estimatedSwap.memo,
      expectedAmount: estimatedSwap.expectedAmount,
      dustThreshold: estimatedSwap.dustThreshold,
      fees: estimatedSwap.fees,
      totalSwapSeconds: estimatedSwap.inboundConfirmationSeconds || 0 + estimatedSwap.outboundDelaySeconds,
      slipBasisPoints: estimatedSwap.slipBasisPoints,
      canSwap: estimatedSwap.canSwap,
      errors: estimatedSwap.errors,
      warning: estimatedSwap.warning,
    }
  }

  /**
   * Perform a swap operation between assets.
   * @param {QuoteSwapParams} quoteSwapParams Swap parameters
   * @returns {TxSubmitted} Transaction hash and URL of the swap
   */
  public async doSwap(params: QuoteSwapParams): Promise<TxSubmitted> {
    return this.mayachainAmm.doSwap({
      ...params,
      fromAsset: params.fromAsset as CompatibleAsset,
      destinationAsset: params.destinationAsset as CompatibleAsset,
      amount: params.amount as CryptoAmount<CompatibleAsset>,
      affiliateBps: this.configuration?.affiliateBps,
      affiliateAddress: this.configuration?.affiliateAddress,
    })
  }

  /**
   * Get historical swaps
   * @param {Address[]} addresses Addresses of which return their swap history
   * @returns the swap history
   */
  public async getSwapHistory({ chainAddresses }: SwapHistoryParams): Promise<SwapHistory> {
    const swapHistory = await this.mayachainQuery.getSwapHistory({
      addresses: Array.from(new Set(chainAddresses.map((chainAddresses) => chainAddresses.address))),
    })
    return {
      count: swapHistory.count,
      swaps: swapHistory.swaps.map((swap) => {
        return { protocol: this.name, ...swap }
      }),
    }
  }

  /**
   * List supported earn products
   * @throws {Error} - Method not implemented.
   * @returns the earn products the protocol supports
   */
  public async listEarnProducts(): Promise<EarnProduct[]> {
    throw new Error('Method not implemented.')
  }

  /**
   * List earn positions
   * @throws {Error} - Method not implemented.
   * @returns the earn positions of the addresses in the earn products
   */
  public async listEarnPositions(): Promise<EarnPosition[]> {
    throw new Error('Method not implemented.')
  }

  public async estimateAddToEarnProduct(): Promise<QuoteAddToEarn> {
    throw new Error('Method not implemented.')
  }

  public async addToEarnProduct(): Promise<TxSubmitted> {
    throw new Error('Method not implemented.')
  }
}
